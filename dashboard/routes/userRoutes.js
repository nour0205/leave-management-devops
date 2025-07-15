const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

// ✅ Get all users – Admin only
router.get(
  "/",
  auth.verifyToken,
  auth.requireRole("Administrator"),
  userController.getAllUsers
);

// ✅ Create a new user – Admin only
router.post(
  "/",
  auth.verifyToken,
  auth.requireRole("Administrator"),
  userController.createUser
);

// ✅ Update a user – Admin only
router.put(
  "/:id",
  auth.verifyToken,
  auth.requireRole("Administrator"),
  userController.updateUser
);

// ✅ Delete a user – Admin only
router.delete(
  "/:id",
  auth.verifyToken,
  auth.requireRole("Administrator"),
  userController.deleteUser
);

module.exports = router;
