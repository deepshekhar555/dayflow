import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const checkIn = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const employee = await prisma.employee.findUnique({ where: { userId } });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: today
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date: today,
        checkIn: new Date(),
      }
    });

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking in', error });
  }
};

export const checkOut = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const employee = await prisma.employee.findUnique({ where: { userId } });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: today
      }
    });

    if (!existingAttendance) {
      return res.status(400).json({ success: false, message: 'No check-in found for today' });
    }

    if (existingAttendance.checkOut) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }

    const attendance = await prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: {
        checkOut: new Date(),
      }
    });

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking out', error });
  }
};

export const getMyAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const employee = await prisma.employee.findUnique({ where: { userId } });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const attendance = await prisma.attendance.findMany({
      where: { employeeId: employee.id },
      orderBy: { date: 'desc' },
      take: 30
    });

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching attendance', error });
  }
};
