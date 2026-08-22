import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Employee Count
    const totalEmployees = await prisma.employee.count();

    // 2. Today's Attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const presentToday = await prisma.attendance.count({
      where: { date: { gte: today } }
    });

    // 3. Leaves Today
    const leavesToday = await prisma.leaveRequest.count({
      where: {
        status: 'APPROVED',
        startDate: { lte: today },
        endDate: { gte: today }
      }
    });

    // 4. Attendance Rate (Mocked historical data for charts)
    const attendanceChart = [
      { name: 'Mon', present: Math.floor(totalEmployees * 0.9) },
      { name: 'Tue', present: Math.floor(totalEmployees * 0.95) },
      { name: 'Wed', present: Math.floor(totalEmployees * 0.85) },
      { name: 'Thu', present: Math.floor(totalEmployees * 0.92) },
      { name: 'Fri', present: presentToday || Math.floor(totalEmployees * 0.88) },
    ];

    // 5. Leave Distribution (Mocked for pie chart)
    const leaveDistribution = [
      { name: 'Sick Leave', value: 12 },
      { name: 'Casual Leave', value: 19 },
      { name: 'Paid Leave', value: 8 },
      { name: 'Unpaid Leave', value: 3 },
    ];

    res.json({
      success: true,
      stats: {
        totalEmployees,
        presentToday,
        leavesToday,
        attendanceRate: totalEmployees ? ((presentToday / totalEmployees) * 100).toFixed(1) : 0,
      },
      charts: {
        attendanceChart,
        leaveDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching analytics', error });
  }
};
