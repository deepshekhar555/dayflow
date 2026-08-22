/**
 * analytics.js — Workforce Analytics (₹ Rupee)
 */
import { API } from '../api.js';

const INR = n => '₹' + (parseFloat(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const DEPT_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#06b6d4','#8b5cf6'];

let chartDeptCost  = null;
let chartRating    = null;

export async function renderAnalytics() {
  try {
    const [empData, aiData] = await Promise.all([API.getEmployees(), API.getInsights()]);
    const employees = empData.employees || empData || [];

    // --- Department Salary Chart (₹) ---
    const deptSalary = {};
    employees.forEach(e => {
      const dept = e.department || 'Unknown';
      deptSalary[dept] = (deptSalary[dept] || 0) + Math.round((e.salary || 500000) / 12);
    });
    const deptLabels  = Object.keys(deptSalary);
    const deptAmounts = Object.values(deptSalary);

    const ctx1 = document.getElementById('chart-dept-cost')?.getContext('2d');
    if (ctx1) {
      if (chartDeptCost) chartDeptCost.destroy();
      chartDeptCost = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: deptLabels,
          datasets: [{
            label: 'Monthly Dept Payroll (₹)',
            data: deptAmounts,
            backgroundColor: DEPT_COLORS.slice(0, deptLabels.length),
            borderRadius: 8,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: ctx => ' ' + INR(ctx.raw) }
            },
          },
          scales: {
            y: {
              ticks: {
                color: '#9ca3af',
                callback: v => '₹' + (v/1000).toFixed(0) + 'K',
              },
              grid: { color: 'rgba(255,255,255,0.05)' },
            },
            x: { ticks: { color: '#9ca3af' }, grid: { display: false } },
          },
        },
      });
    }

    // --- Rating vs Salary Scatter ---
    const scatterData = employees.map(e => ({
      x: parseFloat(e.performanceScore) || 0,
      y: Math.round((e.salary || 500000) / 12),
      label: e.name,
    }));
    const ctx2 = document.getElementById('chart-rating-salary')?.getContext('2d');
    if (ctx2) {
      if (chartRating) chartRating.destroy();
      chartRating = new Chart(ctx2, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Rating vs Monthly Pay',
            data: scatterData,
            backgroundColor: '#6366f1aa',
            pointRadius: 7,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.raw.label || ''}: Rating ${ctx.raw.x} | ${INR(ctx.raw.y)}/mo`,
              }
            },
          },
          scales: {
            x: { title: { display: true, text: 'Rating', color: '#9ca3af' }, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { title: { display: true, text: 'Monthly Pay (₹)', color: '#9ca3af' }, ticks: { color: '#9ca3af', callback: v => '₹' + (v/1000).toFixed(0) + 'K' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          },
        },
      });
    }

    // --- Retention Risk Table ---
    const risks = (aiData.retention_risks || []).length > 0
      ? aiData.retention_risks
      : employees.slice(0, 6).map(e => ({
          name: e.name, department: e.department,
          risk: parseFloat(e.performanceScore) < 3.5 ? 'High' : parseFloat(e.performanceScore) < 4.2 ? 'Medium' : 'Low',
          analysis: parseFloat(e.performanceScore) < 3.5
            ? 'Low performance score; review engagement plan'
            : parseFloat(e.performanceScore) < 4.2
            ? 'Average performer; can be retained with benefits'
            : 'High performer; ensure competitive CTC',
        }));

    const riskTbody = document.getElementById('retention-risk-table');
    if (riskTbody) {
      riskTbody.innerHTML = risks.map(r => {
        const riskClass = r.risk === 'High' ? 'badge-danger' : r.risk === 'Medium' ? 'badge-late' : 'badge-present';
        return `
          <tr>
            <td style="font-weight:600;">${r.name}</td>
            <td>${r.department || '-'}</td>
            <td><span class="${riskClass}">${r.risk}</span></td>
            <td style="font-size:12px;color:var(--text-secondary);">${r.analysis}</td>
          </tr>
        `;
      }).join('');
    }
  } catch (err) { console.error('Analytics error:', err); }
}
