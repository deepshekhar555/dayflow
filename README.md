# 🚀 Dayflow

### **Every workday, perfectly aligned.**

> **Dayflow is an AI-powered Human Resource Management System that transforms traditional HR operations into an intelligent workforce operating system.**

[![Status](https://img.shields.io/badge/status-hackathon--ready-success)](https://github.com/deepshekhar555/dayflow)
[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-blue)](https://react.dev/)
[![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/database-PostgreSQL-blue)](https://www.postgresql.org/)
[![AI](https://img.shields.io/badge/AI-HR%20Copilot-purple)](#-ai-powered-features)

---

## 🌟 Overview

Traditional HR systems are often fragmented across multiple tools for:

* Employee management
* Attendance
* Leave requests
* Payroll
* Approvals
* Reports
* Workforce analytics

**Dayflow brings these workflows together into one intelligent platform.**

Instead of simply storing HR data, Dayflow analyzes workforce information and proactively provides actionable insights to HR teams and employees.

### Core Idea

```text
              DAYFLOW
                 │
                 ▼
        ┌─────────────────┐
        │  HR WORKFLOWS    │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  WORKFORCE DATA │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ AI INTELLIGENCE │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ ACTIONABLE      │
        │ INSIGHTS        │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ BETTER HR       │
        │ DECISIONS       │
        └─────────────────┘
```

---

# 🎯 Problem Statement

Modern HR teams spend significant time manually searching through employee records, attendance data, leave requests, payroll information, and reports.

Traditional HRMS platforms primarily answer:

> **"What happened?"**

Dayflow aims to answer:

> **"What happened, why does it matter, and what should HR do next?"**

---

# 💡 Our Solution

Dayflow combines traditional HRMS functionality with AI-powered workforce intelligence.

### Traditional HRMS

* Employee management
* Attendance
* Leave management
* Payroll
* Approvals
* Notifications
* Reports

### AI Layer

* AI HR Copilot
* Workforce Intelligence
* Attendance anomaly detection
* Natural-language HR search
* Personal employee insights
* AI-assisted leave review
* AI report generation
* Proactive HR alerts

---

# ✨ Key Features

## 👤 Employee Management

HR can manage employee information including:

* Employee ID
* Name
* Email
* Phone
* Department
* Designation
* Joining date
* Manager
* Salary structure
* Documents
* Profile picture

Employees can edit permitted personal fields such as:

* Phone
* Address
* Profile picture

---

# ⏱️ Attendance Management

Employees can:

* Check in
* Check out
* View working duration
* View daily attendance
* View weekly attendance
* View attendance calendar
* Track late arrivals

Attendance statuses include:

* 🟢 Present
* 🔴 Absent
* 🟡 Half-day
* 🔵 Leave

HR can view organization-wide attendance.

The original Dayflow requirements specifically require daily/weekly attendance views and employee check-in/check-out functionality.

---

# 🏖️ Leave Management

Employees can:

* Apply for leave
* Select leave type
* Select date range
* Add remarks
* View leave balance
* Track request status

Supported leave types:

* Paid Leave
* Sick Leave
* Unpaid Leave

Leave statuses:

```text
🟡 Pending
🟢 Approved
🔴 Rejected
```

HR can:

* View requests
* Approve requests
* Reject requests
* Add comments

The original requirements specify this approval workflow and require changes to immediately reflect in employee records.

---

# 💰 Payroll Management

Employees can view their own payroll information in read-only mode.

Example:

```text
Gross Salary       ₹65,000

Basic Salary       ₹35,000
Allowances         ₹20,000
Deductions         ₹10,000

Net Salary         ₹55,000
```

HR can:

* View employee payroll
* Update salary structures
* Review salary information
* Generate payroll reports
* Generate payslips

The Dayflow specification requires employees to have read-only payroll visibility while allowing Admin/HR to manage salary structures.

---

# 🤖 AI HR Copilot

Dayflow includes a conversational AI assistant.

Employees can ask:

```text
"How is my attendance?"

"How many leave days do I have?"

"When did I last check in?"

"Explain my payslip."
```

HR can ask:

```text
"Who is absent today?"

"Which department has the lowest attendance?"

"Show employees who were late more than 3 times."

"How many leave requests are pending?"

"Generate this month's HR report."
```

The AI converts workforce data into understandable answers.

---

# 🧠 Workforce Intelligence

Dayflow proactively identifies workforce patterns.

Example:

> ⚠️ **Attendance anomaly detected**

> Engineering attendance dropped **7%** compared with the previous month.

The system can analyze:

* Attendance trends
* Absenteeism
* Late arrivals
* Leave patterns
* Department performance
* Workforce trends

Each AI insight provides:

```text
Insight
   ↓
Why it matters
   ↓
Supporting data
   ↓
Recommended action
```

---

# 🔎 Natural Language HR Search

HR doesn't need to manually configure complicated filters.

They can simply ask:

> **"Show employees who were late more than 3 times this month."**

Dayflow converts the request into structured filters:

```text
Late Arrivals > 3
Month = August 2026
```

Then displays the matching employees.

---

# 📊 Workforce Analytics

Dayflow provides visual analytics for:

### Attendance

* Attendance percentage
* Attendance trends
* Department attendance
* Late arrivals

### Leave

* Leave distribution
* Leave trends
* Pending requests

### Payroll

* Total payroll
* Average salary
* Department payroll
* Salary distribution

### Workforce

* Employee count
* Absenteeism
* Punctuality
* Workforce Health Score

---

# 🏆 Workforce Health Score

Dayflow provides an operational workforce indicator from:

```text
0 ─────────────────────── 100
             87
```

The score can consider:

* Attendance
* Absenteeism
* Leave patterns
* Punctuality
* Workforce stability

Example:

```text
Workforce Health

87 / 100

Attendance       92%
Absenteeism      91%
Punctuality      82%
Leave Stability  88%
```

This is an operational analytics indicator, **not a measure of employee worth or performance**.

---

# 🔔 Smart Notifications

Dayflow provides contextual notifications.

Examples:

```text
🟢 Leave approved

Your leave request for
August 22–23 was approved.
```

```text
⚠️ Attendance reminder

You normally check in around
9:10 AM.

Don't forget to check in.
```

```text
💰 Payslip available

Your August payslip is ready.
```

---

# 📄 AI Report Generator

HR can request:

> **"Generate a monthly workforce report."**

Dayflow can generate:

1. Executive summary
2. Attendance statistics
3. Leave statistics
4. Workforce trends
5. Risk areas
6. Recommendations

Reports can be exported as:

* PDF
* CSV

---

# 🔐 Security & Role-Based Access

Dayflow uses strict role-based access.

## Employee

Can access:

```text
Own Profile
Own Attendance
Own Leave
Own Payroll
Own Documents
AI Assistant
```

## HR/Admin

Can access:

```text
Employees
Organization Attendance
Leave Approvals
Payroll
Analytics
Reports
Audit Logs
AI Workforce Intelligence
```

Employees must never be able to access HR-only information.

---

# 🛡️ AI Safety

The AI assistant is designed with HR-specific guardrails.

AI must **never**:

* Automatically approve leave
* Change employee salary
* Fire employees
* Make medical diagnoses
* Make employment decisions
* Infer sensitive personal attributes
* Bypass authorization
* Expose private employee information

AI recommendations remain **advisory**.

Human HR personnel retain final decision-making authority.

---

# 🧾 Audit Logs

Sensitive actions are recorded.

Examples:

```text
HR approved leave request

HR updated salary

HR modified employee profile

Employee checked in

Employee checked out

Employee changed phone number
```

Each event records:

* Who
* What
* When
* Target

---

# 🏗️ Architecture

```text
                         ┌──────────────────┐
                         │    DAYFLOW WEB   │
                         │ React + TypeScript│
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    REST API      │
                         │ Node + Express   │
                         └────────┬─────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
                ▼                 ▼                 ▼
        ┌─────────────┐   ┌─────────────┐   ┌──────────────┐
        │ PostgreSQL  │   │ Auth / RBAC │   │ AI Service   │
        │ + Prisma    │   │ JWT         │   │ HR Copilot   │
        └─────────────┘   └─────────────┘   └──────┬───────┘
                                                    │
                                                    ▼
                                          ┌──────────────────┐
                                          │ AI Tools         │
                                          │ Attendance       │
                                          │ Leave            │
                                          │ Employees        │
                                          │ Analytics        │
                                          │ Payroll          │
                                          └──────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Lucide React
* Recharts

## Backend

* Node.js
* Express
* TypeScript

## Database

* PostgreSQL
* Prisma ORM

## Authentication

* JWT
* Refresh Tokens
* bcrypt
* Role-Based Access Control

## AI

* LLM API
* AI Service Abstraction
* Tool-based HR data access
* AI Guardrails

---

# 📁 Project Structure

```text
dayflow/
│
├── apps/
│   │
│   ├── web/
│   │   └── src/
│   │       ├── components/
│   │       ├── pages/
│   │       ├── layouts/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── store/
│   │       └── utils/
│   │
│   └── api/
│       └── src/
│           ├── controllers/
│           ├── routes/
│           ├── middleware/
│           ├── services/
│           ├── ai/
│           ├── validators/
│           └── utils/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docs/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# 🗄️ Database

Main entities include:

```text
Users
Employees
Departments
Attendance
Attendance Events
Leave Types
Leave Requests
Leave Balances
Payroll
Salary Components
Documents
Notifications
Audit Logs
AI Insights
AI Conversations
AI Messages
Reports
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/deepshekhar555/dayflow.git
cd dayflow
```

---

## 2. Install Dependencies

```bash
npm install
```

If the project uses separate frontend/backend packages:

```bash
cd apps/web
npm install

cd ../api
npm install
```

---

# 3. Configure Environment Variables

Create:

```text
.env
```

Example:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/dayflow"

JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

AI_API_KEY="your-ai-api-key"
AI_MODEL="your-ai-model"

FRONTEND_URL="http://localhost:5173"
```

> Never commit `.env` to GitHub.

Use:

```text
.env.example
```

for sharing required configuration.

---

# 4. Database Setup

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Seed demo data:

```bash
npx prisma db seed
```

---

# 5. Run the Application

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# 🧪 Demo Accounts

## HR / Admin

```text
Email:
hr@dayflow.demo

Password:
Demo@123
```

## Employee

```text
Email:
employee@dayflow.demo

Password:
Demo@123
```

---

# 🎬 Hackathon Demo Flow

The recommended demo takes approximately **3 minutes**.

### 1️⃣ Login as Employee

Show:

* Employee dashboard
* Attendance
* Live check-in
* Leave balance
* Payroll

### 2️⃣ Ask AI

```text
How is my attendance compared with last month?
```

AI provides a personalized insight.

### 3️⃣ Apply for Leave

Create a leave request.

### 4️⃣ Switch to HR

HR dashboard immediately displays the pending request.

### 5️⃣ AI-Assisted Review

Show:

```text
Leave Balance: 12 days
Team Conflict: None
Operational Risk: LOW
```

HR approves the request.

### 6️⃣ Workforce Intelligence

Show:

```text
Attendance anomaly detected

Marketing attendance ↓ 13%
```

### 7️⃣ Natural Language Search

Ask:

```text
Show employees who were late
more than 3 times this month.
```

Dayflow returns the employee table.

### 8️⃣ Generate Report

Generate the monthly workforce report.

---

# 🏆 Why Dayflow?

Traditional HRMS:

```text
Data
 ↓
Reports
 ↓
Human analysis
 ↓
Action
```

Dayflow:

```text
Data
 ↓
AI analysis
 ↓
Insight
 ↓
Recommendation
 ↓
Human decision
```

This transforms HR from a primarily administrative function into an **intelligent decision-support system**.

---

# 💎 Hackathon Differentiators

## 1. AI HR Copilot

Natural-language access to HR data.

## 2. Workforce Intelligence

Automatically discovers important workforce trends.

## 3. Proactive Alerts

Dayflow surfaces issues before HR has to search for them.

## 4. Natural Language Search

HR can query workforce data conversationally.

## 5. AI Report Generation

Generate HR reports using natural language.

## 6. Employee Personal Insights

Employees receive useful insights about their own attendance and leave.

---

# 📱 Responsive Design

Dayflow is designed for:

* 💻 Desktop
* 🖥️ Laptop
* 📱 Mobile
* 📟 Tablet

Mobile navigation uses a simplified bottom navigation experience.

---

# 🔮 Future Enhancements

Potential future improvements include:

* Calendar integrations
* Slack integration
* Microsoft Teams integration
* Mobile application
* Advanced workforce forecasting
* Payroll automation
* Organization-level policy engine
* Advanced employee onboarding
* Document verification
* Multi-organization support
* Multi-language AI assistant
* Voice-based HR Copilot

---

# 🧑‍💻 Development Philosophy

Dayflow follows:

```text
Security First
     ↓
Working Functionality
     ↓
Data Accuracy
     ↓
AI Intelligence
     ↓
UX Polish
```

AI should enhance HR workflows rather than replace human judgment.

---

# ⚠️ Security Notes

Never commit:

```text
.env
API keys
JWT secrets
Database passwords
Private credentials
node_modules/
```

Recommended `.gitignore`:

```gitignore
node_modules/
.env
.env.*
!.env.example

dist/
build/
coverage/

.vscode/
.idea/

*.log

.DS_Store
Thumbs.db
```

---

# 🤝 Contributing

Contributions are welcome.

```bash
git checkout -b feature/your-feature
```

Make your changes:

```bash
git add .
git commit -m "feat: add your feature"
```

Push:

```bash
git push origin feature/your-feature
```

Then create a Pull Request.

---

# 📜 License

This project is developed as a hackathon project.

Add an appropriate open-source license before publicly distributing the project.

---

# 👥 Team

## Dayflow

**AI-powered Human Resource Management System**

Built with ❤️ for the future of work.

---

# 🌐 Repository

GitHub:

https://github.com/deepshekhar555/dayflow.git

---

# ⭐ Final Message

> **Dayflow isn't just another HRMS.**
>
> **It's an intelligent operating system for modern HR.**

### DAYFLOW

## Every workday, perfectly aligned. 🚀
