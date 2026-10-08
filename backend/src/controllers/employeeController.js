const pool = require("../config/database");

const createEmployee = async (req, res) => {
    try {
        const {
            name,
            email,
            department,
            position,
            salary
        } = req.body;

        if (!name || !email || !department || !position) {
            return res.status(400).json({
                message: "Name, email, department and position are required"
            });
        }

        const existingEmployee = await pool.query(
            "SELECT id FROM employees WHERE email = $1",
            [email]
        );

        if (existingEmployee.rows.length > 0) {
            return res.status(409).json({
                message: "Employee with this email already exists"
            });
        }

        const result = await pool.query(
            `INSERT INTO employees
            (name, email, department, position, salary)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [name, email, department, position, salary || null]
        );

        const employee = result.rows[0];

        await pool.query(
            `INSERT INTO audit_logs
            (user_id, action, resource, details)
            VALUES ($1, $2, $3, $4)`,
            [
                req.user.id,
                "CREATE",
                `employee:${employee.id}`,
                `Created employee ${employee.name}`
            ]
        );

        res.status(201).json({
            message: "Employee created successfully",
            employee
        });

    } catch (error) {
        console.error("Create employee error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getEmployees = async (req, res) => {
    try {
        const { search, department } = req.query;

        let query = `
            SELECT id, name, email, department, position, salary, created_at
            FROM employees
        `;

        const values = [];
        const conditions = [];

        if (search) {
            values.push(`%${search}%`);

            conditions.push(`
                (
                    name ILIKE $${values.length}
                    OR email ILIKE $${values.length}
                    OR position ILIKE $${values.length}
                )
            `);
        }

        if (department) {
            values.push(department);

            conditions.push(
                `department = $${values.length}`
            );
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += " ORDER BY created_at DESC";

        const result = await pool.query(query, values);

        res.json({
            count: result.rows.length,
            employees: result.rows
        });

    } catch (error) {
        console.error("Get employees error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT id, name, email, department, position, salary, created_at
             FROM employees
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.json({
            employee: result.rows[0]
        });

    } catch (error) {
        console.error("Get employee error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            department,
            position,
            salary
        } = req.body;

        const result = await pool.query(
            `UPDATE employees
             SET
                name = COALESCE($1, name),
                email = COALESCE($2, email),
                department = COALESCE($3, department),
                position = COALESCE($4, position),
                salary = COALESCE($5, salary)
             WHERE id = $6
             RETURNING *`,
            [
                name || null,
                email || null,
                department || null,
                position || null,
                salary || null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        const employee = result.rows[0];

        await pool.query(
            `INSERT INTO audit_logs
            (user_id, action, resource, details)
            VALUES ($1, $2, $3, $4)`,
            [
                req.user.id,
                "UPDATE",
                `employee:${id}`,
                `Updated employee ${employee.name}`
            ]
        );

        res.json({
            message: "Employee updated successfully",
            employee
        });

    } catch (error) {
        console.error("Update employee error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM employees
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        const employee = result.rows[0];

        await pool.query(
            `INSERT INTO audit_logs
            (user_id, action, resource, details)
            VALUES ($1, $2, $3, $4)`,
            [
                req.user.id,
                "DELETE",
                `employee:${id}`,
                `Deleted employee ${employee.name}`
            ]
        );

        res.json({
            message: "Employee deleted successfully"
        });

    } catch (error) {
        console.error("Delete employee error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};