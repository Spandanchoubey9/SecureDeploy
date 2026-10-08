const pool = require("./database");

const initializeDatabase = async () => {
    try {
        /*
        |--------------------------------------------------------------------------
        | Users
        |--------------------------------------------------------------------------
        */

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        /*
        |--------------------------------------------------------------------------
        | Employees
        |--------------------------------------------------------------------------
        */

        await pool.query(`
            CREATE TABLE IF NOT EXISTS employees (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                department VARCHAR(100) NOT NULL,
                position VARCHAR(100) NOT NULL,
                salary NUMERIC(10, 2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        /*
        |--------------------------------------------------------------------------
        | Audit Logs
        |--------------------------------------------------------------------------
        */

        await pool.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                action VARCHAR(100) NOT NULL,
                resource VARCHAR(100),
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        /*
        |--------------------------------------------------------------------------
        | Deployments
        |--------------------------------------------------------------------------
        */

        await pool.query(`
            CREATE TABLE IF NOT EXISTS deployments (
                id SERIAL PRIMARY KEY,

                branch VARCHAR(100) NOT NULL DEFAULT 'main',

                commit_hash VARCHAR(100),

                commit_message TEXT,

                environment VARCHAR(50) NOT NULL DEFAULT 'production',

                status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

                triggered_by INTEGER REFERENCES users(id),

                started_at TIMESTAMP,

                completed_at TIMESTAMP,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        /*
        |--------------------------------------------------------------------------
        | Deployment Indexes
        |--------------------------------------------------------------------------
        */

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_deployments_status
            ON deployments(status);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_deployments_created_at
            ON deployments(created_at DESC);
        `);

        console.log(
            "Database tables initialized successfully"
        );

    } catch (error) {
        console.error(
            "Database initialization failed:",
            error
        );
    }
};

module.exports = initializeDatabase;