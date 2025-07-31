const express = require("express");
const {
  getAllLeaveRequests,
  submitLeaveRequest,
  reviewLeaveRequest,
  uploadAttachment,
  getAuditLogs,
} = require("../controllers/leaveController");

const { authenticate, authorize } = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getAllLeaveRequests);
router.post("/", submitLeaveRequest);
router.patch("/:id/review", reviewLeaveRequest);

// NEW 📎 Upload file for a leave request
router.post("/:id/attachments", upload.single("file"), uploadAttachment);

// Protect with middleware
router.get("/audit-logs", authenticate, authorize(["manager"]), getAuditLogs);

module.exports = router;
