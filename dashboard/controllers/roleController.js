const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllRoles };
