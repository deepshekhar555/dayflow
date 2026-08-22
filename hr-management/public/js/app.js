/**
 * HR-HQ Enterprise — app.js
 * Dual-portal SPA with rupee (₹), dynamic routing,
 * real-time clock, RBAC, and AI integration
 */

import { API } from './api.js';

/* ─── SESSION STATE ─── */
let currentUser = null;  // { name, email, role, department, jobTitle, employeeId }
const paymentState = new Map();

/* ─── UTILITY: Rupee Formatter ─── */
export const formatINR = (amount) => {
  const n = parseFloat(amount) || 0;
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

function normalizeSessionUser(res, fallbackRole, email) {
  const details = res?.details || {};
  const userObj = res?.user || {};
  const role = res?.role || userObj?.role || fallbackRole || 'employee';

  return {
    role,
    name: res?.name || userObj?.name || details?.name || 'User',
    email: userObj?.email || details?.email || email || '',
    employeeId: res?.employeeId || details?.id || userObj?.employeeId || null,
    department: details?.department || '',
    jobTitle: details?.role || '',
    title: res?.title || '',
    avatarText: res?.avatarText || details?.avatarText || '',
    avatarColor: res?.avatarColor || details?.avatarColor || ''
  };
}

/* ─── UTILITY: Init Comps dynamically on-demand ─── */
const viewLoaders = {
  dashboard:    () => import('./components/dashboard.js').then(m => m.renderDashboard()),
  directory:    () => import('./components/directory.js').then(m => m.renderDirectory(currentUser?.role)),
  attendance:   () => import('./components/attendance.js').then(m => m.renderAttendance()),
  'absent-tracker': () => renderAbsentTracker(),
  leaves:       () => import('./components/leaves.js').then(m => m.renderLeaves(currentUser?.role)),
  performance:  () => import('./components/performance.js').then(m => m.renderPerformance()),
  payroll:      () => import('./components/payroll.js').then(m => m.renderPayroll(currentUser?.role)),
  'payslip-payments': () => renderPayslipPayments(),
  onboarding:   () => import('./components/onboarding.js').then(m => m.renderOnboarding(currentUser?.role)),
  analytics:    () => import('./components/analytics.js').then(m => m.renderAnalytics()),
  'ai-assistant': () => import('./components/ai-assistant.js').then(m => m.initAIAssistant('ai-messages-feed', 'ai-input-text', 'btn-send-ai')),
  announcements: () => renderAnnouncements(),
};

/* ─── HR PORTAL NAVIGATION ─── */
function initHRNav() {
  document.querySelectorAll('#hr-sidebar .nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      switchHRView(view);
    });
  });
}

function switchHRView(viewName) {
  // Update nav
  document.querySelectorAll('#hr-sidebar .nav-item').forEach(i => i.classList.remove('active'));
  const navItem = document.querySelector(`#hr-sidebar .nav-item[data-view="${viewName}"]`);
  if (navItem) navItem.classList.add('active');

  // Hide all views
  document.querySelectorAll('#hr-main section[id^="view-"]').forEach(s => s.style.display = 'none');

  // Show target
  const section = document.getElementById(`view-${viewName}`);
  if (section) section.style.display = 'flex';

  // Update header
  const titles = {
    dashboard:     { t: 'Dashboard', s: 'Real-time overview of workforce and key HR indicators.' },
    directory:     { t: 'Employee Directory', s: 'Manage and view all employee records.' },
    attendance:    { t: 'Attendance Management', s: 'Track daily punch-in, punch-out and absenteeism.' },
    'absent-tracker': { t: 'Absent Tracker', s: 'Real-time list of absent staff and follow-up actions.' },
    leaves:        { t: 'Leave Board', s: 'Review, approve or reject leave requests.' },
    performance:   { t: 'Performance Appraisals', s: 'Employee ratings and review management.' },
    payroll:       { t: 'Payroll Management (₹)', s: 'Salary in Indian Rupees — adjustments, TDS, PF, HRA.' },
    'payslip-payments': { t: 'Payslip Payments', s: 'Disburse and track salary payouts employee-wise.' },
    onboarding:    { t: 'Onboarding Tracker', s: 'Checklist progress for all new hires.' },
    analytics:     { t: 'Workforce Analytics', s: 'AI-powered insights and data visualization.' },
    'ai-assistant': { t: 'AI HR Assistant', s: 'NLP-powered HR copilot backed by Python AI engine.' },
    announcements: { t: 'Announcements', s: 'Publish and manage HR-wide company announcements.' },
  };
  const info = titles[viewName] || { t: viewName, s: '' };
  document.getElementById('hr-page-title').textContent = info.t;
  document.getElementById('hr-page-subtitle').textContent = info.s;

  // Dynamically load the component
  if (viewLoaders[viewName]) {
    viewLoaders[viewName]().catch(console.error);
  }
}

