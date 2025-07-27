const { prisma } = require("../../prisma/prisma");
const jwt = require("jsonwebtoken");
const {
  loginAttempts,
  loginFailures,
  loginSuccesses,
} = require("../metrics/loginMetrics");

exports.login = async (req, res) => {
  loginAttempts.inc(); // record every attempt

  const { email } = req.body;
  if (!email) {
    loginFailures.inc(); // missing email = failure
    return res.status(400).json({ error: "Email is required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    loginFailures.inc(); // invalid email = failure
    return res.status(401).json({ error: "Invalid email" });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  loginSuccesses.inc(); // success

  res.json({ token, user });
};
