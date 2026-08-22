/**
 * HR-HQ API Client — api.js
 * All backend calls to Python Flask server (port 5000)
 */

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    return await res.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    return { error: err.message };
  }
}

export const API = {
  // Auth
  login:    (email, password, portalRole = 'hr', employeeId = null) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, portalRole, employeeId }) }),
  register: (data)               => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  // Employees
  getEmployees:   ()             => request('/employees'),
  addEmployee:    (data)         => request('/employees', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (id, data)     => request(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEmployee: (id)           => request(`/employees/${id}`, { method: 'DELETE' }),

  // Attendance
  getAttendance:  ()             => request('/attendance'),
  addAttendance:  (data)         => request('/attendance', { method: 'POST', body: JSON.stringify(data) }),
  checkIn:        (employeeId)   => request('/attendance/checkin', { method: 'POST', body: JSON.stringify({ employeeId }) }),
  checkOut:       (employeeId)   => request('/attendance/checkout', { method: 'POST', body: JSON.stringify({ employeeId }) }),

  // Leaves
  getLeaves:      ()             => request('/leaves'),
  requestLeave:   (data)         => request('/leaves', { method: 'POST', body: JSON.stringify(data) }),
  updateLeave:    (id, status)   => request(`/leaves/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Performance
  getPerformanceReviews: ()      => request('/reviews'),
  addReview:      (data)         => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  updateReview:   (id, data)     => request(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Payroll
  getPayroll:     ()             => request('/payroll/runs'),
  runPayroll:     (month)        => request('/payroll/run', { method: 'POST', body: JSON.stringify({ month }) }),

  // Onboarding
  getOnboarding:  ()             => request('/employees/onboarding/progress'),
  updateOnboarding: (id, data)   => request(`/employees/onboarding/toggle/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // AI
  chatAI:         (message)      => request('/ai/chat', { method: 'POST', body: JSON.stringify({ prompt: message }) }),
  getInsights:    ()             => request('/ai/insights'),

  // Upload
  uploadData: (formData) => fetch(`${BASE_URL}/upload`, { method: 'POST', body: formData }).then(r => r.json()),
};
