import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import HRDashboard from './pages/HRDashboard';
import Profile from './pages/Profile';
import Payroll from './pages/Payroll';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/hr/dashboard" element={<HRDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
