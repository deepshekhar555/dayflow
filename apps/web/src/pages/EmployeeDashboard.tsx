import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, FileText, Settings, LogOut } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, Calendar, FileText, Settings, LogOut } from 'lucide-react';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchAttendance();
    fetchLeaves();
  }, [navigate]);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/attendance/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAttendance(response.data.attendance);
      }
    } catch (error) {
      console.error("Error fetching attendance", error);
    }
  };

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/leaves/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setLeaves(response.data.leaves);
      }
    } catch (error) {
      console.error("Error fetching leaves", error);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance/check-in', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAttendance();
    } catch (error) {
      console.error("Check in failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance/check-out', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAttendance();
    } catch (error) {
      console.error("Check out failed", error);
    } finally {
      setLoading(false);
    }
  };

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
          <button onClick={() => navigate('/dashboard')} className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg bg-primary/10 text-primary">
            <Clock className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Calendar className="w-5 h-5 mr-3" /> Leave
          </button>
          <button onClick={() => navigate('/payroll')} className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <FileText className="w-5 h-5 mr-3" /> Payroll
          </button>
          <button onClick={() => navigate('/profile')} className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
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
            
            {(() => {
              const todayStr = new Date().toISOString().split('T')[0];
              const todayAttendance = attendance.find(a => a.date.startsWith(todayStr));
              
              if (!todayAttendance) {
                return (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-400"></span> Not Checked In</p>
                    </div>
                    <button onClick={handleCheckIn} disabled={loading} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50">
                      {loading ? 'Checking in...' : 'Check In'}
                    </button>
                  </div>
                );
              }
              
              if (todayAttendance.checkIn && !todayAttendance.checkOut) {
                return (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Checked In</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Since</p>
                      <p className="text-xl font-bold">{new Date(todayAttendance.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <button onClick={handleCheckOut} disabled={loading} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50">
                      {loading ? 'Checking out...' : 'Check Out'}
                    </button>
                  </div>
                );
              }
              
              return (
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Completed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Working Hours</p>
                    <p className="text-xl font-bold">Done for today</p>
                  </div>
                </div>
              );
            })()}
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
          {/* Recent Leaves */}
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border col-span-1 md:col-span-3">
            <h2 className="text-lg font-semibold mb-4">Recent Leave Requests</h2>
            <div className="space-y-3">
              {leaves.length === 0 ? (
                <p className="text-muted-foreground text-sm">No leave requests found.</p>
              ) : (
                leaves.map((leave, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{leave.reason}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                      leave.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
