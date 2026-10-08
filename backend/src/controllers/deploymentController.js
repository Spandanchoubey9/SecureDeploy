const pool = require("../config/database");

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
            LEFT JOIN users u
                ON d.triggered_by = u.id
            ORDER BY d.created_at DESC
        `);

        res.json({
            count: result.rows.length,
            deployments: result.rows
        });

    } catch (error) {
        console.error(
            "Get deployments error:",
            error
        );

        res.status(500).json({
            message: "Failed to load deployments"
        });
    }
};


/*
|--------------------------------------------------------------------------
| Create deployment
|--------------------------------------------------------------------------
*/

const createDeployment = async (req, res) => {
    try {
        const {
            branch,
            commit_hash,
            commit_message,
            environment
        } = req.body;

        const deploymentBranch =
            branch || "main";

        const deploymentEnvironment =
            environment || "production";

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
            VALUES
            ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
            RETURNING *
            `,
            [
                deploymentBranch,
                commit_hash || null,
                commit_message || null,
                deploymentEnvironment,
                "PENDING",
                req.user.id
            ]
        );

        const deployment = result.rows[0];

        /*
        |--------------------------------------------------------------------------
        | Audit deployment creation
        |--------------------------------------------------------------------------
        */

        await pool.query(
            `
            INSERT INTO audit_logs
            (
                user_id,
                action,
                resource,
                details
            )
            VALUES ($1, $2, $3, $4)
            `,
            [
                req.user.id,
                "CREATE",
                `deployment:${deployment.id}`,
                `Created deployment ${deployment.id} for ${deploymentBranch}`
            ]
        );

        res.status(201).json({
            message:
                "Deployment created successfully",
            deployment
        });

    } catch (error) {
        console.error(
            "Create deployment error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to create deployment"
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
        const { id } = req.params;

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
            LEFT JOIN users u
                ON d.triggered_by = u.id
            WHERE d.id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Deployment not found"
            });
        }

        res.json({
            deployment: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Get deployment error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to load deployment"
        });
    }
};


/*
|--------------------------------------------------------------------------
| Update deployment status
|--------------------------------------------------------------------------
*/

const updateDeploymentStatus = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const {
            status,
            commit_hash,
            commit_message
        } = req.body;

        const allowedStatuses = [
            "PENDING",
            "BUILDING",
            "SUCCESS",
            "FAILED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message:
                    "Invalid deployment status"
            });
        }

        const completedStatuses = [
            "SUCCESS",
            "FAILED"
        ];

        const completedAt =
            completedStatuses.includes(status)
                ? "CURRENT_TIMESTAMP"
                : "NULL";

        const result = await pool.query(
            `
            UPDATE deployments
            SET
                status = $1,
                commit_hash =
                    COALESCE($2, commit_hash),
                commit_message =
                    COALESCE($3, commit_message),
                completed_at =
                    ${completedAt}
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

        const deployment =
            result.rows[0];

        await pool.query(
            `
            INSERT INTO audit_logs
            (
                user_id,
                action,
                resource,
                details
            )
            VALUES ($1, $2, $3, $4)
            `,
            [
                req.user.id,
                "UPDATE",
                `deployment:${id}`,
                `Deployment ${id} status changed to ${status}`
            ]
        );

        res.json({
            message:
                "Deployment status updated",
            deployment
        });

    } catch (error) {
        console.error(
            "Update deployment status error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update deployment"
        });
    }
};


module.exports = {
    getDeployments,
    createDeployment,
    getDeploymentById,
    updateDeploymentStatus
};