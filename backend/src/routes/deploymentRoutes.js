const express = require("express");

const {
    getDeployments,
    createDeployment,
    getDeploymentById,
    updateDeploymentStatus
} = require("../controllers/deploymentController");

const authenticateToken =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");

const router = express.Router();


/*
|--------------------------------------------------------------------------
| Get deployments
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "MANAGER",
        "EMPLOYEE"
    ),
    getDeployments
);


/*
|--------------------------------------------------------------------------
| Create deployment
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "MANAGER"
    ),
    createDeployment
);


/*
|--------------------------------------------------------------------------
| Get deployment by ID
|--------------------------------------------------------------------------
*/

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "MANAGER",
        "EMPLOYEE"
    ),
    getDeploymentById
);


/*
|--------------------------------------------------------------------------
| Update deployment status
|--------------------------------------------------------------------------
*/

router.put(
    "/:id/status",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "MANAGER"
    ),
    updateDeploymentStatus
);


module.exports = router;