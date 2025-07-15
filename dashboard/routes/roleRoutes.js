const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const auth = require("../middleware/authMiddleware");

// Optionally protect this route, but you can also make it public
router.get("/", auth.verifyToken, roleController.getAllRoles);

module.exports = router;
