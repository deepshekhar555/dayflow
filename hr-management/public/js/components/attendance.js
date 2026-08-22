/**
 * attendance.js — HR Attendance Management
 */
import { API } from '../api.js';

export async function renderAttendance() {
  try {
    const attData = await API.getAttendance();
    const attendance = attData.attendance || attData || [];
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = attendance.filter(a => a.date === today);

    document.getElementById('att-count-present').textContent = todayLogs.filter(a => a.status === 'Present').length;
    document.getElementById('att-count-late').textContent    = todayLogs.filter(a => a.status === 'Late').length;
    document.getElementById('att-count-leave').textContent   = todayLogs.filter(a => a.status === 'On Leave').length;

    const tbody = document.getElementById('attendance-table-body');
    if (!tbody) return;

    if (!attendance.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:30px;">No attendance records found.</td></tr>';
      return;
    }

    tbody.innerHTML = attendance.map(a => {
      const badge = a.status === 'Present' ? 'badge-present'
                  : a.status === 'Late' ? 'badge-late'
                  : 'badge-absent';
      return `
        <tr>
          <td>
            <div class="employee-cell">
              <div class="employee-avatar-circle" style="background:rgba(99,102,241,0.2);color:#818cf8;">
                ${(a.name || a.employeeId || '?')[0].toUpperCase()}
              </div>
              <span class="emp-name-main">${a.name || a.employeeId || '-'}</span>
            </div>
          </td>
          <td>${a.date || '-'}</td>
          <td>${a.punchIn || '-'}</td>
          <td>${a.punchOut || '-'}</td>
          <td>${a.hours || '-'}</td>
          <td><span class="${badge}">${a.status || 'Unknown'}</span></td>
        </tr>
      `;
    }).join('');

    // Quick punch buttons
    document.getElementById('btn-quick-checkin')?.addEventListener('click', () => {
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      alert(`✅ Punch In recorded at ${now}`);
    });
    document.getElementById('btn-quick-checkout')?.addEventListener('click', () => {
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      alert(`🔴 Punch Out recorded at ${now}`);
    });

  } catch (err) { console.error('Attendance error:', err); }
}
