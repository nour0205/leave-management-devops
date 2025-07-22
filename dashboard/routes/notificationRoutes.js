const express = require("express");
const {
  getUserNotifications,
  markAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/:userId", getUserNotifications);
router.patch("/:id/read", markAsRead);

module.exports = router;
