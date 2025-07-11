const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create user
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, teamId } = req.body;
    const user = await prisma.user.create({
      data: { firstName, lastName, email, password, teamId },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, password, teamId } = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { firstName, lastName, email, password, teamId },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
