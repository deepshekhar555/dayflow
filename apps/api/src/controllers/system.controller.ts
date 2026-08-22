import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching audit logs', error });
  }
};

export const exportAttendanceReport = async (req: AuthRequest, res: Response) => {
  try {
    const attendances = await prisma.attendance.findMany({
      include: { employee: true },
      orderBy: { date: 'desc' },
      take: 100 // Limit for demo purposes
    });

    // Generate CSV string
    const headers = 'Employee ID,First Name,Last Name,Date,Check In,Check Out,Status\n';
    const rows = attendances.map(a => {
      return `${a.employeeId},${a.employee.firstName},${a.employee.lastName},${new Date(a.date).toLocaleDateString()},${new Date(a.checkIn).toLocaleTimeString()},${a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : 'N/A'},${a.status}`;
    }).join('\n');

    const csvData = headers + rows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance_report.csv"');
    res.status(200).send(csvData);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating report', error });
  }
};