/* ─── EMPLOYEE PORTAL NAVIGATION ─── */
function initEmpNav() {
  document.querySelectorAll('#emp-sidebar .nav-item[data-empview]').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.empview;
      switchEmpView(view);
    });
  });
}

function switchEmpView(viewName) {
  document.querySelectorAll('#emp-sidebar .nav-item').forEach(i => i.classList.remove('active'));
  const navItem = document.querySelector(`#emp-sidebar .nav-item[data-empview="${viewName}"]`);
  if (navItem) navItem.classList.add('active');

  document.querySelectorAll('#emp-main section[id^="view-emp-"]').forEach(s => s.style.display = 'none');
  const section = document.getElementById(`view-${viewName}`);
  if (section) section.style.display = 'flex';

  const titles = {
    'emp-home':        { t: 'My Dashboard', s: 'Your personal HR summary and quick stats.' },
    'emp-attendance':  { t: 'My Attendance', s: 'Your daily punch-in, punch-out history.' },
    'emp-payslip':     { t: 'My Payslip (₹)', s: 'Detailed breakdown of your monthly salary in Indian Rupees.' },
    'emp-leaves':      { t: 'My Leave Requests', s: 'View and submit leave applications.' },
    'emp-performance': { t: 'My Performance', s: 'Your appraisals and review history.' },
    'emp-ai':          { t: 'AI Assistant', s: 'Your personal HR copilot.' },
  };
  const info = titles[viewName] || { t: 'Employee Portal', s: '' };
  document.getElementById('emp-page-title').textContent = info.t;
  document.getElementById('emp-page-subtitle').textContent = info.s;

  if (viewName === 'emp-home') renderEmployeeHome();
  else if (viewName === 'emp-attendance') renderEmpAttendance();
  else if (viewName === 'emp-payslip') renderEmpPayslip();
  else if (viewName === 'emp-leaves') renderEmpLeaves();
  else if (viewName === 'emp-performance') renderEmpPerformance();
  else if (viewName === 'emp-ai') import('./components/ai-assistant.js').then(m => m.initAIAssistant('emp-ai-feed', 'emp-ai-input', 'emp-btn-send-ai'));
}

/* ─── AUTH TABS ─── */
function initAuthTabs() {
  const signinBtn  = document.getElementById('tab-btn-signin');
  const registerBtn = document.getElementById('tab-btn-register');
  const loginForm  = document.getElementById('form-login-auth');
  const regForm    = document.getElementById('form-register-auth');

  signinBtn.addEventListener('click', () => {
    signinBtn.classList.add('active');
    registerBtn.classList.remove('active');
    loginForm.style.display = 'block';
    regForm.style.display = 'none';
    document.querySelector('.login-form-title').textContent = 'Welcome Back';
    document.querySelector('.login-form-subtitle').textContent = 'Sign in to your portal or create a new account';
  });

  registerBtn.addEventListener('click', () => {
    registerBtn.classList.add('active');
    signinBtn.classList.remove('active');
    regForm.style.display = 'block';
    loginForm.style.display = 'none';
    document.querySelector('.login-form-title').textContent = 'Create Account';
    document.querySelector('.login-form-subtitle').textContent = 'Join HR-HQ as an Employee or HR Administrator';
  });

  // Account type in register form — toggle employee-specific fields
  document.getElementById('reg-account-type').addEventListener('change', function () {
    const empFields = document.getElementById('reg-emp-fields');
    empFields.style.display = this.value === 'hr' ? 'none' : 'block';
  });
}

/* ─── LOGIN HANDLER ─── */
function initLoginHandler() {
  document.getElementById('form-login-auth').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const role     = document.getElementById('auth-role').value; // 'hr' | 'employee'

    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = 'Signing in...';
    btn.disabled = true;

    try {
      const res = await API.login(email, password, role);
      if (res.success) {
        currentUser = normalizeSessionUser(res, role, email);
        launchPortal(currentUser.role);
      } else {
        alert(res.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      alert('Server error. Make sure Python server is running on port 5000.');
    } finally {
      btn.textContent = 'Log In to Portal →';
      btn.disabled = false;
    }
  });
}

