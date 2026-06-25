# Employee Follow-up ERP

A lightweight Employee / HR management system with an employee follow-up workflow at its core, plus a full set of HR modules. The frontend runs entirely in the browser (no build step) and persists data in `localStorage`, while the MySQL schema documents the intended production data model.

## Features

**Core**
- Dashboard with live counts (departments, employees, active employees, open follow-ups) and recent activity
- Departments, Employees, Roles, and Users management
- Follow-up workflow: configurable status labels, follow-ups with priority/due dates, comments, and attachments

**HR modules**
- Attendance, Leave Types, Leave Requests
- Payroll, Benefits, Employee Benefits
- Performance Reviews, Job Positions, Applicants
- Training Programs, Employee Training
- Shifts, Employee Shifts, Documents, Exit Requests

Every module supports create / edit / delete with foreign-key dropdowns, and deletes cascade to related records the same way the SQL schema does.

## Project structure

```
employeeERP/
├── database/
│   └── employeeERP.sql     # MySQL schema (23 tables, FKs, constraints)
└── frontend/
    ├── index.html          # App shell and sidebar navigation
    ├── css/style.css       # Styles
    └── js/
        ├── storage.js      # localStorage data layer + seed data
        └── app.js          # Views, forms, and CRUD logic
```

## Running locally

No dependencies or build step. Serve the `frontend/` folder with any static server:

```bash
cd frontend
python3 -m http.server 8000
```

Then open <http://localhost:8000>. You can also open `frontend/index.html` directly in a browser.

The app seeds sample data on first load. Use **Reset Sample Data** in the sidebar to restore it at any time.

## Database

`database/employeeERP.sql` creates the `employee_erp` database (utf8mb4) with all tables, foreign keys, and unique constraints. Load it into MySQL with:

```bash
mysql -u root -p < database/employeeERP.sql
```

The frontend currently mirrors this schema in `localStorage`; the SQL file is the reference for connecting a real backend API.
