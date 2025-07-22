const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcrypt');


const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('mypassword123', 10); // shared password for all users

  // 🧑‍💼 Create Users
  const manager = await prisma.user.create({
    data: {
      id: 'mgr-tn-001',
      name: 'Yasmine Ben Saïd',
      email: 'yasmine.bensaid@soprahr.tn',
      role: 'manager',
      department: 'Payroll',
      leaveBalance: 22,
      totalLeaves: 30,
      password: password,
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      id: 'emp-tn-001',
      name: 'Oussama Trabelsi',
      email: 'oussama.trabelsi@soprahr.tn',
      role: 'employee',
      department: 'IT',
      leaveBalance: 14,
      totalLeaves: 25,
      password: password,
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      id: 'emp-tn-002',
      name: 'Rim Zouari',
      email: 'rim.zouari@soprahr.tn',
      role: 'employee',
      department: 'Customer Support',
      leaveBalance: 18,
      totalLeaves: 25,
      password: password,
    },
  });

  // 📆 Create Leave Requests
  await prisma.leaveRequest.createMany({
    data: [
      {
        id: 'lvreq-001',
        employeeId: employee1.id,
        employeeName: employee1.name,
        startDate: new Date('2025-08-05'),
        endDate: new Date('2025-08-07'),
        reason: 'Conference participation in Sfax',
        status: 'approved',
        requestedAt: new Date('2025-07-15'),
        reviewedAt: new Date('2025-07-17'),
        reviewedById: manager.id,
        reviewedByName: manager.name,
        reviewNotes: 'Approved for official event',
      },
      {
        id: 'lvreq-002',
        employeeId: employee2.id,
        employeeName: employee2.name,
        startDate: new Date('2025-08-10'),
        endDate: new Date('2025-08-12'),
        reason: 'Family event',
        status: 'pending',
        requestedAt: new Date('2025-07-20'),
      },
      {
        id: 'lvreq-003',
        employeeId: employee1.id,
        employeeName: employee1.name,
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-01'),
        reason: 'Doctor appointment',
        status: 'rejected',
        requestedAt: new Date('2025-07-10'),
        reviewedAt: new Date('2025-07-11'),
        reviewedById: manager.id,
        reviewedByName: manager.name,
        reviewNotes: 'Too short notice',
      },
    ],
  });

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
