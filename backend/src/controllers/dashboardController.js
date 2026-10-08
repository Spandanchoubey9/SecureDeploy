const pool = require("../config/database");

const getDashboardStats = async (req, res) => {
    try {
        const totalEmployeesResult = await pool.query(
            "SELECT COUNT(*) AS count FROM employees"
        );

        const totalDepartmentsResult = await pool.query(
            `
            SELECT COUNT(DISTINCT department) AS count
            FROM employees
            WHERE department IS NOT NULL
            `
        );

        const totalActionsResult = await pool.query(
            "SELECT COUNT(*) AS count FROM audit_logs"
        );

        const departmentDistributionResult = await pool.query(
            `
            SELECT
                department,
                COUNT(*)::int AS count
            FROM employees
            WHERE department IS NOT NULL
            GROUP BY department
            ORDER BY count DESC
            `
        );

        const recentActivityResult = await pool.query(
            `
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
            LIMIT 6
            `
        );

        res.json({
            totalEmployees:
                Number(totalEmployeesResult.rows[0].count),

            totalDepartments:
                Number(totalDepartmentsResult.rows[0].count),

            totalActions:
                Number(totalActionsResult.rows[0].count),

            departmentDistribution:
                departmentDistributionResult.rows,

            recentActivity:
                recentActivityResult.rows
        });

    } catch (error) {

        console.error(
            "Dashboard stats error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to load dashboard statistics"
        });
    }
};

module.exports = {
    getDashboardStats
};