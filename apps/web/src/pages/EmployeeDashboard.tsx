import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, FileText, Settings, LogOut } from 'lucide-react';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-card border-r border-border p-6 flex flex-col hidden md:flex">
        <div className="font-bold text-2xl text-primary mb-12">Dayflow</div>
        <nav className="space-y-2 flex-1">
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg bg-primary/10 text-primary">
            <Clock className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Calendar className="w-5 h-5 mr-3" /> Leave
          </button>
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <FileText className="w-5 h-5 mr-3" /> Payroll
          </button>
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Settings className="w-5 h-5 mr-3" /> Profile
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors mt-auto">
          <LogOut className="w-5 h-5 mr-3" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Good morning, {user.employee?.firstName || 'Employee'} 👋</h1>
            <p className="text-muted-foreground mt-1">Here is what's happening today.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user.employee?.firstName?.charAt(0) || 'E'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Attendance Card */}
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border col-span-1 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Today's Attendance</h2>
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Checked In</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Working for</p>
                <p className="text-2xl font-bold">04h 37m</p>
              </div>
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
                Check Out
              </button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-xl border border-border hover:bg-muted transition-colors font-medium text-sm">
                Apply for Leave
              </button>
              <button className="w-full text-left p-3 rounded-xl border border-border hover:bg-muted transition-colors font-medium text-sm">
                View Payslip
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