/* ─── REGISTER HANDLER ─── */
function initRegisterHandler() {
  document.getElementById('form-register-auth').addEventListener('submit', async (e) => {
    e.preventDefault();
    const accountType = document.getElementById('reg-account-type').value;
    const name     = document.getElementById('reg-name').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const dept     = document.getElementById('reg-dept').value;
    const role     = document.getElementById('reg-role').value.trim();

    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = 'Creating account...';
    btn.disabled = true;

    try {
      const res = await API.register({ name, email, password, accountType, department: dept, role });
      if (res.success) {
        alert(`✅ Account created for ${name}! Please sign in.`);
        document.getElementById('tab-btn-signin').click();
        document.getElementById('auth-email').value = email;
      } else {
        alert(res.error || 'Failed to create account.');
      }
    } catch (err) {
      alert('Server error. Make sure Python server is running on port 5000.');
    } finally {
      btn.textContent = '✨ Create Account';
      btn.disabled = false;
    }
  });
}

/* ─── LAUNCH PORTAL ─── */
function launchPortal(role) {
  localStorage.setItem('hrhq_session', JSON.stringify(currentUser));
  document.getElementById('view-login').style.display = 'none';

  if (role === 'hr') {
    document.getElementById('portal-hr').style.display = 'block';
    document.getElementById('portal-employee').style.display = 'none';
    populateHRSidebar();
    initHRNav();
    initHRActions();
    initHRModals();
    initThemeToggle();
    startClocks();
    updateBadges();
    switchHRView('dashboard');
  } else {
    document.getElementById('portal-employee').style.display = 'block';
    document.getElementById('portal-hr').style.display = 'none';
    populateEmpSidebar();
    initEmpNav();
    initEmpActions();
    startEmpClocks();
    switchEmpView('emp-home');
  }
}

/* ─── POPULATE SIDEBARS ─── */
function populateHRSidebar() {
  if (!currentUser) return;
  const initials = currentUser.name ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'HR';
  document.getElementById('hr-user-avatar').textContent = initials;
  document.getElementById('hr-user-name').textContent = currentUser.name || 'HR Administrator';
  document.getElementById('hr-user-role').textContent = currentUser.department || 'Assigned by Office';
}
function populateEmpSidebar() {
  if (!currentUser) return;
  const initials = currentUser.name ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'EM';
  document.getElementById('emp-user-avatar').textContent = initials;
  document.getElementById('emp-big-avatar').textContent = initials;
  document.getElementById('emp-user-name').textContent = currentUser.name || 'Employee';
  document.getElementById('emp-user-role').textContent = currentUser.department || 'Employee';
  document.getElementById('emp-big-name').textContent = currentUser.name || 'Employee';
  document.getElementById('emp-big-role').textContent = currentUser.jobTitle || '';
  document.getElementById('emp-big-dept').textContent = currentUser.department || '';
  if (currentUser.employeeId) document.getElementById('emp-big-id').textContent = currentUser.employeeId;
}

/* ─── HR ACTIONS (buttons, upload, switch) ─── */
function initHRActions() {
  document.getElementById('btn-hr-logout').addEventListener('click', logout);
  document.getElementById('btn-hr-switch-emp').addEventListener('click', () => {
    currentUser.role = 'employee';
    localStorage.setItem('hrhq_session', JSON.stringify(currentUser));
    document.getElementById('portal-hr').style.display = 'none';
    document.getElementById('portal-employee').style.display = 'block';
    populateEmpSidebar();
    initEmpNav();
    initEmpActions();
    startEmpClocks();
    switchEmpView('emp-home');
  });
  document.getElementById('btn-open-upload-data').addEventListener('click', () => openModal('modal-upload-data'));
  document.getElementById('btn-analytics-upload-data')?.addEventListener('click', () => openModal('modal-upload-data'));
  document.getElementById('btn-refresh-absent')?.addEventListener('click', renderAbsentTracker);
  document.getElementById('payment-status-filter')?.addEventListener('change', renderPayslipPayments);

  document.getElementById('btn-add-announcement')?.addEventListener('click', () => {
    const panel = document.getElementById('announcement-compose');
    if (panel) panel.style.display = 'block';
  });
  document.getElementById('btn-cancel-announcement')?.addEventListener('click', () => {
    const panel = document.getElementById('announcement-compose');
    if (panel) panel.style.display = 'none';
  });
  document.getElementById('btn-save-announcement')?.addEventListener('click', saveAnnouncement);
}

function initEmpActions() {
  document.getElementById('btn-emp-logout').addEventListener('click', logout);
  document.getElementById('emp-btn-request-leave')?.addEventListener('click', () => openModal('modal-leave'));
  document.getElementById('btn-emp-request-leave-header')?.addEventListener('click', () => openModal('modal-leave'));
  document.getElementById('emp-theme-toggle')?.addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme',
      document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
}

