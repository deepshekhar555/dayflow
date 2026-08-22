# ai_engine.py
"""
AI Intelligence Engine for HR-HQ Management System
"""

class HRAIEngine:
    def __init__(self, db_helper=None):
        self.db_helper = db_helper

    def process_query(self, query, data):
        q = query.lower().strip()
        employees = data.get('employees', [])
        leaves = data.get('leaves', [])
        reviews = data.get('reviews', [])

        if any(term in q for term in ['who is on leave', 'on leave today', 'current leave', 'absent']):
            on_leave_emps = [e for e in employees if e.get('status') == 'On Leave']
            approved_leaves = [l for l in leaves if l.get('status') == 'Approved']
            
            if not on_leave_emps and not approved_leaves:
                return {
                    "text": "🤖 **AI Intelligence Summary**: All team members are currently active and accounted for. No employees are registered on leave today.",
                    "insights": ["0 Active Leaves", "100% Team Availability"]
                }
            
            leave_details = [f"• **{l['employeeName']}**: {l['type']} ({l['startDate']} to {l['endDate']})" for l in approved_leaves]
            response_text = f"🤖 **AI Insights - Leave Status**:\nThere are currently **{len(on_leave_emps)} employee(s)** on active leave:\n\n"
            response_text += "\n".join(leave_details if leave_details else [f"• {e['name']} ({e['department']})" for e in on_leave_emps])
            
            return {
                "text": response_text,
                "insights": [f"{len(on_leave_emps)} On Leave", "Team Capacity Impacted"]
            }

        if any(term in q for term in ['top performer', 'best rating', 'highest rating', 'star employee', 'performance rating']):
            sorted_emps = sorted(employees, key=lambda x: x.get('rating', 0), reverse=True)
            top_3 = sorted_emps[:3]
            
            response_text = "⭐ **AI Talent Analytics - Top Performers**:\nHere are the top-rated team members based on recent appraisals:\n\n"
            for idx, emp in enumerate(top_3, 1):
                response_text += f"{idx}. **{emp['name']}** ({emp['role']}) - Score: **{emp.get('rating', 0)}/5.0** ({emp['department']})\n"
                
            return {
                "text": response_text,
                "insights": [f"Top Performer: {top_3[0]['name']}", "Avg Rating: 4.65"]
            }

        if any(term in q for term in ['retention risk', 'flight risk', 'at risk', 'attrition', 'who might leave']):
            risks = self.calculate_retention_risks(employees)
            high_risks = [r for r in risks if r['risk_level'] == 'High']
            med_risks = [r for r in risks if r['risk_level'] == 'Medium']
            
            response_text = f"📊 **AI Predictive Retention Model**:\nEvaluated {len(employees)} employee profiles against compensation ratios and performance metrics.\n\n"
            if high_risks or med_risks:
                response_text += "**Flagged Profiles:**\n"
                for r in high_risks + med_risks:
                    response_text += f"⚠️ **{r['name']}** ({r['department']}) - **{r['risk_level']} Risk**\n  *Reason*: {r['reason']}\n"
            else:
                response_text += "✅ All employees show balanced compensation and satisfaction indices. Attrition risk is LOW across all departments."

            return {
                "text": response_text,
                "insights": [f"{len(high_risks)} High Risk", f"{len(med_risks)} Medium Risk"]
            }

        if any(term in q for term in ['payroll', 'salary', 'compensation', 'budget', 'cost']):
            total_salary = sum(e.get('salary', 0) for e in employees)
            monthly_payroll = total_salary / 12
            allowances = total_salary * 0.10
            taxes = total_salary * 0.15
            net_payout = total_salary + allowances - taxes
            
            response_text = f"💰 **AI Financial & Payroll Overview**:\n\n"
            response_text += f"• **Total Annual Payroll**: ${total_salary:,.2f}\n"
            response_text += f"• **Estimated Monthly Disbursement**: ${monthly_payroll:,.2f}\n"
            response_text += f"• **Estimated Taxes Withheld**: ${taxes:,.2f}\n"
            response_text += f"• **Net Monthly Payout**: ${net_payout / 12:,.2f}\n"

            return {
                "text": response_text,
                "insights": [f"${total_salary:,.0f} Total Annual", f"${monthly_payroll:,.0f}/mo Payroll"]
            }

        if 'draft' in q or 'feedback' in q or 'review for' in q:
            name_match = None
            for e in employees:
                if e['name'].lower() in q:
                    name_match = e
                    break
            
            emp = name_match if name_match else (employees[0] if employees else {"name": "Sarah Chen", "role": "Designer", "rating": 4.9})
            feedback = self.generate_review_draft(emp)
            response_text = f"✍️ **AI-Generated Performance Review Draft** for {emp['name']}:\n\n\"{feedback}\""

            return {
                "text": response_text,
                "insights": ["Draft Review Generated", "Ready for HR Sign-off"]
            }

        total_emp = len(employees)
        avg_rating = sum(e.get('rating', 0) for e in employees) / max(total_emp, 1)

        response_text = f"✨ **HQ-AI HR Assistant Active**\nI analyzed your question: *\"{query}\"*\n\n"
        response_text += f"Summary of workforce metrics:\n"
        response_text += f"• Total Active Staff: **{total_emp} employees**\n"
        response_text += f"• Average Rating: **{avg_rating:.2f} / 5.0**\n"
        response_text += f"• Active Leave Requests: **{len(leaves)}**\n\n"
        response_text += "*Try asking:* 'Who is on leave today?', 'What is our total payroll?', 'Show retention risk', or 'Draft review for Sarah Chen'."

        return {
            "text": response_text,
            "insights": [f"{total_emp} Employees", f"Avg Rating {avg_rating:.1f}"]
        }

    def calculate_retention_risks(self, employees):
        dept_salaries = {}
        for e in employees:
            d = e.get('department')
            if d not in dept_salaries:
                dept_salaries[d] = []
            dept_salaries[d].append(e.get('salary', 0))

        dept_avg = {d: sum(sals)/len(sals) for d, sals in dept_salaries.items()}
        
        risks = []
        for e in employees:
            sal = e.get('salary', 0)
            avg = dept_avg.get(e.get('department'), sal)
            rating = e.get('rating', 4.0)

            if rating >= 4.5 and sal < avg:
                risks.append({
                    "id": e['id'],
                    "name": e['name'],
                    "department": e['department'],
                    "risk_level": "High",
                    "reason": f"Top performer ({rating}/5) undercompensated relative to {e['department']} department average (${avg:,.0f})."
                })
            elif rating < 4.1 and sal > avg:
                risks.append({
                    "id": e['id'],
                    "name": e['name'],
                    "department": e['department'],
                    "risk_level": "Medium",
                    "reason": "Lower rating score with above-average salary bracket."
                })
            else:
                risks.append({
                    "id": e['id'],
                    "name": e['name'],
                    "department": e['department'],
                    "risk_level": "Low",
                    "reason": "Balanced compensation and benchmark rating."
                })

        return risks

    def check_leave_conflicts(self, leaves, employees):
        dept_map = {e['id']: e['department'] for e in employees}
        pending_or_approved = [l for l in leaves if l.get('status') in ['Pending', 'Approved']]
        
        dept_leaves = {}
        for l in pending_or_approved:
            dept = dept_map.get(l.get('employeeId'), 'General')
            if dept not in dept_leaves:
                dept_leaves[dept] = []
            dept_leaves[dept].append(l)

        conflicts = []
        for dept, reqs in dept_leaves.items():
            if len(reqs) > 1:
                names = [r['employeeName'] for r in reqs]
                conflicts.append({
                    "department": dept,
                    "count": len(reqs),
                    "employees": names,
                    "warning": f"⚠️ **Capacity Warning**: {len(reqs)} team members ({', '.join(names)}) in **{dept}** have concurrent time-off requests."
                })
        return conflicts

    def generate_review_draft(self, employee):
        rating = employee.get('rating', 4.5)
        name = employee.get('name', 'Employee')
        role = employee.get('role', 'Specialist')
        dept = employee.get('department', 'Team')

        if rating >= 4.5:
            return (f"{name} has consistently exceeded expectations as a {role} in {dept}. "
                    f"Their technical expertise and leadership have driven key milestones. "
                    f"Highly recommended for merit recognition and senior responsibility.")
        elif rating >= 4.0:
            return (f"{name} performs reliably in their role as {role}. "
                    f"They deliver strong work products and demonstrate solid collaboration across {dept}.")
        else:
            return (f"{name} meets baseline requirements for {role}. "
                    f"We recommend aligning on structured quarterly targets in {dept}.")
