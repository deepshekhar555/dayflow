import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const applyLeave = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { leaveTypeId, startDate, endDate, reason } = req.body;

    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const request = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason
      },
      include: { leaveType: true }
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error applying for leave', error });
  }
};

export const getMyLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const leaves = await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      include: { leaveType: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching leaves', error });
  }
};

export const getAllLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      include: { employee: true, leaveType: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching all leaves', error });
  }
};

export const approveLeave = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { hrComment } = req.body;

    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: { status: 'APPROVED', hrComment },
      include: { leaveType: true, employee: true }
    });

    // Optionally increment used balance
    // ... logic for leaveBalance update could go here ...

    res.json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error approving leave', error });
  }
};

export const rejectLeave = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { hrComment } = req.body;

    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: { status: 'REJECTED', hrComment },
      include: { leaveType: true, employee: true }
    });

    res.json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rejecting leave', error });
  }
};

export const getLeaveTypes = async (req: AuthRequest, res: Response) => {
  try {
    const types = await prisma.leaveType.findMany();
    res.json({ success: true, types });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching leave types', error });
  }
};
