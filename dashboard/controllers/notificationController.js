const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

// Get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new notification
const createNotification = async (req, res) => {
  try {
    const { userId, message, read } = req.body;
    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        read,
      },
    });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update notification
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;
    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read },
    });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
};
