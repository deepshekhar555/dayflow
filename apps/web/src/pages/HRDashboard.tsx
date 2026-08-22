import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Activity, LogOut } from 'lucide-react';

const HRDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-card border-r border-border p-6 flex flex-col hidden md:flex">
        <div className="font-bold text-2xl text-primary mb-12">Dayflow HR</div>
        <nav className="space-y-2 flex-1">
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg bg-primary/10 text-primary">
            <Activity className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Users className="w-5 h-5 mr-3" /> Employees
          </button>
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <FileText className="w-5 h-5 mr-3" /> Leave Approvals
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors mt-auto">
          <LogOut className="w-5 h-5 mr-3" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Workforce Overview</h1>
          <p className="text-muted-foreground mt-1">Manage your organization's attendance and leaves.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
            <p className="text-3xl font-bold">248</p>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">Present Today</p>
            <p className="text-3xl font-bold text-green-600">221</p>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">On Leave</p>
            <p className="text-3xl font-bold text-amber-500">14</p>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
            <p className="text-3xl font-bold text-primary">89.1%</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HRDashboard;
