const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { roles: true },
    });

    const usersWithRoles = users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      teamId: user.teamId,
      roles: user.roles.map((r) => r.name),
    }));

    res.json(usersWithRoles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create user
const bcrypt = require("bcryptjs");

const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, teamId, roleIds } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        teamId,
        roles: {
          connect: roleIds.map((id) => ({ id })), // Connect to existing roles
        },
      },
      include: { roles: true },
    });

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      teamId: user.teamId,
      roles: user.roles.map((r) => r.name),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, password, teamId, roleIds } = req.body;

    const data = {
      firstName,
      lastName,
      email,
      teamId,
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        roles: {
          set: roleIds.map((id) => ({ id })), // Replace existing roles
        },
      },
      include: { roles: true },
    });

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      teamId: user.teamId,
      roles: user.roles.map((r) => r.name),
    });
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
