import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMyPayslips = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const payslips = await prisma.payslip.findMany({
      where: { employeeId: employee.id },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });

    res.json({ success: true, payslips });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching payslips', error });
  }
};

export const generatePayslip = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, month, year, basicSalary, allowances = 0, deductions = 0 } = req.body;
    
    const netSalary = basicSalary + allowances - deductions;

    const payslip = await prisma.payslip.create({
      data: {
        employeeId,
        month,
        year,
        basicSalary,
        allowances,
        deductions,
        netSalary,
        status: 'GENERATED'
      }
    });

    res.status(201).json({ success: true, payslip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating payslip', error });
  }
};
