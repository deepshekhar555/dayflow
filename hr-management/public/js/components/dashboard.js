/**
 * dashboard.js — HR Dashboard Page
 */
import { API } from '../api.js';

const INR = n => '₹' + (parseFloat(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const DEPT_COLORS = {
  Engineering: '#6366f1', Design: '#ec4899', Marketing: '#f59e0b',
  Finance: '#10b981', 'Human Resources': '#06b6d4', Operations: '#8b5cf6',
};

export async function renderDashboard() {
  try {
    const [empData, leaveData, reviewData, attData] = await Promise.all([
      API.getEmployees(), API.getLeaves(), API.getPerformanceReviews(), API.getAttendance(),
    ]);

    const employees = empData.employees || empData || [];
    const leaves    = leaveData.leaves  || leaveData || [];
    const reviews   = reviewData.reviews || reviewData || [];

    // Stats
    const onLeave  = employees.filter(e => e.status === 'On Leave').length;
    const onboard  = employees.filter(e => e.status === 'Onboarding').length;
    const avgRating = reviews.length
      ? (reviews.reduce((s, r) => s + (parseFloat(r.score) || 0), 0) / reviews.length).toFixed(1)
      : 'N/A';

    document.getElementById('stat-total-emp').textContent  = employees.length;
    document.getElementById('stat-on-leave').textContent   = onLeave;
    document.getElementById('stat-onboarding').textContent = onboard;
    document.getElementById('stat-avg-rating').textContent = avgRating;

    // Department bar chart
    const deptGroups = {};
    employees.forEach(e => {
      deptGroups[e.department] = (deptGroups[e.department] || 0) + 1;
    });

    const chartEl = document.getElementById('dept-chart');
    if (chartEl) {
      const maxCount = Math.max(...Object.values(deptGroups), 1);
      chartEl.innerHTML = Object.entries(deptGroups).map(([dept, count]) => {
        const pct = Math.round((count / maxCount) * 100);
        const color = DEPT_COLORS[dept] || '#6366f1';
        return `
          <div style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
              <span style="color:var(--text-secondary);">${dept}</span>
              <span style="font-weight:700;">${count}</span>
            </div>
            <div style="background:var(--bg-tertiary);border-radius:6px;height:8px;overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:${color};border-radius:6px;transition:width 0.8s ease;"></div>
            </div>
          </div>
        `;
      }).join('') || '<p style="color:var(--text-muted);">No department data.</p>';
    }

    // Pending Actions
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const pendingOnboard = employees.filter(e => e.status === 'Onboarding').length;
    const actionsEl = document.getElementById('dashboard-actions');
    if (actionsEl) {
      actionsEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${pendingLeaves > 0 ? `
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--status-leave-bg);border-radius:10px;border:1px solid var(--status-leave);">
              <span style="font-size:20px;">📋</span>
              <div><strong>${pendingLeaves} Pending Leave Request${pendingLeaves > 1 ? 's' : ''}</strong><p style="font-size:12px;color:var(--text-muted);">Awaiting your approval</p></div>
            </div>` : ''}
          ${pendingOnboard > 0 ? `
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--status-onboard-bg);border-radius:10px;border:1px solid var(--status-onboard);">
              <span style="font-size:20px;">👤</span>
              <div><strong>${pendingOnboard} Onboarding Employee${pendingOnboard > 1 ? 's' : ''}</strong><p style="font-size:12px;color:var(--text-muted);">Checklists need completion</p></div>
            </div>` : ''}
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--status-active-bg);border-radius:10px;border:1px solid var(--status-active);">
            <span style="font-size:20px;">💰</span>
            <div><strong>Total Payroll This Month</strong>
              <p style="font-size:13px;font-weight:700;color:var(--status-active);">${INR(employees.reduce((s, e) => s + Math.round((e.salary || 500000) / 12), 0))}</p>
            </div>
          </div>
          ${pendingLeaves === 0 && pendingOnboard === 0 ? '<p style="color:var(--text-muted);text-align:center;padding:20px;">All clear! No pending actions.</p>' : ''}
        </div>
      `;
    }
  } catch (err) { console.error('Dashboard error:', err); }
}
