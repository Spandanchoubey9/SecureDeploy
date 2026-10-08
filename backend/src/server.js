const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();

const initializeDatabase = require("./config/initDatabase");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

const deploymentRoutes =
    require("./routes/deploymentRoutes");
const dashboardRoutes =
    require("./routes/dashboardRoutes");

const app = express();    
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/deployments", deploymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.get("/", (req, res) => {
    res.json({
        message: "SecureDeploy API is running",
        version: "1.0.0"
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        service: "SecureDeploy API",
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;

initializeDatabase();

app.listen(PORT, () => {
    console.log(`SecureDeploy API running on port ${PORT}`);
});