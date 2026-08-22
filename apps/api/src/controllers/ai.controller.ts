import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const chatWithCopilot = async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    const userRole = req.user?.role;
    
    // Minimal mock AI logic for demo purposes
    // In a real app, you would integrate OpenAI or Gemini SDK here
    let reply = "I'm your Dayflow AI Copilot. I can help you with leave policies, payroll questions, or navigation!";
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('leave') || lowerMessage.includes('holiday')) {
      reply = "You can apply for leave from the 'Quick Actions' menu on your Dashboard. You have 19 Casual Leaves and 12 Sick Leaves remaining for this year according to company policy.";
    } else if (lowerMessage.includes('payroll') || lowerMessage.includes('salary') || lowerMessage.includes('payslip')) {
      reply = "Your latest payslip for this month is ready. You can view and download it securely from the 'Payroll' tab in your sidebar.";
    } else if (lowerMessage.includes('attendance') || lowerMessage.includes('check')) {
      reply = "I see you checked in today. Your attendance rate this month is excellent at 94%. Keep it up!";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      reply = `Hello! How can I assist you today, ${userRole === 'HR' ? 'HR Manager' : 'Team Member'}?`;
    }

    // Simulate network delay to feel like real AI processing
    setTimeout(() => {
      res.json({ success: true, reply });
    }, 1000);

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing AI request', error });
  }
};

export const getInsights = async (req: AuthRequest, res: Response) => {
  try {
    // In a real app, this would analyze DB trends using AI
    const insights = [
      {
        id: 1,
        type: 'WARNING',
        title: 'Predicted Staff Shortage',
        message: 'Based on historical trends, we predict a 15% drop in attendance next Friday. Consider reviewing pending leave requests.',
      },
      {
        id: 2,
        type: 'SUCCESS',
        title: 'High Engagement',
        message: 'Overall attendance rate has been above 92% for 3 consecutive weeks. Team morale indicators are positive.',
      }
    ];

    setTimeout(() => {
      res.json({ success: true, insights });
    }, 800);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating insights', error });
  }
};

export const nlSearch = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.body;
    const lowerQuery = query.toLowerCase();
    
    let employees = await prisma.employee.findMany({
      include: { user: { select: { email: true, role: true } } }
    });

    // Simple keyword based NLP simulation
    if (lowerQuery.includes('engineering') || lowerQuery.includes('developer')) {
      employees = employees.filter(e => e.department?.toLowerCase().includes('engineering') || e.designation?.toLowerCase().includes('developer'));
    } else if (lowerQuery.includes('manager')) {
      employees = employees.filter(e => e.designation?.toLowerCase().includes('manager'));
    } else if (lowerQuery.includes('recent') || lowerQuery.includes('new')) {
      employees = employees.sort((a, b) => b.joiningDate.getTime() - a.joiningDate.getTime()).slice(0, 5);
    } else if (lowerQuery.trim() !== '') {
       // text search
       employees = employees.filter(e => 
         e.firstName.toLowerCase().includes(lowerQuery) || 
         e.lastName.toLowerCase().includes(lowerQuery) ||
         e.department?.toLowerCase().includes(lowerQuery) ||
         e.designation?.toLowerCase().includes(lowerQuery)
       );
    }

    res.json({ success: true, results: employees, interpretation: `Showing results for "${query}"` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error executing search', error });
  }
};
