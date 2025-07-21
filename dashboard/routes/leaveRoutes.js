import express from "express";
import {
  getAllLeaveRequests,
  submitLeaveRequest,
  reviewLeaveRequest,
} from "../controllers/leaveController.js";

const router = express.Router();

router.get("/", getAllLeaveRequests);
router.post("/", submitLeaveRequest);
router.patch("/:id/review", reviewLeaveRequest);

export default router;
