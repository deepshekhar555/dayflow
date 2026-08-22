/**
 * leaves.js — Leave Board
 */
import { API } from '../api.js';

export async function renderLeaves(currentUserRole) {
  const isHR = currentUserRole === 'hr';
  try {
    const [leaveData, empData] = await Promise.all([API.getLeaves(), API.getEmployees()]);
    const leaves    = leaveData.leaves  || leaveData || [];
    const employees = empData.employees || empData || [];

    const empMap = {};
    employees.forEach(e => { empMap[e.id] = e.name; });

    const container = document.getElementById('leave-board-cards');
    if (!container) return;

    if (!leaves.length) {
      container.innerHTML = '<div class="glass-panel" style="text-align:center;padding:40px;color:var(--text-muted);">No leave requests found.</div>';
      return;
    }

    container.innerHTML = leaves.map(l => {
      const statusClass = l.status === 'Approved' ? 'badge-present'
                        : l.status === 'Rejected'  ? 'badge-danger'
                        : 'badge-late';
      const name = empMap[l.employeeId] || l.employeeName || l.employeeId || 'Unknown';
      return `
        <div class="glass-panel leave-card">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:700;font-size:15px;">${name}</span>
            <span class="${statusClass}">${l.status}</span>
          </div>
          <p style="font-size:13px;color:var(--accent-primary);font-weight:600;">${l.type}</p>
          <p style="font-size:12px;color:var(--text-muted);">📅 ${l.startDate} → ${l.endDate}</p>
          <p style="font-size:13px;color:var(--text-secondary);">${l.reason || ''}</p>
          ${isHR && l.status === 'Pending' ? `
            <div style="display:flex;gap:8px;margin-top:8px;">
              <button class="btn btn-success" style="flex:1;justify-content:center;"
                onclick="approveLeave('${l.id || l._id}')">✓ Approve</button>
              <button class="btn btn-danger" style="flex:1;justify-content:center;"
                onclick="rejectLeave('${l.id || l._id}')">✕ Reject</button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  } catch (err) { console.error('Leaves error:', err); }
}

window.approveLeave = async function(id) {
  await API.updateLeave(id, 'Approved');
  const { renderLeaves } = await import('./leaves.js');
  renderLeaves('hr');
};
window.rejectLeave = async function(id) {
  await API.updateLeave(id, 'Rejected');
  const { renderLeaves } = await import('./leaves.js');
  renderLeaves('hr');
};
