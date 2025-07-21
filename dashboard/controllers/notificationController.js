import { prisma } from "../prisma/prisma.js";

export const getUserNotifications = async (req, res) => {
  const { userId } = req.params;
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(notifications);
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });
  res.json(updated);
};
