import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, FileText, Activity, LogOut, Settings, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const HRDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalEmployees: 0, presentToday: 0, leavesToday: 0, attendanceRate: '0' });
  const [charts, setCharts] = useState({ attendanceChart: [], leaveDistribution: [] });
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('http://localhost:5000/api/analytics/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.success) {
        setStats(res.data.stats);
        setCharts(res.data.charts);
      }
    }).catch(err => console.error("Error fetching analytics:", err));

    axios.get('http://localhost:5000/api/ai/insights', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.success) setInsights(res.data.insights);
    }).catch(err => console.error("Error fetching insights:", err));
  }, [navigate]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

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
          <button onClick={() => navigate('/hr/employees')} className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Users className="w-5 h-5 mr-3" /> Employees
          </button>
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <FileText className="w-5 h-5 mr-3" /> Leave Approvals
          </button>
          <button onClick={() => navigate('/hr/system')} className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Settings className="w-5 h-5 mr-3" /> System
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
            <p className="text-3xl font-bold">{stats.totalEmployees}</p>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">Present Today</p>
            <p className="text-3xl font-bold text-green-600">{stats.presentToday}</p>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">On Leave</p>
            <p className="text-3xl font-bold text-amber-500">{stats.leavesToday}</p>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
            <p className="text-3xl font-bold text-primary">{stats.attendanceRate}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border col-span-1 md:col-span-2 h-[400px]">
            <h2 className="text-lg font-semibold mb-6">Attendance Overview (Weekly)</h2>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.attendanceChart}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                <Area type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border h-[400px] flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Leave Distribution</h2>
            <div className="flex-1 min-h-0 relative flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.leaveDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {charts.leaveDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {charts.leaveDistribution.map((item: any, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Workforce Intelligence */}
        <div className="mt-6 bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Workforce Intelligence Alerts</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.length === 0 ? (
              <p className="text-muted-foreground text-sm col-span-2">Analyzing workforce patterns...</p>
            ) : (
              insights.map(insight => (
                <div key={insight.id} className={`p-4 rounded-xl border flex gap-4 ${insight.type === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                  <div className={`mt-0.5 shrink-0 ${insight.type === 'WARNING' ? 'text-amber-500' : 'text-green-500'}`}>
                    {insight.type === 'WARNING' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-sm ${insight.type === 'WARNING' ? 'text-amber-700 dark:text-amber-500' : 'text-green-700 dark:text-green-500'}`}>
                      {insight.title}
                    </h3>
                    <p className="text-sm mt-1 text-muted-foreground">{insight.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default HRDashboard;
