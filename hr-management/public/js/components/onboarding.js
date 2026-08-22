/**
 * onboarding.js — Onboarding Tracker
 */
import { API } from '../api.js';

export async function renderOnboarding(currentUserRole) {
  const isHR = currentUserRole === 'hr';
  try {
    const [onbData, empData] = await Promise.all([API.getOnboarding(), API.getEmployees()]);
    const onboarding = onbData.onboarding || onbData || [];
    const employees  = empData.employees  || empData || [];

    const empMap = {};
    employees.forEach(e => { empMap[e.id] = e; });

    const container = document.getElementById('onboarding-tracker-list');
    if (!container) return;

    if (!onboarding.length) {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">No onboarding records. Add new hires to get started.</div>';
      return;
    }

    container.innerHTML = onboarding.map(onb => {
      const emp = empMap[onb.employeeId] || {};
      const tasks = onb.tasks || [];
      const done  = tasks.filter(t => t.completed).length;
      const pct   = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

      return `
        <div class="glass-panel onboarding-employee-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <div>
              <h3 style="font-size:16px;font-weight:700;">${onb.employeeName || emp.name || onb.employeeId}</h3>
              <p style="font-size:12px;color:var(--text-muted);">Start: ${onb.startDate || '-'} | Mentor: ${onb.mentor || '-'}</p>
            </div>
            <div style="text-align:right;">
              <span style="font-size:22px;font-weight:800;color:var(--accent-primary);">${pct}%</span>
              <p style="font-size:11px;color:var(--text-muted);">${done}/${tasks.length} tasks</p>
            </div>
          </div>
          <div style="background:var(--bg-tertiary);border-radius:6px;height:8px;margin-bottom:16px;overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));border-radius:6px;transition:width 0.8s ease;"></div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${tasks.map((task, idx) => `
              <label style="display:flex;align-items:center;gap:10px;cursor:${isHR ? 'pointer' : 'default'};">
                <input type="checkbox" ${task.completed ? 'checked' : ''}
                  ${!isHR ? 'disabled' : ''}
                  onchange="toggleOnboardTask('${onb.id || onb._id}', ${idx}, this.checked)"
                  style="accent-color:var(--accent-primary);width:16px;height:16px;">
                <span style="font-size:13px;${task.completed ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${task.name}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) { console.error('Onboarding error:', err); }
}

window.toggleOnboardTask = async function(onbId, taskIdx, completed) {
  await API.updateOnboarding(onbId, { taskIdx, completed });
};
