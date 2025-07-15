const jwt = require("jsonwebtoken");
const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

exports.requireRole = (roleName) => {
  return async (req, res, next) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { roles: true },
    });

    if (!user || !user.roles.some((r) => r.name === roleName)) {
      return res
        .status(403)
        .json({ message: "Access denied – insufficient role" });
    }

    next();
  };
};
