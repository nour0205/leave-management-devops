const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("mypassword123", 10);

  // === HEAD OF DEPARTMENT ===
  const chef = await prisma.user.upsert({
    where: { email: "mohamed.benhassen@soprahr.tn" },
    update: {},
    create: {
      id: "chef-tn-001",
      name: "Mohamed Ben Hassen",
      email: "mohamed.benhassen@soprahr.tn",
      role: "head_of_departement",
      department: "Management",
      leaveBalance: 30,
      totalLeaves: 30,
      password,
    },
  });

  // === MANAGERS ===
  const managersData = [
    { id: "mgr-tn-001", name: "Yasmine Ben Saïd", email: "yasmine.bensaid@soprahr.tn", department: "Payroll" },
    { id: "mgr-tn-002", name: "Anas Jaziri", email: "anas.jaziri@soprahr.tn", department: "IT" },
    { id: "mgr-tn-003", name: "Mehdi Tlili", email: "mehdi.tlili@soprahr.tn", department: "Finance" },
    { id: "mgr-tn-004", name: "Henda Mbarek", email: "henda.mbarek@soprahr.tn", department: "Customer Support" },
  ];

  const managers = {};

  for (const mgr of managersData) {
    const manager = await prisma.user.upsert({
      where: { email: mgr.email },
      update: {},
      create: {
        id: mgr.id,
        name: mgr.name,
        email: mgr.email,
        role: "manager",
        department: mgr.department,
        leaveBalance: 25,
        totalLeaves: 30,
        password,
        managerId: chef.id, // 🔹 Assign to head of department
      },
    });
    managers[mgr.id] = manager;
  }

  // === EMPLOYEES ===
  const employeesData = [
    { id: "emp-tn-001", name: "Oussama Trabelsi", email: "oussama.trabelsi@soprahr.tn", department: "IT", manager: "mgr-tn-002" },
    { id: "emp-tn-002", name: "Rim Zouari", email: "rim.zouari@soprahr.tn", department: "Customer Support", manager: "mgr-tn-004" },
    { id: "emp-tn-003", name: "Ahmed Ben Ali", email: "ahmed.benali@soprahr.tn", department: "Finance", manager: "mgr-tn-003" },
    { id: "emp-tn-004", name: "Syrine Mahjoub", email: "syrine.mahjoub@soprahr.tn", department: "Marketing", manager: "mgr-tn-003" },
    { id: "emp-tn-005", name: "Youssef Ferchichi", email: "youssef.ferchichi@soprahr.tn", department: "IT", manager: "mgr-tn-002" },
    { id: "emp-tn-006", name: "Hiba Amri", email: "hiba.amri@soprahr.tn", department: "HR", manager: "mgr-tn-004" },
    { id: "emp-tn-007", name: "Chamseddine Gharbi", email: "chamseddine.gharbi@soprahr.tn", department: "Finance", manager: "mgr-tn-003" },
    { id: "emp-tn-008", name: "Khalil Jendoubi", email: "khalil.jendoubi@soprahr.tn", department: "IT", manager: "mgr-tn-002" },
    { id: "emp-tn-009", name: "Fatma Laaroussi", email: "fatma.laaroussi@soprahr.tn", department: "Marketing", manager: "mgr-tn-001" },
    { id: "emp-tn-010", name: "Hanen Baccar", email: "hanen.baccar@soprahr.tn", department: "Customer Support", manager: "mgr-tn-004" },
  ];

  const employees = {};

  for (const emp of employeesData) {
    const employee = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: "employee",
        department: emp.department,
        leaveBalance: Math.floor(Math.random() * 10 + 15),
        totalLeaves: 25,
        password,
        managerId: managers[emp.manager].id, // 🔹 Assign employee to their manager
      },
    });
    employees[emp.id] = employee;
  }

  // === LEAVE REQUESTS ===
  const leaveRequests = [
    {
      id: "lvreq-001",
      empId: "emp-tn-001",
      managerId: "mgr-tn-002",
      data: {
        startDate: new Date("2025-08-05"),
        endDate: new Date("2025-08-07"),
        reason: "Conference participation",
        status: "approved",
        requestedAt: new Date("2025-07-15"),
        reviewedAt: new Date("2025-07-17"),
        reviewNotes: "Approved for external representation",
      },
    },
    {
      id: "lvreq-002",
      empId: "emp-tn-002",
      data: {
        startDate: new Date("2025-08-10"),
        endDate: new Date("2025-08-12"),
        reason: "Family event",
        status: "pending",
        requestedAt: new Date("2025-07-20"),
      },
    },
    {
      id: "lvreq-003",
      empId: "emp-tn-003",
      managerId: "mgr-tn-002",
      data: {
        startDate: new Date("2025-08-01"),
        endDate: new Date("2025-08-01"),
        reason: "Doctor appointment",
        status: "rejected",
        requestedAt: new Date("2025-07-10"),
        reviewedAt: new Date("2025-07-11"),
        reviewNotes: "Too short notice",
        attachments: {
          create: [
            { fileUrl: "/uploads/doctor-note.pdf" },
          ],
        },
      },
    },
    {
      id: "lvreq-004",
      empId: "emp-tn-004",
      managerId: "mgr-tn-003",
      data: {
        startDate: new Date("2025-08-20"),
        endDate: new Date("2025-08-22"),
        reason: "Vacation",
        status: "approved",
        requestedAt: new Date("2025-07-25"),
        reviewedAt: new Date("2025-07-27"),
        reviewNotes: "Approved for summer leave",
      },
    },
    {
      id: "lvreq-005",
      empId: "emp-tn-005",
      data: {
        startDate: new Date("2025-08-15"),
        endDate: new Date("2025-08-17"),
        reason: "Wedding attendance",
        status: "pending",
        requestedAt: new Date("2025-07-21"),
      },
    },
    {
      id: "lvreq-006",
      empId: "emp-tn-006",
      managerId: "mgr-tn-004",
      data: {
        startDate: new Date("2025-09-01"),
        endDate: new Date("2025-09-03"),
        reason: "Medical check-up",
        status: "rejected",
        requestedAt: new Date("2025-08-20"),
        reviewedAt: new Date("2025-08-22"),
        reviewNotes: "Too close to previous leave",
        attachments: {
          create: [
            { fileUrl: "/uploads/medical-checkup.pdf" },
            { fileUrl: "/uploads/insurance-form.pdf" },
          ],
        },
      },
    },
    {
      id: "lvreq-007",
      empId: "emp-tn-007",
      managerId: "mgr-tn-003",
      data: {
        startDate: new Date("2025-08-25"),
        endDate: new Date("2025-08-27"),
        reason: "Family emergency",
        status: "approved",
        requestedAt: new Date("2025-08-10"),
        reviewedAt: new Date("2025-08-12"),
        reviewNotes: "Approved as exception",
      },
    },
    {
      id: "lvreq-008",
      empId: "emp-tn-008",
      data: {
        startDate: new Date("2025-08-30"),
        endDate: new Date("2025-08-30"),
        reason: "Visa appointment",
        status: "pending",
        requestedAt: new Date("2025-08-15"),
        attachments: {
          create: [
            { fileUrl: "/uploads/visa-application.jpg" },
          ],
        },
      },
    },
  ];

  for (const request of leaveRequests) {
    await prisma.leaveRequest.upsert({
      where: { id: request.id },
      update: {},
      create: {
        id: request.id,
        employeeId: employees[request.empId].id,
        employeeName: employees[request.empId].name,
        reviewedById: request.managerId ? managers[request.managerId].id : undefined,
        reviewedByName: request.managerId ? managers[request.managerId].name : undefined,
        ...request.data,
      },
    });
  }

  console.log("✅ Seeded: 1 head, 4 managers, 10 employees, 8 leave requests");
}

main()
  .catch((e) => {
    console.error("❌ Error inserting seed data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
