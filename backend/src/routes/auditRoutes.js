const express = require("express");
const { getAuditLogs } = require("../controllers/auditController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getAuditLogs);

module.exports = router;