function logout() {
  localStorage.removeItem('hrhq_session');
  currentUser = null;
  document.getElementById('view-login').style.display = 'flex';
  document.getElementById('portal-hr').style.display = 'none';
  document.getElementById('portal-employee').style.display = 'none';
}

/* ─── MODALS ─── */
function initHRModals() {
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  document.getElementById('btn-add-emp')?.addEventListener('click', () => {
    document.getElementById('modal-emp-title').textContent = 'Add New Employee';
    document.getElementById('form-employee').reset();
    openModal('modal-employee');
  });
  document.getElementById('btn-add-review')?.addEventListener('click', () => {
    populateEmployeeDropdowns();
    openModal('modal-review');
  });
  document.getElementById('btn-request-leave')?.addEventListener('click', () => {
    populateEmployeeDropdowns();
    openModal('modal-leave');
  });
  document.getElementById('btn-run-monthly-payroll')?.addEventListener('click', runMonthlyPayroll);

  // Form submissions
  document.getElementById('form-employee')?.addEventListener('submit', handleEmpFormSubmit);
  document.getElementById('form-leave')?.addEventListener('submit', handleLeaveFormSubmit);
  document.getElementById('form-review')?.addEventListener('submit', handleReviewFormSubmit);
  document.getElementById('form-upload-data')?.addEventListener('submit', handleUploadData);
}

function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}

async function populateEmployeeDropdowns() {
  const emps = await API.getEmployees();
  ['leave-emp-id', 'review-emp-id'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '';
    (emps.employees || emps || []).forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id || e._id;
      opt.textContent = e.name + ' (' + e.department + ')';
      sel.appendChild(opt);
    });
  });
}

async function handleEmpFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('emp-form-id').value;
  const data = {
    name: document.getElementById('emp-name').value,
    email: document.getElementById('emp-email').value,
    role: document.getElementById('emp-role').value,
    department: document.getElementById('emp-dept').value,
    status: document.getElementById('emp-status').value,
    salary: parseInt(document.getElementById('emp-salary').value),
    joinDate: new Date().toISOString().split('T')[0],
  };
  if (id) await API.updateEmployee(id, data);
  else await API.addEmployee(data);
  document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  import('./components/directory.js').then(m => m.renderDirectory(currentUser?.role));
}

async function handleLeaveFormSubmit(e) {
  e.preventDefault();
  const data = {
    employeeId: document.getElementById('leave-emp-id').value,
    type: document.getElementById('leave-type').value,
    startDate: document.getElementById('leave-start').value,
    endDate: document.getElementById('leave-end').value,
    reason: document.getElementById('leave-reason').value,
    status: 'Pending',
  };
  await API.requestLeave(data);
  document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  import('./components/leaves.js').then(m => m.renderLeaves(currentUser?.role));
}

async function handleReviewFormSubmit(e) {
  e.preventDefault();
  const data = {
    employeeId: document.getElementById('review-emp-id').value,
    reviewer: document.getElementById('review-reviewer').value,
    score: parseFloat(document.getElementById('review-score').value),
    feedback: document.getElementById('review-feedback').value,
    date: new Date().toISOString().split('T')[0],
  };
  await API.addReview(data);
  document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  import('./components/performance.js').then(m => m.renderPerformance());
}

async function handleUploadData(e) {
  e.preventDefault();
  const category = document.getElementById('upload-category').value;
  const file = document.getElementById('upload-file').files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  const res = await API.uploadData(formData);
  alert(res.message || 'Upload complete!');
  document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  if (viewLoaders[category] || viewLoaders[category + 's']) {
    (viewLoaders[category] || viewLoaders[category + 's'])();
  }
}

async function runMonthlyPayroll() {
  if (!confirm('Run payroll for all employees this month?')) return;
  const month = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const res = await API.runPayroll(month);
  alert(res.message || 'Payroll run complete!');
  import('./components/payroll.js').then(m => m.renderPayroll(currentUser?.role));
}

/* ─── THEME TOGGLE ─── */
function initThemeToggle() {
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.innerHTML = current === 'dark'
        ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    }
  });
}

/* ─── LIVE CLOCKS ─── */
function startClocks() {
  function tick() {
    const now = new Date();
    const t = now.toLocaleTimeString('en-IN');
    const d = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const el1 = document.getElementById('live-clock');
    const el2 = document.getElementById('live-date');
    if (el1) el1.textContent = t;
    if (el2) el2.textContent = d;
  }
  tick();
  setInterval(tick, 1000);
}

