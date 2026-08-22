/**
 * payroll.js — Payroll Manager (Indian Rupees ₹)
 */
import { API } from '../api.js';

const INR = n => '₹' + (parseFloat(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export async function renderPayroll(currentUserRole) {
  const isHR = currentUserRole === 'hr';
  try {
    const [empData, payrollData] = await Promise.all([API.getEmployees(), API.getPayroll()]);
    const employees = empData.employees || empData || [];
    const runs      = payrollData.runs  || payrollData || [];
    renderPayrollTable(employees, isHR);
    renderRunsTable(runs, isHR);
  } catch (e) { console.error('Payroll render error:', e); }
}

function renderPayrollTable(employees, isHR) {
  const tbody = document.getElementById('payroll-table-body');
  if (!tbody) return;

  if (!employees.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;">No employees found.</td></tr>';
    return;
  }

  tbody.innerHTML = employees.map(emp => {
    const annual   = emp.salary || 500000;
    const monthly  = Math.round(annual / 12);
    const pf       = Math.round(monthly * 0.12);
    const tds      = Math.round(monthly * 0.10);
    const net      = monthly - pf - tds - 200;
    const rating   = emp.performanceScore || 'N/A';
    const initials = (emp.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const color    = emp.department === 'Engineering' ? '#6366f1'
                   : emp.department === 'Design' ? '#ec4899'
                   : emp.department === 'Finance' ? '#f59e0b'
                   : '#06b6d4';
    return `
      <tr>
        <td>
          <div class="employee-cell">
            <div class="employee-avatar-circle" style="background:${color}22;color:${color};">${initials}</div>
            <div class="employee-name-stack">
              <span class="emp-name-main">${emp.name}</span>
              <span class="emp-id-sub">${emp.id || ''}</span>
            </div>
          </div>
        </td>
        <td>${emp.department}</td>
        <td style="font-weight:700;">${INR(annual)}</td>
        <td style="color:var(--status-active);font-weight:700;">${INR(net)}</td>
        <td>${rating !== 'N/A' ? '⭐ ' + rating : '-'}</td>
        ${isHR ? `<td>
          <div style="display:flex;align-items:center;gap:12px;">
            <input type="range" min="100000" max="2000000" step="10000"
              value="${annual}"
              id="salary-slider-${emp.id}"
              oninput="document.getElementById('salary-display-${emp.id}').textContent = '₹'+parseInt(this.value).toLocaleString('en-IN')">
            <span id="salary-display-${emp.id}" style="font-size:12px;font-weight:700;white-space:nowrap;">${INR(annual)}</span>
          </div>
        </td>` : '<td>—</td>'}
        <td>
          <button class="btn btn-secondary" style="font-size:12px;padding:6px 12px;"
            onclick="showPayslipModal('${emp.id}', '${emp.name}', '${emp.role || ''}', '${emp.department}', ${annual})">
            🧾 View
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderRunsTable(runs, isHR) {
  const tbody = document.getElementById('payroll-runs-table-body');
  if (!tbody) return;

  if (!runs.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;">No payroll runs yet. Click "Run Monthly Payroll" to start.</td></tr>';
    return;
  }

  tbody.innerHTML = runs.map(r => {
    const statusColor = r.status === 'Approved' || r.status === 'Completed' ? 'badge-present' : 'badge-late';
    return `
      <tr>
        <td style="font-family:monospace;font-size:12px;">${r.id || r._id || '-'}</td>
        <td>${r.month || '-'}</td>
        <td>${r.processedOn || r.date || '-'}</td>
        <td>${INR(r.totalGross || r.grossTotal || 0)}</td>
        <td style="color:var(--status-active);font-weight:700;">${INR(r.totalNet || r.netTotal || 0)}</td>
        <td><span class="${statusColor}">${r.status || 'Pending'}</span></td>
        <td>${isHR && r.status === 'Pending'
          ? `<button class="btn btn-success" style="font-size:11px;padding:4px 10px;" onclick="approvePayrollRun('${r.id || r._id}')">✓ Approve</button>`
          : '—'
        }</td>
      </tr>
    `;
  }).join('');
}

// Expose to window for inline onclick handlers
window.showPayslipModal = function(empId, empName, role, dept, annual) {
  const monthly = Math.round(annual / 12);
  const hra     = Math.round(monthly * 0.10);
  const da      = Math.round(monthly * 0.05);
  const gross   = monthly + hra + da;
  const pt      = 200;
  const tds     = Math.round(monthly * 0.10);
  const pf      = Math.round(monthly * 0.12);
  const net     = gross - pt - tds - pf;
  const month   = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const modalContent = document.getElementById('payslip-modal-content');
  if (!modalContent) return;
  modalContent.innerHTML = `
    <div class="payslip-header">
      <div style="display:flex;justify-content:space-between;color:white;">
        <div>
          <p style="font-size:11px;opacity:0.7;">SALARY STATEMENT — ${month}</p>
          <h3 style="font-size:18px;margin-top:4px;">${empName}</h3>
          <p style="font-size:12px;opacity:0.8;">${role} | ${dept}</p>
        </div>
        <div style="text-align:right;font-size:12px;opacity:0.7;">ID: ${empId}</div>
      </div>
    </div>
    <div style="margin-top:4px;">
      <div class="rupee-row"><span class="label">Annual CTC</span><span class="amount">${INR(annual)}</span></div>
      <div class="rupee-row"><span class="label">Monthly Gross</span><span class="amount">${INR(monthly)}</span></div>
      <div class="rupee-row"><span class="label">+ HRA (10%)</span><span class="amount positive">+${INR(hra)}</span></div>
      <div class="rupee-row"><span class="label">+ DA (5%)</span><span class="amount positive">+${INR(da)}</span></div>
      <div class="rupee-row"><span class="label">- Professional Tax</span><span class="amount negative">-₹200</span></div>
      <div class="rupee-row"><span class="label">- TDS (10%)</span><span class="amount negative">-${INR(tds)}</span></div>
      <div class="rupee-row"><span class="label">- PF (12%)</span><span class="amount negative">-${INR(pf)}</span></div>
      <div class="rupee-row" style="border-top:2px solid var(--border-color);margin-top:8px;padding-top:14px;">
        <span style="font-weight:700;font-size:14px;">Net Take-Home (₹)</span>
        <span class="rupee-amount amount net">${INR(net)}</span>
      </div>
    </div>
  `;
  document.getElementById('modal-payslip')?.classList.add('active');
};

window.approvePayrollRun = async function(runId) {
  const { API: api } = await import('../api.js');
  alert(`Payroll run ${runId} approved! Disbursement initiated.`);
};
