/**
 * directory.js — Employee Directory
 */
import { API } from '../api.js';

const INR = n => '₹' + (parseFloat(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const DEPT_COLORS = {
  Engineering: '#6366f1', Design: '#ec4899', Marketing: '#f59e0b',
  Finance: '#10b981', 'Human Resources': '#06b6d4', Operations: '#8b5cf6',
};

export async function renderDirectory(currentUserRole) {
  const isHR = currentUserRole === 'hr';
  try {
    const data = await API.getEmployees();
    const employees = data.employees || data || [];
    const tbody = document.getElementById('directory-table-body');
    if (!tbody) return;

    if (!employees.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;">No employees found. Add your first employee!</td></tr>';
      return;
    }

    renderRows(employees, tbody, isHR);

    // Dept filter
    document.getElementById('filter-dept')?.addEventListener('change', function () {
      const dept = this.value;
      const filtered = dept === 'All' ? employees : employees.filter(e => e.department === dept);
      renderRows(filtered, tbody, isHR);
    });
    // Status filter
    document.getElementById('filter-status')?.addEventListener('change', function () {
      const status = this.value;
      const dept = document.getElementById('filter-dept')?.value || 'All';
      let filtered = status === 'All' ? employees : employees.filter(e => e.status === status);
      if (dept !== 'All') filtered = filtered.filter(e => e.department === dept);
      renderRows(filtered, tbody, isHR);
    });
  } catch (err) { console.error('Directory error:', err); }
}

function renderRows(employees, tbody, isHR) {
  tbody.innerHTML = employees.map(emp => {
    const color    = DEPT_COLORS[emp.department] || '#6366f1';
    const initials = (emp.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const badgeClass = emp.status === 'Active' ? 'badge-present'
                     : emp.status === 'On Leave' ? 'badge-late'
                     : 'badge-absent';
    const annual = emp.salary || 500000;
    return `
      <tr>
        <td>
          <div class="employee-cell">
            <div class="employee-avatar-circle" style="background:${color}22;color:${color};">${initials}</div>
            <div class="employee-name-stack">
              <span class="emp-name-main">${emp.name}</span>
              <span class="emp-id-sub">${emp.email || emp.id || ''}</span>
            </div>
          </div>
        </td>
        <td>${emp.department}</td>
        <td>${emp.role || '-'}</td>
        <td>${emp.joinDate || '-'}</td>
        <td><span class="${badgeClass}">${emp.status || 'Active'}</span></td>
        <td style="font-weight:700;">${emp.performanceScore ? '⭐ ' + emp.performanceScore : '-'}</td>
        <td>
          ${isHR ? `
            <div style="display:flex;gap:8px;">
              <button class="btn btn-secondary" style="font-size:11px;padding:5px 10px;"
                onclick="hrEditEmployee('${emp.id}')">✏ Edit</button>
              <button class="btn btn-danger" style="font-size:11px;padding:5px 10px;"
                onclick="hrDeleteEmployee('${emp.id}', '${emp.name}')">🗑</button>
            </div>
          ` : '—'}
        </td>
      </tr>
    `;
  }).join('');
}

// Global handlers for inline onclick
window.hrEditEmployee = async function(id) {
  const data = await API.getEmployees();
  const employees = data.employees || data || [];
  const emp = employees.find(e => e.id === id);
  if (!emp) return;
  document.getElementById('modal-emp-title').textContent = 'Edit Employee';
  document.getElementById('emp-form-id').value  = emp.id;
  document.getElementById('emp-name').value     = emp.name;
  document.getElementById('emp-email').value    = emp.email || '';
  document.getElementById('emp-role').value     = emp.role || '';
  document.getElementById('emp-dept').value     = emp.department;
  document.getElementById('emp-status').value   = emp.status || 'Active';
  document.getElementById('emp-salary').value   = emp.salary || 500000;
  document.getElementById('modal-employee')?.classList.add('active');
};

window.hrDeleteEmployee = async function(id, name) {
  if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
  await API.deleteEmployee(id);
  const { renderDirectory } = await import('./directory.js');
  renderDirectory('hr');
};