function startEmpClocks() {
  function tick() {
    const now = new Date();
    const t = now.toLocaleTimeString('en-IN');
    const d = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const el1 = document.getElementById('emp-live-clock');
    const el2 = document.getElementById('emp-live-date');
    if (el1) el1.textContent = t;
    if (el2) el2.textContent = d;
  }
  tick();
  setInterval(tick, 1000);
}

/* ─── NAV BADGES (pending leaves etc.) ─── */
async function updateBadges() {
  try {
    const data = await API.getLeaves();
    const leaves = data.leaves || data || [];
    const pending = leaves.filter(l => l.status === 'Pending').length;
    const badge = document.getElementById('hr-leave-badge');
    if (badge) badge.textContent = pending;

    const attData = await API.getAttendance();
    const attLogs = attData.attendance || attData || [];
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = attLogs.filter(a => a.date === today);
    const attBadge = document.getElementById('hr-att-badge');
    if (attBadge) attBadge.textContent = todayLogs.length;

    const employeesData = await API.getEmployees();
    const employees = employeesData.employees || employeesData || [];
    const onLeaveToday = new Set(
      leaves
        .filter(l => l.status === 'Approved')
        .map(l => l.employeeId)
    );
    const absentEmployees = employees.filter(emp => {
      const hasLogToday = todayLogs.some(log => log.employeeId === emp.id);
      const approvedLeave = onLeaveToday.has(emp.id);
      return !hasLogToday && !approvedLeave;
    });
    const absentBadge = document.getElementById('hr-absent-badge');
    if (absentBadge) absentBadge.textContent = absentEmployees.length;
  } catch (e) { /* silent */ }
}

async function renderAbsentTracker() {
  const tbody = document.getElementById('absent-table-body');
  if (!tbody) return;

  try {
    const [employeesData, leavesData, attData] = await Promise.all([
      API.getEmployees(),
      API.getLeaves(),
      API.getAttendance(),
    ]);

    const employees = employeesData.employees || employeesData || [];
    const leaves = leavesData.leaves || leavesData || [];
    const attendance = attData.attendance || attData || [];
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = attendance.filter(a => a.date === today);
    const approvedLeaveMap = new Map(
      leaves
        .filter(l => l.status === 'Approved')
        .map(l => [l.employeeId, l])
    );

    const absentRows = employees
      .filter(emp => {
        const hasAttendance = todayLogs.some(log => log.employeeId === emp.id);
        const approvedLeave = approvedLeaveMap.has(emp.id);
        return !hasAttendance && !approvedLeave;
      })
      .map(emp => ({ emp, reason: 'No check-in and no approved leave' }));

    if (!absentRows.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:28px;" class="text-muted">No absent employees right now.</td></tr>';
      return;
    }

    tbody.innerHTML = absentRows.map(({ emp, reason }) => `
      <tr>
        <td><strong>${emp.name}</strong> <span class="text-muted">(${emp.id})</span></td>
        <td>${emp.department || '-'}</td>
        <td><span class="badge-danger">Absent</span></td>
        <td>${reason}</td>
        <td><button class="btn btn-secondary" style="padding:6px 10px;font-size:12px;" data-followup-email="${emp.email || ''}">Follow Up</button></td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-followup-email]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const email = e.currentTarget.getAttribute('data-followup-email') || 'No email found';
        alert(`Follow-up reminder prepared for: ${email}`);
      });
    });
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:28px;" class="text-danger">Failed to load absent tracker.</td></tr>';
  }
}

async function renderPayslipPayments() {
  const tbody = document.getElementById('payments-table-body');
  const filterEl = document.getElementById('payment-status-filter');
  if (!tbody) return;

  try {
    const employeesData = await API.getEmployees();
    const employees = employeesData.employees || employeesData || [];
    const month = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const filter = filterEl ? filterEl.value : 'All';

    const rows = employees.map((emp) => {
      const key = `${month}::${emp.id}`;
      if (!paymentState.has(key)) {
        paymentState.set(key, {
          status: 'Pending',
          mode: 'Bank Transfer',
        });
      }
      const state = paymentState.get(key);
      const monthly = Math.round((Number(emp.salary) || 0) / 12);
      const net = Math.round(monthly + monthly * 0.15 - 200 - monthly * 0.22);
      return { emp, key, month, net, state };
    }).filter(row => filter === 'All' || row.state.status === filter);

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:28px;" class="text-muted">No payments match this filter.</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map(({ emp, key, month, net, state }) => `
      <tr>
        <td><strong>${emp.name}</strong> <span class="text-muted">(${emp.id})</span></td>
        <td>${month}</td>
        <td style="font-weight:700;">${formatINR(net)}</td>
        <td>${state.mode}</td>
        <td>${state.status === 'Paid' ? '<span class="badge-present">Paid</span>' : '<span class="badge-late">Pending</span>'}</td>
        <td>
          <button class="btn ${state.status === 'Paid' ? 'btn-secondary' : 'btn-primary'}" style="padding:6px 10px;font-size:12px;" data-mark-paid="${key}">
            ${state.status === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-mark-paid]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const key = e.currentTarget.getAttribute('data-mark-paid');
        const item = paymentState.get(key);
        if (item) {
          item.status = item.status === 'Paid' ? 'Pending' : 'Paid';
          paymentState.set(key, item);
          renderPayslipPayments();
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:28px;" class="text-danger">Unable to load payment center.</td></tr>';
  }
}

function renderAnnouncements() {
  const container = document.getElementById('announcement-list');
  if (!container) return;

  const raw = localStorage.getItem('hrhq_announcements');
  const list = raw ? JSON.parse(raw) : [];

  if (!list.length) {
    container.innerHTML = '<div class="glass-panel" style="text-align:center;padding:32px;" class="text-muted">No announcements published yet.</div>';
    return;
  }

  container.innerHTML = list.map(item => `
    <article class="glass-panel">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
        <div>
          <h3 style="font-size:16px;">${item.title}</h3>
          <p class="text-muted" style="font-size:12px;margin-top:4px;">${item.date}</p>
        </div>
        <button class="btn btn-secondary" style="padding:5px 10px;font-size:12px;" data-delete-announcement="${item.id}">Delete</button>
      </div>
      <p style="margin-top:10px; line-height:1.6; font-size:13px;">${item.message}</p>
    </article>
  `).join('');

  container.querySelectorAll('[data-delete-announcement]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-delete-announcement');
      const next = list.filter(item => item.id !== id);
      localStorage.setItem('hrhq_announcements', JSON.stringify(next));
      renderAnnouncements();
    });
  });
}

