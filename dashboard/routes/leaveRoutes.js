const express = require("express");
const {
  getAllLeaveRequests,
  submitLeaveRequest,
  reviewLeaveRequest,
  uploadAttachment,
} = require("../controllers/leaveController");

const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getAllLeaveRequests);
router.post("/", submitLeaveRequest);
router.patch("/:id/review", reviewLeaveRequest);

// NEW 📎 Upload file for a leave request
router.post("/:id/attachments", upload.single("file"), uploadAttachment);

module.exports = router;
