import { Response } from 'express';
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
    }, 1500);

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing AI request', error });
  }
};
