const express = require("express");

const {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} = require("../controllers/employeeController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER", "EMPLOYEE"),
    getEmployees
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER", "EMPLOYEE"),
    getEmployeeById
);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN"),
    createEmployee
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    updateEmployee
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    deleteEmployee
);

module.exports = router;