function saveAnnouncement() {
  const titleEl = document.getElementById('announcement-title');
  const messageEl = document.getElementById('announcement-message');
  const panel = document.getElementById('announcement-compose');
  if (!titleEl || !messageEl) return;

  const title = titleEl.value.trim();
  const message = messageEl.value.trim();
  if (!title || !message) {
    alert('Please add title and message.');
    return;
  }

  const raw = localStorage.getItem('hrhq_announcements');
  const list = raw ? JSON.parse(raw) : [];
  list.unshift({
    id: `ANN-${Date.now()}`,
    title,
    message,
    date: new Date().toLocaleString('en-IN'),
  });
  localStorage.setItem('hrhq_announcements', JSON.stringify(list));

  titleEl.value = '';
  messageEl.value = '';
  if (panel) panel.style.display = 'none';
  renderAnnouncements();
}

/* ─── EMPLOYEE PORTAL — VIEW RENDERERS ─── */

async function renderEmployeeHome() {
  if (!currentUser) return;
  try {
    const [empData, attData, leaveData, reviewData] = await Promise.all([
      API.getEmployees(),
      API.getAttendance(),
      API.getLeaves(),
      API.getPerformanceReviews(),
    ]);

    const employees = empData.employees || empData || [];
    const empRecord = employees.find(e =>
      e.email === currentUser.email ||
      e.id === currentUser.employeeId ||
      e.name?.toLowerCase() === currentUser.name?.toLowerCase()
    ) || employees[0];

    if (empRecord) {
      currentUser.employeeId = empRecord.id;
      document.getElementById('emp-big-id').textContent = empRecord.id || '-';
      document.getElementById('emp-big-name').textContent = empRecord.name || currentUser.name;
      document.getElementById('emp-big-role').textContent = empRecord.role || currentUser.jobTitle || '';
      document.getElementById('emp-big-dept').textContent = empRecord.department || currentUser.department || '';
      const initials = (empRecord.name || currentUser.name || 'EM').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
      document.getElementById('emp-big-avatar').textContent = initials;

      const monthly = Math.round((empRecord.salary || 500000) / 12);
      document.getElementById('eq-salary').textContent = formatINR(monthly);

      // Rating
      const reviews = reviewData.reviews || reviewData || [];
      const myReviews = reviews.filter(r => r.employeeId === empRecord.id || r.employeeName === empRecord.name);
      const avgRating = myReviews.length
        ? (myReviews.reduce((s, r) => s + (parseFloat(r.score) || 0), 0) / myReviews.length).toFixed(1)
        : '-';
      document.getElementById('eq-rating').textContent = avgRating;
    }

    // Attendance stats
    const attendance = attData.attendance || attData || [];
    const today = new Date().toISOString().split('T')[0];
    const myAtt = attendance.filter(a => a.employeeId === (empRecord?.id || currentUser.employeeId));
    const todayAtt = myAtt.filter(a => a.date === today);

    document.getElementById('eq-days-present').textContent = myAtt.filter(a => a.status === 'Present').length;

    // Leave stats
    const leaves = leaveData.leaves || leaveData || [];
    const myLeaves = leaves.filter(l => l.employeeId === (empRecord?.id || currentUser.employeeId));
    document.getElementById('eq-leaves').textContent = myLeaves.length;

    // Today att table
    const tbody = document.getElementById('emp-today-att-body');
    if (tbody) {
      if (todayAtt.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">No attendance record for today yet.</td></tr>';
      } else {
        tbody.innerHTML = todayAtt.map(a => `
          <tr>
            <td>${a.date || '-'}</td>
            <td>${a.punchIn || '-'}</td>
            <td>${a.punchOut || '-'}</td>
            <td>${a.hours || '-'}</td>
            <td><span class="badge-${(a.status||'').toLowerCase()}">${a.status || '-'}</span></td>
          </tr>
        `).join('');
      }
    }
  } catch (err) { console.error('Employee home error:', err); }
}

