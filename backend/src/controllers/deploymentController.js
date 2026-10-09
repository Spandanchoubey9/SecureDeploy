
const pool = require("../config/database");
const crypto = require("node:crypto");

/*
|--------------------------------------------------------------------------
| Get all deployments
|--------------------------------------------------------------------------
*/

const getDeployments = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                d.id,
                d.branch,
                d.commit_hash,
                d.commit_message,
                d.environment,
                d.status,
                d.started_at,
                d.completed_at,
                d.created_at,
                u.name AS triggered_by_name
            FROM deployments d
            LEFT JOIN users u ON d.triggered_by = u.id
            ORDER BY d.created_at DESC
        `);

        res.json({
            count: result.rows.length,
            deployments: result.rows
        });
    } catch (error) {
        console.error("Get deployments error:", error.message);
        res.status(500).json({
            message: "Failed to load deployments"
        });
    }
};

/*
|--------------------------------------------------------------------------
| Create deployment and trigger Jenkins
|--------------------------------------------------------------------------
*/

const createDeployment = async (req, res) => {
    let deployment;

    try {
        const {
            branch,
            commit_hash,
            commit_message,
            environment
        } = req.body;

        const deploymentBranch = branch || "main";
        const deploymentEnvironment = environment || "production";

        const result = await pool.query(
            `
            INSERT INTO deployments
            (
                branch,
                commit_hash,
                commit_message,
                environment,
                status,
                triggered_by,
                started_at
            )
            VALUES ($1, $2, $3, $4, 'PENDING', $5, NULL)
            RETURNING *
            `,
            [
                deploymentBranch,
                commit_hash || null,
                commit_message || null,
                deploymentEnvironment,
                req.user.id
            ]
        );

        deployment = result.rows[0];

        // Preserve the authenticated user's audit record.
        await pool.query(
            `
            INSERT INTO audit_logs
            (user_id, action, resource, details)
            VALUES ($1, $2, $3, $4)
            `,
            [
                req.user.id,
                "CREATE",
                `deployment:${deployment.id}`,
                `Created deployment ${deployment.id} for ${deploymentBranch}`
            ]
        );

        const {
            JENKINS_URL,
            JENKINS_JOB_NAME,
            JENKINS_USERNAME,
            JENKINS_API_TOKEN
        } = process.env;

        if (
            !JENKINS_URL ||
            !JENKINS_JOB_NAME ||
            !JENKINS_USERNAME ||
            !JENKINS_API_TOKEN
        ) {
            await pool.query(
                `
                UPDATE deployments
                SET status = 'FAILED',
                    completed_at = CURRENT_TIMESTAMP
                WHERE id = $1
                `,
                [deployment.id]
            );

            return res.status(500).json({
                message: "Jenkins integration is not configured",
                deploymentId: deployment.id
            });
        }

        const credentials = Buffer.from(
            `${JENKINS_USERNAME}:${JENKINS_API_TOKEN}`
        ).toString("base64");

        const baseUrl = JENKINS_URL.replace(/\/+$/, "");

        const jobPath = JENKINS_JOB_NAME
            .split("/")
            .map(part => `job/${encodeURIComponent(part)}`)
            .join("/");

        // Retrieve the Jenkins CSRF crumb.
        const crumbResponse = await fetch(
            `${baseUrl}/crumbIssuer/api/json`,
            {
                headers: {
                    Authorization: `Basic ${credentials}`
                },
                signal: AbortSignal.timeout(10000)
            }
        );

        if (!crumbResponse.ok) {
            throw new Error(
                `Jenkins crumb request failed: HTTP ${crumbResponse.status}`
            );
        }

        const crumb = await crumbResponse.json();

        const parameters = new URLSearchParams({
            DEPLOYMENT_ID: String(deployment.id),
            DEPLOYMENT_BRANCH: deploymentBranch
        });

        const triggerResponse = await fetch(
            `${baseUrl}/${jobPath}/buildWithParameters?${parameters}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${credentials}`,
                    [crumb.crumbRequestField]: crumb.crumb
                },
                signal: AbortSignal.timeout(15000)
            }
        );

        if (triggerResponse.status !== 201) {
            throw new Error(
                `Jenkins rejected the build trigger: HTTP ${triggerResponse.status}`
            );
        }

        return res.status(201).json({
            message: "Deployment created and Jenkins build queued",
            deployment
        });
    } catch (error) {
        console.error("Create deployment error:", error.message);

        if (deployment?.id) {
            try {
                await pool.query(
                    `
                    UPDATE deployments
                    SET status = 'FAILED',
                        completed_at = CURRENT_TIMESTAMP
                    WHERE id = $1 AND status = 'PENDING'
                    `,
                    [deployment.id]
                );
            } catch (updateError) {
                console.error(
                    "Failed to update deployment status:",
                    updateError.message
                );
            }
        }

        return res.status(502).json({
            message: "Deployment was created, but Jenkins could not be triggered",
            deploymentId: deployment?.id
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get deployment by ID
|--------------------------------------------------------------------------
*/

const getDeploymentById = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                d.id,
                d.branch,
                d.commit_hash,
                d.commit_message,
                d.environment,
                d.status,
                d.started_at,
                d.completed_at,
                d.created_at,
                u.name AS triggered_by_name
            FROM deployments d
            LEFT JOIN users u ON d.triggered_by = u.id
            WHERE d.id = $1
            `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Deployment not found"
            });
        }

        return res.json({
            deployment: result.rows[0]
        });
    } catch (error) {
        console.error("Get deployment error:", error.message);
        return res.status(500).json({
            message: "Failed to load deployment"
        });
    }
};

