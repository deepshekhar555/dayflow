# server.py
"""
HR-HQ Management System - Python Backend Server with PyMongo & AI
"""

import os
import random
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ai_engine import HRAIEngine
from db_mongo import db_helper

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

ai_engine = HRAIEngine()

# Static File Routes
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# --- AUTH & PORTAL API ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    name = data.get('name', '').strip()
    password = data.get('password', '').strip()
    account_type = data.get('accountType', 'employee') # 'hr' or 'employee'
    department = data.get('department', 'Engineering')
    role = data.get('role', 'Software Engineer')

    if not email or not password or not name:
        return jsonify({"error": "Name, Email, and Password are required."}), 400

    existing_users = db_helper.get_collection('users')
    if any(u.get('email', '').lower() == email for u in existing_users):
        return jsonify({"error": "An account with this email address already exists."}), 400

    if account_type == 'hr':
        user = {
            "email": email,
            "password": password,
            "role": "hr",
            "name": name,
            "title": "HR Administrator"
        }
        db_helper.save_item('users', user)
        return jsonify({
            "success": True,
            "message": f"HR Administrator account created for {name}! You can now log into the HR Administrator Portal.",
            "user": user
        }), 201

    # Employee registration
    employees = db_helper.get_collection('employees')
    new_id = f"EMP-{101 + len(employees)}"
    
    emp = {
        "id": new_id,
        "name": name,
        "email": email,
        "role": role,
        "department": department,
        "joinDate": datetime.now().strftime("%Y-%m-%d"),
        "status": "Active",
        "salary": 85000,
        "avatarColor": f"hsla({random.randint(0, 360)}, 80%, 55%, 0.2)",
        "avatarText": "".join([part[0] for part in name.split()[:2]]).upper(),
        "rating": 4.5
    }
    
    user = {
        "email": email,
        "password": password,
        "role": "employee",
        "employeeId": new_id,
        "name": name
    }

    db_helper.save_item('employees', emp)
    db_helper.save_item('users', user)

    return jsonify({
        "success": True,
        "message": f"Employee Account created for {name}! You can now log into the Employee Portal.",
        "user": user,
        "employee": emp
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    selected_role = data.get('portalRole', 'hr') # 'hr' or 'employee'

    users = db_helper.get_collection('users')
    employees = db_helper.get_collection('employees')

    # Check registered users in MongoDB
    user = next((u for u in users if u.get('email', '').lower() == email and u.get('password') == password), None)

    # Master Default HR Admin Login
    if not user and (selected_role == 'hr' or email == 'admin@hrhq.com'):
        if password == 'admin' or email == 'admin@hrhq.com':
            return jsonify({
                "success": True,
                "role": "hr",
                "name": "HR Administrator",
                "title": "Assigned by HR Portal",
                "avatarText": "HR",
                "avatarColor": "linear-gradient(135deg, #6366f1, #8b5cf6)",
                "canEdit": True
            })

    if user:
        if user.get('role') == 'hr':
            return jsonify({
                "success": True,
                "role": "hr",
                "name": user.get('name', 'HR Administrator'),
                "title": "HR Administrator (Assigned by Office)",
                "avatarText": "HR",
                "avatarColor": "linear-gradient(135deg, #6366f1, #8b5cf6)",
                "canEdit": True
            })
        else:
            emp_details = next((e for e in employees if e.get('id') == user.get('employeeId')), None)
            if not emp_details:
                emp_details = {"id": user.get('employeeId', 'EMP-101'), "name": user.get('name', 'Employee'), "role": "Specialist", "department": "Operations"}

            return jsonify({
                "success": True,
                "role": "employee",
                "employeeId": emp_details.get('id', 'EMP-101'),
                "name": emp_details.get('name', user.get('name')),
                "title": f"{emp_details.get('role', 'Staff')} ({emp_details.get('department', 'General')})",
                "avatarText": emp_details.get('avatarText', 'EM'),
                "avatarColor": emp_details.get('avatarColor', 'hsla(210, 100%, 65%, 0.2)'),
                "canEdit": False,
                "details": emp_details
            })

    # Direct employee lookup fallback
    emp = next((e for e in employees if e.get('email', '').lower() == email or e.get('id') == data.get('employeeId')), None)
    if emp:
        return jsonify({
            "success": True,
            "role": "employee",
            "employeeId": emp['id'],
            "name": emp['name'],
            "title": f"{emp['role']} ({emp['department']})",
            "avatarText": emp.get('avatarText', 'EM'),
            "avatarColor": emp.get('avatarColor', 'hsla(210, 100%, 65%, 0.2)'),
            "canEdit": False,
            "details": emp
        })

    return jsonify({"error": "Invalid email or password. Please check your credentials or click 'Create Account' to register."}), 401

# --- DATA UPLOAD API ---
@app.route('/api/upload', methods=['POST'])
def upload_data():
    category = request.form.get('category', 'employees')
    if 'file' in request.files:
        file = request.files['file']
        try:
            content = file.read().decode('utf-8')
            if file.filename.endswith('.json'):
                parsed = json.loads(content)
                if isinstance(parsed, list):
                    for item in parsed:
                        db_helper.save_item(category, item)
            elif file.filename.endswith('.csv'):
                lines = content.strip().split('\n')
                headers = [h.strip() for h in lines[0].split(',')]
                for line in lines[1:]:
                    vals = [v.strip() for v in line.split(',')]
                    if len(vals) == len(headers):
                        item = dict(zip(headers, vals))
                        if 'salary' in item:
                            try: item['salary'] = int(item['salary'])
                            except: pass
                        if 'rating' in item:
                            try: item['rating'] = float(item['rating'])
                            except: pass
                        db_helper.save_item(category, item)
            return jsonify({"success": True, "message": f"Successfully imported data into {category}!"})
        except Exception as e:
            return jsonify({"error": f"Failed to parse uploaded file: {str(e)}"}), 400
    
    return jsonify({"error": "No file uploaded"}), 400

# --- EMPLOYEES API ---
@app.route('/api/employees', methods=['GET'])
def get_employees():
    return jsonify(db_helper.get_collection('employees'))

@app.route('/api/employees', methods=['POST'])
def add_employee():
    data = request.json
    employees = db_helper.get_collection('employees')
    new_id = f"EMP-{101 + len(employees)}"
    
    emp = {
        "id": new_id,
        "name": data.get("name", ""),
        "email": data.get("email", ""),
        "role": data.get("role", ""),
        "department": data.get("department", "Engineering"),
        "joinDate": datetime.now().strftime("%Y-%m-%d"),
        "status": data.get("status", "Active"),
        "salary": int(data.get("salary", 85000)),
        "avatarColor": f"hsla({random.randint(0, 360)}, 80%, 55%, 0.2)",
        "avatarText": "".join([part[0] for part in data.get("name", "Emp").split()[:2]]).upper(),
        "rating": 4.5
    }
    
    db_helper.save_item('employees', emp)
    
    if emp['status'] == 'Onboarding':
        db_helper.save_item('onboarding', {
            "employeeId": new_id,
            "tasks": [
                { "id": "task-1", "completed": False },
                { "id": "task-2", "completed": False },
                { "id": "task-3", "completed": False },
                { "id": "task-4", "completed": False },
                { "id": "task-5", "completed": False }
            ]
        })
        
    return jsonify(emp), 201

@app.route('/api/employees/<emp_id>', methods=['PUT'])
def update_employee(emp_id):
    updates = request.json
    db_helper.update_item('employees', {"id": emp_id}, updates)
    return jsonify({"success": True})

@app.route('/api/employees/<emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    db_helper.delete_item('employees', {"id": emp_id})
    db_helper.delete_item('leaves', {"employeeId": emp_id})
    db_helper.delete_item('reviews', {"employeeId": emp_id})
    db_helper.delete_item('onboarding', {"employeeId": emp_id})
    return jsonify({"success": True, "deletedId": emp_id})

@app.route('/api/employees/onboarding/progress', methods=['GET'])
def get_onboarding():
    return jsonify(db_helper.get_collection('onboarding'))

@app.route('/api/employees/onboarding/toggle/<emp_id>', methods=['PUT'])
def toggle_onboarding_task(emp_id):
    body = request.json
    task_id = body.get('taskId')
    completed = body.get('completed', False)
    
    onboarding_items = db_helper.get_collection('onboarding')
    for item in onboarding_items:
        if item['employeeId'] == emp_id:
            tasks = item.get('tasks', [])
            for t in tasks:
                if t['id'] == task_id:
                    t['completed'] = completed
                    break
            db_helper.update_item('onboarding', {"employeeId": emp_id}, {"tasks": tasks})
            break
                    
    return jsonify({"success": True})

# --- LEAVES API ---
@app.route('/api/leaves', methods=['GET'])
def get_leaves():
    return jsonify(db_helper.get_collection('leaves'))

@app.route('/api/leaves', methods=['POST'])
def add_leave():
    data = request.json
    emp_id = data.get('employeeId')
    employees = db_helper.get_collection('employees')
    
    emp = next((e for e in employees if e['id'] == emp_id), None)
    emp_name = emp['name'] if emp else "Employee"
    leaves = db_helper.get_collection('leaves')
    
    new_leave = {
        "id": f"LV-{201 + len(leaves)}",
        "employeeId": emp_id,
        "employeeName": emp_name,
        "type": data.get('type', 'Vacation'),
        "startDate": data.get('startDate'),
        "endDate": data.get('endDate'),
        "status": "Pending",
        "reason": data.get('reason', '')
    }
    
    db_helper.save_item('leaves', new_leave)
    return jsonify(new_leave), 201

@app.route('/api/leaves/<leave_id>/status', methods=['PUT'])
def update_leave_status(leave_id):
    status = request.json.get('status')
    leaves = db_helper.get_collection('leaves')
    
    target_leave = next((l for l in leaves if l['id'] == leave_id), None)
    if target_leave:
        db_helper.update_item('leaves', {"id": leave_id}, {"status": status})
        if status == 'Approved':
            db_helper.update_item('employees', {"id": target_leave['employeeId']}, {"status": "On Leave"})
                
    return jsonify({"success": True})

# --- REVIEWS API ---
@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    return jsonify(db_helper.get_collection('reviews'))

@app.route('/api/reviews', methods=['POST'])
def add_review():
    data = request.json
    emp_id = data.get('employeeId')
    employees = db_helper.get_collection('employees')
    reviews = db_helper.get_collection('reviews')
    
    emp = next((e for e in employees if e['id'] == emp_id), None)
    emp_name = emp['name'] if emp else "Employee"
    score = float(data.get('score', 4.0))
    
    new_review = {
        "id": f"REV-{301 + len(reviews)}",
        "employeeId": emp_id,
        "employeeName": emp_name,
        "reviewer": data.get('reviewer', 'Manager'),
        "score": score,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "feedback": data.get('feedback', '')
    }
    
    db_helper.save_item('reviews', new_review)
    
    emp_reviews = [r for r in db_helper.get_collection('reviews') if r['employeeId'] == emp_id]
    if emp and emp_reviews:
        avg_score = sum(r['score'] for r in emp_reviews) / len(emp_reviews)
        db_helper.update_item('employees', {"id": emp_id}, {"rating": round(avg_score, 1)})
        
    return jsonify(new_review), 201

# --- ATTENDANCE API ---
@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    return jsonify(db_helper.get_collection('attendance'))

@app.route('/api/attendance/checkin', methods=['POST'])
def attendance_checkin():
    data = request.json or {}
    emp_id = data.get('employeeId', 'EMP-101')
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M")
    
    employees = db_helper.get_collection('employees')
    attendance = db_helper.get_collection('attendance')
    emp = next((e for e in employees if e['id'] == emp_id), None)
    if not emp:
        emp = employees[0] if employees else {"name": "Employee"}
        emp_id = emp.get('id', 'EMP-101')
        
    status = "Late" if now.hour >= 9 and now.minute > 15 else "Present"
    
    record = next((a for a in attendance if a['employeeId'] == emp_id and a['date'] == today_str), None)
    if record:
        db_helper.update_item('attendance', {"id": record['id']}, {"checkIn": time_str, "status": status})
        record['checkIn'] = time_str
        record['status'] = status
    else:
        record = {
            "id": f"ATT-{401 + len(attendance)}",
            "employeeId": emp_id,
            "employeeName": emp['name'],
            "date": today_str,
            "checkIn": time_str,
            "checkOut": "-",
            "status": status,
            "hoursWorked": 0
        }
        db_helper.save_item('attendance', record)
        
    return jsonify(record)

@app.route('/api/attendance/checkout', methods=['POST'])
def attendance_checkout():
    data = request.json or {}
    emp_id = data.get('employeeId', 'EMP-101')
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M")
    
    attendance = db_helper.get_collection('attendance')
    record = next((a for a in attendance if a['employeeId'] == emp_id and a['date'] == today_str), None)
    if not record:
        employees = db_helper.get_collection('employees')
        emp = next((e for e in employees if e['id'] == emp_id), None)
        record = {
            "id": f"ATT-{401 + len(attendance)}",
            "employeeId": emp_id,
            "employeeName": emp['name'] if emp else "Employee",
            "date": today_str,
            "checkIn": "09:00",
            "checkOut": time_str,
            "status": "Present",
            "hoursWorked": 8.0
        }
        db_helper.save_item('attendance', record)
    else:
        db_helper.update_item('attendance', {"id": record['id']}, {"checkOut": time_str, "hoursWorked": 8.0})
        record['checkOut'] = time_str
        record['hoursWorked'] = 8.0
        
    return jsonify(record)

# --- PAYROLL RUNS API ---
@app.route('/api/payroll/runs', methods=['GET'])
def get_payroll_runs():
    return jsonify(db_helper.get_collection('payrollRuns'))

@app.route('/api/payroll/run', methods=['POST'])
def create_payroll_run():
    employees = db_helper.get_collection('employees')
    payroll_runs = db_helper.get_collection('payrollRuns')
    month = request.json.get('month', datetime.now().strftime("%B %Y"))
    
    total_gross = sum(e.get('salary', 0) for e in employees) / 12.0
    total_net = total_gross * 0.90
    
    new_run = {
        "id": f"PAY-{801 + len(payroll_runs)}",
        "month": month,
        "status": "Draft",
        "dateProcessed": datetime.now().strftime("%Y-%m-%d"),
        "totalGross": round(total_gross, 2),
        "totalNet": round(total_net, 2),
        "itemsCount": len(employees)
    }
    
    db_helper.save_item('payrollRuns', new_run)
    return jsonify(new_run), 201

@app.route('/api/payroll/runs/<run_id>/approve', methods=['PUT'])
def approve_payroll_run(run_id):
    db_helper.update_item('payrollRuns', {"id": run_id}, {"status": "Approved"})
    return jsonify({"success": True})

# --- AI ASSISTANT API ---
@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    db_data = {
        "employees": db_helper.get_collection('employees'),
        "leaves": db_helper.get_collection('leaves'),
        "reviews": db_helper.get_collection('reviews'),
        "attendance": db_helper.get_collection('attendance')
    }
    prompt = request.json.get('prompt', '')
    result = ai_engine.process_query(prompt, db_data)
    return jsonify(result)

@app.route('/api/ai/insights', methods=['GET'])
def ai_insights():
    employees = db_helper.get_collection('employees')
    leaves = db_helper.get_collection('leaves')
    risks = ai_engine.calculate_retention_risks(employees)
    conflicts = ai_engine.check_leave_conflicts(leaves, employees)
    return jsonify({
        "retentionRisks": risks,
        "leaveConflicts": conflicts
    })

if __name__ == '__main__':
    print("==================================================")
    print(">> HR-HQ Python Production WSGI Server Running on Port 5000")
    print(">> Access dashboard at http://localhost:5000")
    print("==================================================")
    try:
        from waitress import serve
        serve(app, host='0.0.0.0', port=5000)
    except ImportError:
        app.run(host='0.0.0.0', port=5000, debug=False)
