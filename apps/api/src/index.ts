import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import attendanceRoutes from './routes/attendance.routes';
import leaveRoutes from './routes/leave.routes';
import employeeRoutes from './routes/employee.routes';
import payrollRoutes from './routes/payroll.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/payroll', payrollRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
