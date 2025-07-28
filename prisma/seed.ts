const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('mypassword123', 10); // shared password

  // 🧑‍💼 Managers
  const manager1 = await prisma.user.upsert({
    where: { email: 'yasmine.bensaid@soprahr.tn' },
    update: {},
    create: {
      id: 'mgr-tn-001',
      name: 'Yasmine Ben Saïd',
      email: 'yasmine.bensaid@soprahr.tn',
      role: 'manager',
      department: 'Payroll',
      leaveBalance: 22,
      totalLeaves: 30,
      password,
    },
  });

  const manager2 = await prisma.user.upsert({
    where: { email: 'anas.jaziri@soprahr.tn' },
    update: {},
    create: {
      id: 'mgr-tn-002',
      name: 'Anas Jaziri',
      email: 'anas.jaziri@soprahr.tn',
      role: 'manager',
      department: 'IT',
      leaveBalance: 25,
      totalLeaves: 30,
      password,
    },
  });

  // 👷 Employees
  const employee1 = await prisma.user.upsert({
    where: { email: 'oussama.trabelsi@soprahr.tn' },
    update: {},
    create: {
      id: 'emp-tn-001',
      name: 'Oussama Trabelsi',
      email: 'oussama.trabelsi@soprahr.tn',
      role: 'employee',
      department: 'IT',
      leaveBalance: 14,
      totalLeaves: 25,
      password,
    },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'rim.zouari@soprahr.tn' },
    update: {},
    create: {
      id: 'emp-tn-002',
      name: 'Rim Zouari',
      email: 'rim.zouari@soprahr.tn',
      role: 'employee',
      department: 'Customer Support',
      leaveBalance: 18,
      totalLeaves: 25,
      password,
    },
  });

  const employee3 = await prisma.user.upsert({
    where: { email: 'ahmed.benali@soprahr.tn' },
    update: {},
    create: {
      id: 'emp-tn-003',
      name: 'Ahmed Ben Ali',
      email: 'ahmed.benali@soprahr.tn',
      role: 'employee',
      department: 'Finance',
      leaveBalance: 12,
      totalLeaves: 20,
      password,
    },
  });

  const employee4 = await prisma.user.upsert({
    where: { email: 'syrine.mahjoub@soprahr.tn' },
    update: {},
    create: {
      id: 'emp-tn-004',
      name: 'Syrine Mahjoub',
      email: 'syrine.mahjoub@soprahr.tn',
      role: 'employee',
      department: 'Marketing',
      leaveBalance: 20,
      totalLeaves: 25,
      password,
    },
  });

  // 📆 Leave Requests (using upsert)
  const leaveRequests = [
    {
      id: 'lvreq-001',
      employee: employee1,
      data: {
        startDate: new Date('2025-08-05'),
        endDate: new Date('2025-08-07'),
        reason: 'Conference participation in Sfax',
        status: 'approved',
        requestedAt: new Date('2025-07-15'),
        reviewedAt: new Date('2025-07-17'),
        reviewedById: manager1.id,
        reviewedByName: manager1.name,
        reviewNotes: 'Approved for official event',
      },
    },
    {
      id: 'lvreq-002',
      employee: employee2,
      data: {
        startDate: new Date('2025-08-10'),
        endDate: new Date('2025-08-12'),
        reason: 'Family event',
        status: 'pending',
        requestedAt: new Date('2025-07-20'),
      },
    },
    {
      id: 'lvreq-003',
      employee: employee1,
      data: {
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-01'),
        reason: 'Doctor appointment',
        status: 'rejected',
        requestedAt: new Date('2025-07-10'),
        reviewedAt: new Date('2025-07-11'),
        reviewedById: manager1.id,
        reviewedByName: manager1.name,
        reviewNotes: 'Too short notice',
      },
    },
    {
      id: 'lvreq-004',
      employee: employee3,
      data: {
        startDate: new Date('2025-08-20'),
        endDate: new Date('2025-08-22'),
        reason: 'Vacation with family',
        status: 'approved',
        requestedAt: new Date('2025-07-25'),
        reviewedAt: new Date('2025-07-27'),
        reviewedById: manager2.id,
        reviewedByName: manager2.name,
        reviewNotes: 'Approved due to good performance',
      },
    },
    {
      id: 'lvreq-005',
      employee: employee4,
      data: {
        startDate: new Date('2025-08-15'),
        endDate: new Date('2025-08-17'),
        reason: 'Wedding attendance',
        status: 'pending',
        requestedAt: new Date('2025-07-21'),
      },
    },
    {
      id: 'lvreq-006',
      employee: employee3,
      data: {
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-03'),
        reason: 'Medical check-up',
        status: 'rejected',
        requestedAt: new Date('2025-08-20'),
        reviewedAt: new Date('2025-08-22'),
        reviewedById: manager2.id,
        reviewedByName: manager2.name,
        reviewNotes: 'Too close to previous leave',
      },
    },
  ];

  for (const request of leaveRequests) {
    await prisma.leaveRequest.upsert({
      where: { id: request.id },
      update: {},
      create: {
        id: request.id,
        employeeId: request.employee.id,
        employeeName: request.employee.name,
        ...request.data,
      },
    });
  }

  console.log('✅ Sample data inserted for Sopra HR Tunisia with secure passwords.');
}

main()
  .catch((e) => {
    console.error('❌ Error inserting seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
