import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, role: true } }
      }
    });

    if (!employee) return res.status(404).json({ success: false, message: 'Profile not found' });

    res.json({ success: true, profile: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error });
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, department, designation } = req.body;

    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) return res.status(404).json({ success: false, message: 'Profile not found' });

    const updated = await prisma.employee.update({
      where: { id: employee.id },
      data: { firstName, lastName, department, designation }
    });

    res.json({ success: true, profile: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile', error });
  }
};
