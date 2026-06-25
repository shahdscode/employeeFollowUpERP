/**
 * Client-side storage layer mirroring employee_erp MySQL schema.
 * Uses localStorage until a real backend API is connected.
 */

const DB_KEY = "employee_erp";

const TABLES = [
  "departments",
  "roles",
  "employees",
  "users",
  "followup_status",
  "followups",
  "followup_comments",
  "followup_attachments",
];

function getDb() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) return JSON.parse(raw);
  return seedDatabase();
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function nextId(table) {
  const db = getDb();
  const rows = db[table];
  if (!rows.length) return 1;
  return Math.max(...rows.map((r) => r.id)) + 1;
}

function getAll(table) {
  return getDb()[table] || [];
}

function getById(table, id) {
  return getAll(table).find((r) => r.id === Number(id));
}

function create(table, data) {
  const db = getDb();
  const row = {
    id: nextId(table),
    created_at: new Date().toISOString(),
    ...data,
  };
  db[table].push(row);
  saveDb(db);
  return row;
}

function update(table, id, data) {
  const db = getDb();
  const idx = db[table].findIndex((r) => r.id === Number(id));
  if (idx === -1) return null;
  db[table][idx] = { ...db[table][idx], ...data };
  if (table === "followups") {
    db[table][idx].updated_at = new Date().toISOString();
  }
  saveDb(db);
  return db[table][idx];
}

function remove(table, id) {
  const db = getDb();
  const numId = Number(id);
  db[table] = db[table].filter((r) => r.id !== numId);

  if (table === "departments") {
    db.employees = db.employees.map((e) =>
      e.department_id === numId ? { ...e, department_id: null } : e
    );
  }
  if (table === "employees") {
    db.users = db.users.filter((u) => u.employee_id !== numId);
    db.followups = db.followups.filter((f) => f.employee_id !== numId);
  }
  if (table === "followups") {
    db.followup_comments = db.followup_comments.filter((c) => c.followup_id !== numId);
    db.followup_attachments = db.followup_attachments.filter((a) => a.followup_id !== numId);
  }
  if (table === "users") {
    db.followup_comments = db.followup_comments.filter((c) => c.user_id !== numId);
    db.followup_attachments = db.followup_attachments.filter((a) => a.uploaded_by !== numId);
    db.followups = db.followups.map((f) =>
      f.created_by === numId ? { ...f, created_by: null } : f
    );
  }

  saveDb(db);
}

function resetDatabase() {
  localStorage.removeItem(DB_KEY);
  return seedDatabase();
}

function seedDatabase() {
  const now = new Date().toISOString();
  const db = {
    departments: [
      { id: 1, name: "Engineering", description: "Software & IT", is_active: true, created_at: now },
      { id: 2, name: "Human Resources", description: "People operations", is_active: true, created_at: now },
      { id: 3, name: "Sales", description: "Revenue & accounts", is_active: true, created_at: now },
    ],
    roles: [
      { id: 1, name: "Administrator", code: "ADMIN", created_at: now },
      { id: 2, name: "Manager", code: "MANAGER", created_at: now },
      { id: 3, name: "Employee", code: "EMPLOYEE", created_at: now },
    ],
    employees: [
      {
        id: 1,
        department_id: 1,
        employee_code: "EMP001",
        first_name: "Ahmad",
        last_name: "Hassan",
        email: "ahmad.hassan@company.com",
        phone: "+966501234567",
        hire_date: "2022-03-15",
        job_title: "Senior Developer",
        employment_status: "active",
        is_active: true,
        created_at: now,
      },
      {
        id: 2,
        department_id: 2,
        employee_code: "EMP002",
        first_name: "Sara",
        last_name: "Al-Rashid",
        email: "sara.rashid@company.com",
        phone: "+966509876543",
        hire_date: "2021-08-01",
        job_title: "HR Manager",
        employment_status: "active",
        is_active: true,
        created_at: now,
      },
      {
        id: 3,
        department_id: 3,
        employee_code: "EMP003",
        first_name: "Omar",
        last_name: "Khalil",
        email: "omar.khalil@company.com",
        phone: "+966551122334",
        hire_date: "2023-01-10",
        job_title: "Sales Executive",
        employment_status: "on_leave",
        is_active: true,
        created_at: now,
      },
    ],
    users: [
      {
        id: 1,
        employee_id: 1,
        role_id: 1,
        username: "ahmad.admin",
        password_hash: "********",
        is_active: true,
        last_login_at: now,
        created_at: now,
      },
      {
        id: 2,
        employee_id: 2,
        role_id: 2,
        username: "sara.manager",
        password_hash: "********",
        is_active: true,
        last_login_at: null,
        created_at: now,
      },
    ],
    followup_status: [
      { id: 1, name: "Open", color_code: "#2563eb", sort_order: 1, is_closed: false },
      { id: 2, name: "In Progress", color_code: "#d97706", sort_order: 2, is_closed: false },
      { id: 3, name: "Completed", color_code: "#16a34a", sort_order: 3, is_closed: true },
      { id: 4, name: "Cancelled", color_code: "#64748b", sort_order: 4, is_closed: true },
    ],
    followups: [
      {
        id: 1,
        employee_id: 3,
        created_by: 1,
        status_id: 2,
        title: "Q1 Sales Review",
        description: "Review quarterly sales performance and targets.",
        followup_date: "2026-06-20",
        due_at: "2026-06-30T17:00:00",
        priority_level: 2,
        completed_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        employee_id: 1,
        created_by: 2,
        status_id: 1,
        title: "Code Review Follow-up",
        description: "Address pending PR comments on auth module.",
        followup_date: "2026-06-22",
        due_at: "2026-06-25T12:00:00",
        priority_level: 1,
        completed_at: null,
        created_at: now,
        updated_at: now,
      },
    ],
    followup_comments: [
      {
        id: 1,
        followup_id: 1,
        user_id: 1,
        comment_text: "Please prepare the sales report before the meeting.",
        created_at: now,
      },
    ],
    followup_attachments: [
      {
        id: 1,
        followup_id: 1,
        uploaded_by: 1,
        file_name: "q1_targets.pdf",
        file_path: "/uploads/q1_targets.pdf",
        mime_type: "application/pdf",
        file_size: 245760,
        created_at: now,
      },
    ],
  };

  saveDb(db);
  return db;
}

// Initialize on load
getDb();
