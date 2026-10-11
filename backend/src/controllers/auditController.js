const pool = require("../config/database");

const getAuditLogs = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.id,
                a.action,
                a.resource,
                a.details,
                a.created_at,
                u.name AS user_name
            FROM audit_logs a
            LEFT JOIN users u
                ON a.user_id = u.id
            ORDER BY a.created_at DESC
        `);

        res.json({
            count: result.rows.length,
            logs: result.rows
        });
    } catch (error) {
        console.error("Get audit logs error:", error.message);

        res.status(500).json({
            message: "Failed to load audit logs"
        });
    }
};

module.exports = { getAuditLogs };
