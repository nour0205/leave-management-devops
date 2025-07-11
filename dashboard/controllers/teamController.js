const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

// Get all teams
const getAllTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new team
const createTeam = async (req, res) => {
  try {
    const { name, managerId } = req.body;
    const team = await prisma.team.create({
      data: {
        name,
        managerId,
      },
    });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update team
const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, managerId } = req.body;
    const team = await prisma.team.update({
      where: { id: parseInt(id) },
      data: { name, managerId },
    });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete team
const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.team.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Team deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllTeams,
  createTeam,
  updateTeam,
  deleteTeam,
};
