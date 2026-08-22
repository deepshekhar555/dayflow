/**
 * performance.js — Performance Reviews
 */
import { API } from '../api.js';

export async function renderPerformance() {
  try {
    const [reviewData, empData] = await Promise.all([API.getPerformanceReviews(), API.getEmployees()]);
    const reviews   = reviewData.reviews  || reviewData || [];
    const employees = empData.employees   || empData || [];
    const empMap = {};
    employees.forEach(e => { empMap[e.id] = e; });

    const container = document.getElementById('reviews-history-cards');
    if (!container) return;

    if (!reviews.length) {
      container.innerHTML = '<div class="glass-panel" style="text-align:center;padding:40px;color:var(--text-muted);">No reviews logged yet. Click "Log Review" to add.</div>';
      return;
    }

    container.innerHTML = reviews.map(r => {
      const emp = empMap[r.employeeId] || {};
      const stars = '⭐'.repeat(Math.round(parseFloat(r.score) || 0));
      const score = parseFloat(r.score) || 0;
      const color = score >= 4.5 ? '#10b981' : score >= 3.5 ? '#f59e0b' : '#ef4444';
      return `
        <div class="glass-panel">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <span style="font-weight:700;font-size:15px;">${r.employeeName || emp.name || r.employeeId}</span>
            <span style="font-size:22px;font-weight:800;color:${color};">${r.score}</span>
          </div>
          <p style="font-size:12px;color:var(--text-muted);">📅 ${r.date || '-'} | Reviewer: ${r.reviewer || 'HR'}</p>
          <p style="margin:8px 0;font-size:18px;">${stars}</p>
          <p style="font-size:13px;color:var(--text-secondary);">${r.feedback || ''}</p>
        </div>
      `;
    }).join('');
  } catch (err) { console.error('Performance error:', err); }
}
