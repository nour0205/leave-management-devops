const express = require("express");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/admin-only", authenticate, authorize(["admin"]), (req, res) => {
  res.json({ message: `Welcome ${req.user.role}` });
});

module.exports = router;
