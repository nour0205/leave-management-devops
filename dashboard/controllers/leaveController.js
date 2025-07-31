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
// === GET leave requests based on role ===
exports.getAllLeaveRequests = async (req, res) => {
  const { id: userId, role } = req.user; // Assumes authentication middleware sets req.user

  try {
    let requests = [];

    if (role === "employee") {
      // 🔒 Employees are not allowed to view leave requests in this route
      requests = []; // Optional: you could also return a 403 or an empty list
    } else if (role === "manager") {
      // ✅ Managers only see leave requests from their employees
      const employees = await prisma.user.findMany({
        where: {
          managerId: userId,
          role: "employee",
        },
        select: { id: true },
      });

      const employeeIds = employees.map((emp) => emp.id);

      requests = await prisma.leaveRequest.findMany({
        where: {
          employeeId: { in: employeeIds },
        },
        include: {
          employee: true,
          reviewedBy: true,
          attachments: true,
        },
        orderBy: { requestedAt: "desc" },
      });
    } else if (role === "head_of_departement") {
      // ✅ Head of department sees requests from all managers they supervise
      const supervisedManagers = await prisma.user.findMany({
        where: {
          managerId: userId,
          role: "manager",
        },
        select: { id: true },
      });

      const managerIds = supervisedManagers.map((mgr) => mgr.id);

      // Now find all leave requests submitted by these managers’ employees
      const employees = await prisma.user.findMany({
        where: {
          managerId: { in: managerIds },
          role: "employee",
        },
        select: { id: true },
      });

      const employeeIds = employees.map((emp) => emp.id);

      requests = await prisma.leaveRequest.findMany({
        where: {
          employeeId: { in: employeeIds },
        },
        include: {
          employee: true,
          reviewedBy: true,
          attachments: true,
        },
        orderBy: { requestedAt: "desc" },
      });
    } else {
      return res.status(403).json({ error: "Unauthorized role" });
    }

    res.json(requests);
  } catch (err) {
    console.error("❌ Error fetching leave requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// === POST submit a new leave request ===
// === POST submit a new leave request ===
exports.submitLeaveRequest = async (req, res) => {
  const { employeeId, employeeName, startDate, endDate, reason } = req.body;

  if (!employeeId || !employeeName || !startDate || !endDate || !reason) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Fetch employee's role and manager
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        role: true,
        managerId: true,
        manager: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (!employee.managerId) {
      return res
        .status(400)
        .json({ error: "This user has no manager assigned." });
    }

    // Prevent users from reviewing their own leave
    if (employee.id === employee.managerId) {
      return res
        .status(400)
        .json({ error: "Reviewer cannot be the same as submitter." });
    }

    // Create leave request with reviewer auto-assigned
    const newLeave = await prisma.leaveRequest.create({
      data: {
        employeeId,
        employeeName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        reviewedById: employee.managerId,
        reviewedByName: employee.manager.name,
      },
    });

    await logAction(
      employeeId,
      "submit_leave",
      newLeave.id,
      `Requested from ${startDate} to ${endDate}`
    );

    await createNotification(
      employee.managerId,
      `📩 New leave request from ${employeeName}`
    );

    await createNotification(
      employeeId,
      "✅ Your leave request has been submitted."
    );

    res.status(201).json(newLeave);
  } catch (error) {
    console.error("🔴 Submit error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
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
// === GET audit logs (Managers only) ===
exports.getAuditLogs = async (_req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc", // ✅ Fix here
      },
      take: 100,
    });

    res.json(logs);
  } catch (err) {
    console.error("❌ Error fetching audit logs:", err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};
