const express = require("express");
const {
  getAllLeaveRequests,
  submitLeaveRequest,
  reviewLeaveRequest,
} = require("../controllers/leaveController");

const router = express.Router();

router.get("/", getAllLeaveRequests);
router.post("/", submitLeaveRequest);
router.patch("/:id/review", reviewLeaveRequest);

module.exports = router;