async function renderEmpAttendance() {
  if (!currentUser) return;
  try {
    const attData = await API.getAttendance();
    const attendance = attData.attendance || attData || [];

    const empData = await API.getEmployees();
    const employees = empData.employees || empData || [];
    const empRecord = employees.find(e => e.email === currentUser.email) || employees[0];
    const myAtt = empRecord ? attendance.filter(a => a.employeeId === empRecord.id || a.name === empRecord.name) : attendance;

    document.getElementById('emp-att-present').textContent = myAtt.filter(a => a.status === 'Present').length;
    document.getElementById('emp-att-late').textContent = myAtt.filter(a => a.status === 'Late').length;
    document.getElementById('emp-att-absent').textContent = myAtt.filter(a => a.status === 'Absent').length;

    const tbody = document.getElementById('emp-att-table-body');
    if (!tbody) return;
    if (!myAtt.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">No attendance records found.</td></tr>';
      return;
    }
    tbody.innerHTML = myAtt.map(a => `
      <tr>
        <td>${a.date || '-'}</td>
        <td>${a.punchIn || '-'}</td>
        <td>${a.punchOut || '-'}</td>
        <td>${a.hours || '-'}</td>
        <td><span class="badge-${(a.status||'present').toLowerCase()}">${a.status || 'Present'}</span></td>
      </tr>
    `).join('');

    // Punch in/out
    document.getElementById('emp-btn-checkin')?.addEventListener('click', () => recordPunch('in', empRecord));
    document.getElementById('emp-btn-checkout')?.addEventListener('click', () => recordPunch('out', empRecord));
  } catch (err) { console.error(err); }
}

async function recordPunch(type, empRecord) {
  try {
    if (!empRecord?.id) {
      alert('Employee record not found for attendance action.');
      return;
    }

    const res = type === 'in'
      ? await API.checkIn(empRecord.id)
      : await API.checkOut(empRecord.id);

    if (res?.error) {
      alert(`Unable to record attendance: ${res.error}`);
      return;
    }

    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    alert(`✅ Punch ${type === 'in' ? 'In' : 'Out'} recorded at ${time} for ${empRecord?.name || 'you'}`);
    await renderEmpAttendance();
    await renderEmployeeHome();
    updateBadges();
  } catch (err) {
    alert('Failed to record punch action.');
  }
}

