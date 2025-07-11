const { PrismaClient } = require("../../generated/prisma");

const prisma = new PrismaClient();

// Get all leaves
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await prisma.absence.findMany();
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new leave
const createLeave = async (req, res) => {
  try {
    const { userId, type, startDate, endDate, status, comment } = req.body;
    const leave = await prisma.absence.create({
      data: {
        userId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
        comment,
      },
    });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update leave
const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, refusalComment } = req.body;
    const leave = await prisma.absence.update({
      where: { id: parseInt(id) },
      data: { status, refusalComment },
    });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete leave
const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.absence.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Leave deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllLeaves,
  createLeave,
  updateLeave,
  deleteLeave,
};
