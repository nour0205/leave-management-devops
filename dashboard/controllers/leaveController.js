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
exports.getAllLeaveRequests = async (req, res) => {
  const { id: userId, role } = req.user;

  try {
    let requests = [];

    if (role === "employee") {
      // Employees should not access this route
      return res.status(403).json({ error: "Access denied for employees" });
    } else if (role === "manager") {
      console.log(`[MANAGER] ${userId} is requesting leaves`);
      console.log("🔍 Fetching leaves for manager:", userId);

      requests.forEach((r) => {
        console.log(
          `👀 Request from ${r.employeeName} (managerId: ${r.employee.managerId})`
        );
      });

      requests = await prisma.leaveRequest.findMany({
        where: {
          employee: {
            managerId: userId,
          },
        },
        include: {
          employee: true,
          reviewedBy: true,
          attachments: true,
        },
        orderBy: { requestedAt: "desc" },
      });
    } else if (role === "head_of_departement") {
      // ✅ Head sees requests from employees under their supervised managers
      const supervisedManagers = await prisma.user.findMany({
        where: {
          managerId: userId,
          role: "manager",
        },
        select: { id: true },
      });

      const managerIds = supervisedManagers.map((mgr) => mgr.id);

      requests = await prisma.leaveRequest.findMany({
        where: {
          employee: {
            managerId: { in: managerIds },
          },
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
exports.submitLeaveRequest = async (req, res) => {
  const { employeeId, employeeName, startDate, endDate, reason } = req.body;

  if (!employeeId || !employeeName || !startDate || !endDate || !reason) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
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

    if (employee.id === employee.managerId) {
      return res
        .status(400)
        .json({ error: "Reviewer cannot be the same as submitter." });
    }

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
    console.error("🔴 Submit error:", error);
    res.status(500).json({ error: "Failed to submit leave request" });
  }
};

// === PATCH review a leave request (manager only) ===
exports.reviewLeaveRequest = async (req, res) => {
  const { id } = req.params;
  const { status, reviewNotes } = req.body;
  const reviewerId = req.user.id; // Assumes auth middleware sets req.user

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });

    if (!leave) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    // ✅ Only allow manager of the employee to review
    if (leave.employee.managerId !== reviewerId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to review this request" });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        reviewedById: reviewerId,
        reviewedByName: req.user.name,
        reviewNotes,
        reviewedAt: new Date(),
      },
    });

    await logAction(reviewerId, `review_leave_${status}`, id, reviewNotes);
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
        createdAt: "desc",
      },
      take: 100,
    });

    res.json(logs);
  } catch (err) {
    console.error("❌ Error fetching audit logs:", err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};