/*
|--------------------------------------------------------------------------
| Update deployment status (authenticated user endpoint)
|--------------------------------------------------------------------------
*/

const updateDeploymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, commit_hash, commit_message } = req.body;

        const allowedStatuses = [
            "PENDING",
            "BUILDING",
            "SUCCESS",
            "FAILED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid deployment status"
            });
        }

        const result = await pool.query(
            `
            UPDATE deployments
            SET
                status = $1::varchar(30),
                commit_hash = COALESCE($2, commit_hash),
                commit_message = COALESCE($3, commit_message),
                started_at = CASE
                    WHEN $1::varchar(30) = 'BUILDING'
                        THEN COALESCE(started_at, CURRENT_TIMESTAMP)
                    ELSE started_at
                END,
                completed_at = CASE
                    WHEN $1::varchar(30) IN ('SUCCESS', 'FAILED')
                        THEN CURRENT_TIMESTAMP
                    ELSE NULL
                END
            WHERE id = $4
            RETURNING *
            `,
            [
                status,
                commit_hash || null,
                commit_message || null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Deployment not found"
            });
        }

        await pool.query(
            `
            INSERT INTO audit_logs
            (user_id, action, resource, details)
            VALUES ($1, $2, $3, $4)
            `,
            [
                req.user.id,
                "UPDATE",
                `deployment:${id}`,
                `Deployment ${id} status changed to ${status}`
            ]
        );

        return res.json({
            message: "Deployment status updated",
            deployment: result.rows[0]
        });
    } catch (error) {
        console.error("Update deployment status error:", error.message);
        return res.status(500).json({
            message: "Failed to update deployment"
        });
    }
};

/*
|--------------------------------------------------------------------------
| Jenkins callback: update deployment status securely
|--------------------------------------------------------------------------
*/

const updateDeploymentStatusFromJenkins = async (req, res) => {
    let client;
    let transactionStarted = false;

    try {
        const expectedSecret = process.env.JENKINS_CALLBACK_SECRET;
        const suppliedSecret = req.get("X-Jenkins-Token");

        if (!expectedSecret) {
            console.error("JENKINS_CALLBACK_SECRET is not configured");

            return res.status(500).json({
                message: "Jenkins callback is not configured"
            });
        }

        const expectedBuffer = Buffer.from(expectedSecret);
        const suppliedBuffer = Buffer.from(
            typeof suppliedSecret === "string" ? suppliedSecret : ""
        );

        if (
            !suppliedSecret ||
            suppliedBuffer.length !== expectedBuffer.length ||
            !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
        ) {
            return res.status(401).json({
                message: "Unauthorized Jenkins callback"
            });
        }

        const { id } = req.params;
        const { status, commit_hash, commit_message } = req.body;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                message: "Invalid deployment ID"
            });
        }

        const allowedStatuses = ["BUILDING", "SUCCESS", "FAILED"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid Jenkins deployment status"
            });
        }

        client = await pool.connect();
        await client.query("BEGIN");
        transactionStarted = true;

        const currentResult = await client.query(
            `
            SELECT id, status
            FROM deployments
            WHERE id = $1
            FOR UPDATE
            `,
            [id]
        );

        if (currentResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(404).json({
                message: "Deployment not found"
            });
        }

        const currentStatus = currentResult.rows[0].status;

        // A completed deployment cannot be changed by a late callback.
        if (["SUCCESS", "FAILED"].includes(currentStatus)) {
            await client.query("COMMIT");
            transactionStarted = false;

            return res.json({
                message: "Deployment is already complete",
                deploymentId: Number(id),
                status: currentStatus
            });
        }

        if (currentStatus === "BUILDING" && status === "BUILDING") {
            await client.query("COMMIT");
            transactionStarted = false;

            return res.json({
                message: "Deployment is already building",
                deploymentId: Number(id),
                status: currentStatus
            });
        }

        const updateResult = await client.query(
            `
            UPDATE deployments
            SET
                status = $1::varchar(30),
                commit_hash = COALESCE($2, commit_hash),
                commit_message = COALESCE($3, commit_message),
                started_at = CASE
                    WHEN $1::varchar(30) = 'BUILDING'
                        THEN COALESCE(started_at, CURRENT_TIMESTAMP)
                    ELSE started_at
                END,
                completed_at = CASE
                    WHEN $1::varchar(30) IN ('SUCCESS', 'FAILED')
                        THEN CURRENT_TIMESTAMP
                    ELSE NULL
                END
            WHERE id = $4
            RETURNING *
            `,
            [
                status,
                commit_hash || null,
                commit_message || null,
                id
            ]
        );

        // Jenkins is a machine identity, not an application user.
        await client.query(
            `
            INSERT INTO audit_logs
            (user_id, action, resource, details)
            VALUES (NULL, $1::text, $2::text, $3::text)
            `,
            [
                "JENKINS_STATUS_UPDATE",
                `deployment:${id}`,
                `Jenkins updated deployment ${id} to ${status}`
            ]
        );

        await client.query("COMMIT");
        transactionStarted = false;

        return res.json({
            message: "Deployment status updated by Jenkins",
            deployment: updateResult.rows[0]
        });
    } catch (error) {
        if (client && transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Jenkins callback rollback error:",
                    rollbackError.message
                );
            }
        }

        console.error("Jenkins callback error:", error.message);

        return res.status(500).json({
            message: "Failed to process Jenkins callback"
        });
    } finally {
        if (client) {
            client.release();
        }
    }
};

module.exports = {
    getDeployments,
    createDeployment,
    getDeploymentById,
    updateDeploymentStatus,
    updateDeploymentStatusFromJenkins
};
