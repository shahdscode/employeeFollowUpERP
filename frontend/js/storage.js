/**
 * API storage layer — connects the frontend to the MySQL backend.
 * Reads are served from an in-memory cache; writes go through REST endpoints.
 */

const API_BASE = window.API_BASE || "/api";

const TABLES = [
  "departments",
  "roles",
  "employees",
  "users",
  "followup_status",
  "followups",
  "followup_comments",
  "followup_attachments",
  "attendance",
  "leave_types",
  "leave_requests",
  "payroll",
  "performance_reviews",
  "job_positions",
  "applicants",
  "training_programs",
  "employee_training",
  "benefits",
  "employee_benefits",
  "shifts",
  "employee_shifts",
  "employee_documents",
  "exit_requests",
];

const VIEW_TABLES = {
  dashboard: [
    "departments",
    "employees",
    "followups",
    "followup_status",
    "attendance",
    "leave_requests",
    "payroll",
    "applicants",
    "job_positions",
  ],
  departments: ["departments"],
  employees: ["employees", "departments"],
  roles: ["roles"],
  users: ["users", "employees", "roles"],
  "followup-status": ["followup_status"],
  followups: [
    "followups",
    "employees",
    "followup_status",
    "users",
    "followup_comments",
    "followup_attachments",
  ],
};

const _cache = {};
let _apiReady = false;

async function apiRequest(method, path, body) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

async function checkApiHealth() {
  let res;
  try {
    res = await fetch(`${API_BASE}/health`);
  } catch {
    throw new Error(
      "Cannot reach the API server. Open http://localhost:3000 and run: cd backend && npm start"
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!data.ok) {
    throw new Error(
      data.error ||
        (res.ok ? "Database not connected" : "API server is running but the database is not connected")
    );
  }
}

async function refreshTable(table) {
  _cache[table] = await apiRequest("GET", `/${table}`);
}

async function refreshTables(tables) {
  const unique = [...new Set(tables)];
  await Promise.all(unique.map(refreshTable));
}

async function refreshAll() {
  await Promise.all(TABLES.map(refreshTable));
}

async function refreshViewData(view) {
  const tables = VIEW_TABLES[view] || [view];
  const mod = typeof HRM_MODULES !== "undefined" ? HRM_MODULES[view] : null;
  if (mod) {
    mod.fields.forEach((f) => {
      if (f.type === "ref" && f.ref) tables.push(f.ref);
    });
  }
  await refreshTables(tables);
}

async function initStorage() {
  await checkApiHealth();
  await refreshTable("departments");
  if (!getAll("departments").length) {
    await apiRequest("POST", "/seed");
  }
  await refreshAll();
  _apiReady = true;
}

function isStorageReady() {
  return _apiReady;
}

function getAll(table) {
  return _cache[table] || [];
}

function getById(table, id) {
  return getAll(table).find((r) => r.id === Number(id));
}

async function create(table, data) {
  const row = await apiRequest("POST", `/${table}`, data);
  await refreshTable(table);
  return row;
}

async function update(table, id, data) {
  const row = await apiRequest("PUT", `/${table}/${id}`, data);
  await refreshTable(table);
  return row;
}

async function remove(table, id) {
  await apiRequest("DELETE", `/${table}/${id}`);
  await refreshAll();
}

async function resetDatabase() {
  await apiRequest("POST", "/seed");
  await refreshAll();
}
