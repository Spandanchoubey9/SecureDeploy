
const express = require("express");

const {
    getDeployments,
    createDeployment,
    getDeploymentById,
    updateDeploymentStatus,
    updateDeploymentStatusFromJenkins
} = require("../controllers/deploymentController");

const authenticateToken =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");

const router = express.Router();

// Machine-authenticated callback. This route intentionally does not
// use user JWT middleware; the controller verifies X-Jenkins-Token.
router.put(
    "/:id/jenkins-status",
    updateDeploymentStatusFromJenkins
);

router.get(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER", "EMPLOYEE"),
    getDeployments
);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    createDeployment
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER", "EMPLOYEE"),
    getDeploymentById
);

router.put(
    "/:id/status",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    updateDeploymentStatus
);

module.exports = router;
