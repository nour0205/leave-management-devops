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

router.get("/", authenticate, getAllLeaveRequests); // ✅ protect it
router.post("/", authenticate, submitLeaveRequest); // ✅ protect it
router.patch("/:id/review", authenticate, reviewLeaveRequest); // ✅ protect it
router.post(
  "/:id/attachments",
  authenticate,
  upload.single("file"),
  uploadAttachment
); // ✅ protect it
router.get("/audit-logs", authenticate, authorize(["manager"]), getAuditLogs); // already good

module.exports = router;
