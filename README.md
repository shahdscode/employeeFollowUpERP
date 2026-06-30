# Employee Follow-up ERP

A lightweight Employee / HR management system with an employee follow-up workflow at its core, plus a full set of HR modules. The frontend connects to a **Node.js REST API** backed by **MySQL**.

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

Every module supports create / edit / delete with foreign-key dropdowns. Deletes respect MySQL foreign-key constraints.

## Project structure

```
employeeERP/
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js       # Express server + static frontend
│       ├── db.js           # MySQL connection pool
│       ├── seed.js         # Sample data seeder
│       ├── tables.js       # Table whitelist
│       ├── normalize.js    # Row serialization
│       └── routes/api.js   # REST CRUD endpoints
├── database/
│   └── employeeERP.sql     # MySQL schema (23 tables)
└── frontend/
    ├── index.html
    ├── css/style.css
    └── js/
        ├── storage.js      # API client + in-memory cache
        └── app.js          # Views, forms, and CRUD logic
```

## Setup

### 1. Create the database

```bash
mysql -u root -p < database/employeeERP.sql
```

### 2. Configure the API

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=employee_erp
PORT=3000
```

### 3. Install dependencies and start

```bash
cd backend
npm install
npm start
```

Open **http://localhost:3000**. The API serves both the frontend and REST endpoints at `/api`.

### 4. Seed sample data

On first run the database is empty. Click **Reset Sample Data** in the sidebar, or call:

```bash
curl -X POST http://localhost:3000/api/seed
```

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check + DB connection |
| `POST` | `/api/seed` | Reset and seed sample data |
| `GET` | `/api/:table` | List all rows |
| `GET` | `/api/:table/:id` | Get one row |
| `POST` | `/api/:table` | Create a row |
| `PUT` | `/api/:table/:id` | Update a row |
| `DELETE` | `/api/:table/:id` | Delete a row |

Supported tables: `departments`, `roles`, `employees`, `users`, `followup_status`, `followups`, `followup_comments`, `followup_attachments`, and all 16 HRM module tables.

## Development

```bash
cd backend
npm run dev   # auto-restart on file changes (Node --watch)
```

## Frontend-only mode (legacy)

The frontend no longer uses `localStorage`. It requires the API server to be running. If you need to serve the frontend separately, set the API base URL before loading scripts:

```html
<script>window.API_BASE = "http://localhost:3000/api";</script>
```