async function renderEmpPayslip() {
  if (!currentUser) return;
  try {
    const empData = await API.getEmployees();
    const employees = empData.employees || empData || [];
    const emp = employees.find(e => e.email === currentUser.email) || employees[0];
    if (!emp) return;

    const annualCTC  = emp.salary || 500000;
    const monthly    = Math.round(annualCTC / 12);
    const hra        = Math.round(monthly * 0.10);
    const da         = Math.round(monthly * 0.05);
    const gross      = monthly + hra + da;
    const pt         = 200;
    const tds        = Math.round(monthly * 0.10);
    const pf         = Math.round(monthly * 0.12);
    const net        = gross - pt - tds - pf;

    const now = new Date();
    const month = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    document.getElementById('payslip-emp-name').textContent = emp.name;
    document.getElementById('payslip-emp-role').textContent = `${emp.role} | ${emp.department}`;
    document.getElementById('payslip-month').textContent = month;
    document.getElementById('payslip-emp-id').textContent = `EMP ID: ${emp.id}`;
    document.getElementById('slip-annual-ctc').textContent = formatINR(annualCTC);
    document.getElementById('slip-monthly-gross').textContent = formatINR(monthly);
    document.getElementById('slip-hra').textContent = '+' + formatINR(hra);
    document.getElementById('slip-da').textContent = '+' + formatINR(da);
    document.getElementById('slip-pt').textContent = '-₹200';
    document.getElementById('slip-tds').textContent = '-' + formatINR(tds);
    document.getElementById('slip-pf').textContent = '-' + formatINR(pf);
    document.getElementById('slip-net').textContent = formatINR(net);
  } catch (err) { console.error(err); }
}

async function renderEmpLeaves() {
  if (!currentUser) return;
  try {
    const data = await API.getLeaves();
    const leaves = data.leaves || data || [];
    const empData = await API.getEmployees();
    const employees = empData.employees || empData || [];
    const emp = employees.find(e => e.email === currentUser.email) || employees[0];
    const myLeaves = emp ? leaves.filter(l => l.employeeId === emp.id || l.employeeName === emp.name) : leaves;

    const container = document.getElementById('emp-leave-cards');
    if (!container) return;

    if (!myLeaves.length) {
      container.innerHTML = '<div class="glass-panel" style="text-align:center;padding:40px;color:var(--text-muted);">No leave requests yet. Click "New Leave Request" to apply.</div>';
      return;
    }

    container.innerHTML = myLeaves.map(l => {
      const color = l.status === 'Approved' ? 'success' : l.status === 'Rejected' ? 'danger' : 'warning';
      return `
        <div class="glass-panel leave-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <span style="font-weight:700;font-size:15px;">${l.type}</span>
            <span class="badge-${color === 'warning' ? 'late' : color}">${l.status}</span>
          </div>
          <p style="font-size:12px;color:var(--text-muted);">📅 ${l.startDate} — ${l.endDate}</p>
          <p style="font-size:13px;">${l.reason || ''}</p>
        </div>
      `;
    }).join('');
  } catch (err) { console.error(err); }
}

async function renderEmpPerformance() {
  if (!currentUser) return;
  try {
    const data = await API.getPerformanceReviews();
    const reviews = data.reviews || data || [];
    const empData = await API.getEmployees();
    const employees = empData.employees || empData || [];
    const emp = employees.find(e => e.email === currentUser.email) || employees[0];
    const myReviews = emp ? reviews.filter(r => r.employeeId === emp.id || r.employeeName === emp.name) : reviews;

    const container = document.getElementById('emp-reviews-cards');
    if (!container) return;

    if (!myReviews.length) {
      container.innerHTML = '<div class="glass-panel" style="text-align:center;padding:40px;color:var(--text-muted);">No performance reviews found for your account.</div>';
      return;
    }

    container.innerHTML = myReviews.map(r => {
      const stars = '⭐'.repeat(Math.round(parseFloat(r.score) || 0));
      return `
        <div class="glass-panel">
          <p style="font-size:12px;color:var(--text-muted);">📅 ${r.date || '-'} | Reviewer: ${r.reviewer}</p>
          <p style="font-size:20px;margin:8px 0;">${stars}</p>
          <p style="font-size:22px;font-weight:800;color:var(--accent-primary);">${r.score} / 5.0</p>
          <p style="font-size:13px;color:var(--text-secondary);margin-top:8px;">${r.feedback}</p>
        </div>
      `;
    }).join('');
  } catch (err) { console.error(err); }
}

/* ─── GLOBAL SEARCH ─── */
function initGlobalSearch() {
  document.getElementById('hr-global-search')?.addEventListener('input', function () {
    const q = this.value.toLowerCase().trim();
    document.querySelectorAll('#directory-table-body tr').forEach(tr => {
      tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

/* ─── RESTORE SESSION ─── */
function restoreSession() {
  try {
    const saved = localStorage.getItem('hrhq_session');
    if (saved) {
      currentUser = JSON.parse(saved);
      launchPortal(currentUser.role);
    }
  } catch { /* ignore */ }
}

/* ─── BOOT ─── */
document.addEventListener('DOMContentLoaded', () => {
  initAuthTabs();
  initLoginHandler();
  initRegisterHandler();
  initGlobalSearch();
  restoreSession();
});
