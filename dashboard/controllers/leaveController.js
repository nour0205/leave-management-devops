const { prisma } = require("../../prisma/prisma");

// === Utility: Audit Log ===
async function logAction(userId, action, targetId, details) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      targetId,
      details,
    },
  });
}

// === Utility: Notifications ===
async function createNotification(userId, message) {
  await prisma.notification.create({
    data: {
      userId,
      message,
    },
  });
}

// === GET all leave requests ===
exports.getAllLeaveRequests = async (_req, res) => {
  try {
    const requests = await prisma.leaveRequest.findMany({
      include: {
        employee: true,
        reviewedBy: true,
        attachments: true,
      },
    });
    res.json(requests);
  } catch (err) {
    console.error("❌ Error fetching leave requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// === POST submit a new leave request ===
exports.submitLeaveRequest = async (req, res) => {
  const { employeeId, employeeName, startDate, endDate, reason } = req.body;

  if (!employeeId || !employeeName || !startDate || !endDate || !reason) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newLeave = await prisma.leaveRequest.create({
      data: {
        employeeId,
        employeeName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      },
    });

    await logAction(
      employeeId,
      "submit_leave",
      newLeave.id,
      `Requested from ${startDate} to ${endDate}`
    );
    await createNotification(
      employeeId,
      "Your leave request has been submitted."
    );

    res.status(201).json(newLeave);
  } catch (err) {
    console.error("❌ Error submitting leave:", err);
    res.status(500).json({ error: "Failed to submit leave request" });
  }
};

// === PATCH review a leave request ===
exports.reviewLeaveRequest = async (req, res) => {
  const { id } = req.params;
  const { status, reviewedById, reviewNotes, reviewedByName } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
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

    await logAction(reviewedById, `review_leave_${status}`, id, reviewNotes);
    await createNotification(
      updated.employeeId,
      `Your leave request was ${status}.`
    );

    res.json(updated);
  } catch (err) {
    console.error("❌ Error reviewing leave request:", err);
    res.status(500).json({ error: "Failed to review leave request" });
  }
};

// === POST upload an attachment ===
exports.uploadAttachment = async (req, res) => {
  const { id: leaveRequestId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const leave = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
    });

    if (!leave) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    const attachment = await prisma.attachment.create({
      data: {
        leaveRequestId,
        fileUrl: `/uploads/${file.filename}`,
      },
    });

    await logAction(
      leave.employeeId,
      "upload_attachment",
      leaveRequestId,
      file.originalname
    );
    await createNotification(
      leave.employeeId,
      "You uploaded an attachment to your leave request."
    );

    res.status(201).json({ message: "File uploaded", attachment });
  } catch (err) {
    console.error("❌ Error uploading attachment:", err);
    res.status(500).json({ error: "Failed to upload attachment" });
  }
};
