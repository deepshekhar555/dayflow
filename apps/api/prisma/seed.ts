import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.leaveType.deleteMany();
  await prisma.payslip.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Leave Types
  const sickLeave = await prisma.leaveType.create({ data: { name: 'SICK', daysAllowed: 12 } });
  const casualLeave = await prisma.leaveType.create({ data: { name: 'CASUAL', daysAllowed: 19 } });

  // 1. Create Admin/HR User
  const adminUser = await prisma.user.create({
    data: {
      email: 'hr@dayflow.com',
      password: passwordHash,
      role: 'ADMIN',
      employee: {
        create: {
          employeeId: 'EMP-001',
          firstName: 'Sarah',
          lastName: 'Connor',
          joiningDate: new Date('2022-01-15'),
          designation: 'Head of HR',
        }
      }
    }
  });

  // 2. Create Employee User
  const employeeUser = await prisma.user.create({
    data: {
      email: 'employee@dayflow.com',
      password: passwordHash,
      role: 'EMPLOYEE',
      employee: {
        create: {
          employeeId: 'EMP-002',
          firstName: 'John',
          lastName: 'Doe',
          joiningDate: new Date('2023-06-01'),
          designation: 'Software Engineer',
        }
      }
    }
  });

  const empRecord = await prisma.employee.findUnique({ where: { userId: employeeUser.id }});

  if (empRecord) {
    // 3. Create Attendance
    for (let i = 1; i <= 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      await prisma.attendance.create({
        data: {
          employeeId: empRecord.id,
          date: d,
          checkIn: new Date(d.setHours(9, 0, 0, 0)),
          checkOut: new Date(d.setHours(17, 30, 0, 0)),
          status: 'PRESENT'
        }
      });
    }

    // 4. Create Leaves
    await prisma.leaveRequest.create({
      data: {
        employeeId: empRecord.id,
        leaveTypeId: sickLeave.id,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        reason: 'Flu',
        status: 'PENDING'
      }
    });

    // 5. Create Payslip
    await prisma.payslip.create({
      data: {
        employeeId: empRecord.id,
        month: 8,
        year: 2026,
        basicSalary: 5000,
        allowances: 1000,
        deductions: 500,
        netSalary: 5500,
        status: 'GENERATED'
      }
    });

    // 6. Notifications
    await prisma.notification.create({
      data: {
        userId: employeeUser.id,
        title: 'Welcome to Dayflow!',
        message: 'Your account has been successfully created.',
        type: 'INFO'
      }
    });
  }

  console.log('Seeding completed! You can login with hr@dayflow.com / employee@dayflow.com and password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
