const { prisma } = require("../../prisma/prisma");

exports.getAllLeaveRequests = async (_req, res) => {
  const requests = await prisma.leaveRequest.findMany({
    include: {
      employee: true,
      reviewedBy: true,
    },
  });
  res.json(requests);
};

exports.submitLeaveRequest = async (req, res) => {
  const { employeeId, employeeName, startDate, endDate, reason } = req.body;

  if (!employeeId || !employeeName || !startDate || !endDate || !reason) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newLeave = await prisma.leaveRequest.create({
    data: {
      employeeId,
      employeeName,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    },
  });

  res.status(201).json(newLeave);
};

exports.reviewLeaveRequest = async (req, res) => {
  const { id } = req.params;
  const { status, reviewedById, reviewNotes, reviewedByName } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status,
      reviewedById,
      reviewedByName,
      reviewNotes,
      reviewedAt: new Date(),
    },
  });

  res.json(updated);
};
