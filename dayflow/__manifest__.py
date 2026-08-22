{
    "name": "Dayflow - HR Management",
    "version": "1.0",
    "category": "Human Resources",
    "summary": "Every workday, perfectly aligned.",
    "description": "HRMS: onboarding, profiles, attendance, leave, payroll visibility.",
    "depends": ["hr", "hr_holidays", "hr_attendance"],
    "data": [
        "security/dayflow_security.xml",
        "security/ir.model.access.csv",
        "views/employee_dashboard.xml",
        "views/admin_dashboard.xml",
        "views/attendance_views.xml",
        "views/leave_views.xml",
        "views/payroll_views.xml"
    ],
    "installable": True,
    "application": True,
    "license": "LGPL-3"
}
