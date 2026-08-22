import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Settings, Download, Shield, Activity, Users } from 'lucide-react';

const SystemSettings = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('http://localhost:5000/api/system/audit-logs', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    }).catch(err => console.error(err));
  }, [navigate]);

  const handleExport = () => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/system/reports/attendance', {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    }).catch(err => console.error("Export failed", err));
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border p-6 flex flex-col hidden md:flex">
        <div className="font-bold text-2xl text-primary mb-12">Dayflow HR</div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => navigate('/hr/dashboard')} className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Activity className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Users className="w-5 h-5 mr-3" /> Employees
          </button>
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg bg-primary/10 text-primary">
            <Settings className="w-5 h-5 mr-3" /> System
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
            <p className="text-muted-foreground mt-1">Manage system configurations and data exports.</p>
          </div>
          <button onClick={handleExport} className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <Download className="w-5 h-5 mr-2" /> Export Attendance
          </button>
        </header>

        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Audit Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Resource</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No audit logs found.</td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{log.action}</td>
                      <td className="px-6 py-4">{log.resource}</td>
                      <td className="px-6 py-4">{log.user?.email || log.userId}</td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemSettings;
