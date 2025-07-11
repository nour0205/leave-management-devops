const express = require("express");
const router = express.Router();
const prisma = require("../../generated/prisma");
const authMiddleware = require("../middleware/authMiddleware");

// Approve leave
router.put("/approve/:id", authMiddleware(["manager"]), async (req, res) => {
  const { id } = req.params;
  try {
    const leave = await prisma.absence.update({
      where: { id: parseInt(id) },
      data: { status: "approved" },
    });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject leave
router.put("/reject/:id", authMiddleware(["manager"]), async (req, res) => {
  const { id } = req.params;
  const { refusalComment } = req.body;
  if (!refusalComment) {
    return res
      .status(400)
      .json({ error: "Refusal comment is required for rejection" });
  }

  try {
    const leave = await prisma.absence.update({
      where: { id: parseInt(id) },
      data: { status: "rejected", refusalComment },
    });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View team leaves
router.get(
  "/team/:managerId",
  authMiddleware(["manager"]),
  async (req, res) => {
    const { managerId } = req.params;
    try {
      const team = await prisma.team.findMany({
        where: { managerId: parseInt(managerId) },
        include: {
          users: {
            include: {
              absences: true,
            },
          },
        },
      });
      res.json(team);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
