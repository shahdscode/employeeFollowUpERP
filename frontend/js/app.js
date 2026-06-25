/**
 * Employee ERP — Frontend Application
 */

const VIEWS = {
  dashboard: { title: "Dashboard", subtitle: "Overview of your employee management system" },
  departments: { title: "Departments", subtitle: "Manage company departments" },
  employees: { title: "Employees", subtitle: "Manage employee records" },
  roles: { title: "Roles", subtitle: "Manage user roles and permissions" },
  users: { title: "Users", subtitle: "Manage system user accounts" },
  "followup-status": { title: "Follow-up Status", subtitle: "Configure follow-up status labels" },
  followups: { title: "Follow-ups", subtitle: "Track employee follow-ups and tasks" },
};

let currentView = "dashboard";

// ─── Helpers ───────────────────────────────────────────────

function $(sel) {
  return document.querySelector(sel);
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function deptName(id) {
  const d = getById("departments", id);
  return d ? d.name : "—";
}

function empName(id) {
  const e = getById("employees", id);
  return e ? `${e.first_name} ${e.last_name}` : "—";
}

function roleName(id) {
  const r = getById("roles", id);
  return r ? r.name : "—";
}

function userName(id) {
  const u = getById("users", id);
  return u ? u.username : "—";
}

function statusLabel(id) {
  const s = getById("followup_status", id);
  if (!s) return "—";
  return `<span class="color-dot" style="background:${escapeHtml(s.color_code)}"></span>${escapeHtml(s.name)}`;
}

function priorityLabel(level) {
  const labels = { 1: "High", 2: "Medium", 3: "Low" };
  return `<span class="status-badge priority-${level}">${labels[level] || level}</span>`;
}

function employmentBadge(status) {
  const labels = { active: "Active", on_leave: "On Leave", suspended: "Suspended", resigned: "Resigned" };
  return `<span class="status-badge status-${status}">${labels[status] || status}</span>`;
}

function activeBadge(val) {
  return val
    ? '<span class="status-badge status-active">Active</span>'
    : '<span class="status-badge status-inactive">Inactive</span>';
}

function showToast(msg) {
  const toast = $("#toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2800);
}

function openModal(title, bodyHtml, footerHtml) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = bodyHtml;
  $("#modalFooter").innerHTML = footerHtml || "";
  $("#modalOverlay").classList.remove("hidden");
}

function closeModal() {
  $("#modalOverlay").classList.add("hidden");
}

function renderEmpty(msg) {
  return `<div class="empty-state"><strong>No records yet</strong><p>${msg}</p></div>`;
}

// ─── Navigation ────────────────────────────────────────────

function navigate(view) {
  currentView = view;
  const meta = VIEWS[view];
  $("#pageTitle").textContent = meta.title;
  $("#pageSubtitle").textContent = meta.subtitle;

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });

  const renderers = {
    dashboard: renderDashboard,
    departments: renderDepartments,
    employees: renderEmployees,
    roles: renderRoles,
    users: renderUsers,
    "followup-status": renderFollowupStatus,
    followups: renderFollowups,
  };

  $("#content").innerHTML = renderers[view]();
  bindViewEvents(view);
}

// ─── Dashboard ─────────────────────────────────────────────

function renderDashboard() {
  const depts = getAll("departments");
  const emps = getAll("employees");
  const activeEmps = emps.filter((e) => e.employment_status === "active");
  const followups = getAll("followups");
  const openFollowups = followups.filter((f) => {
    const s = getById("followup_status", f.status_id);
    return s && !s.is_closed;
  });

  const recentEmps = [...emps].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  const recentFollowups = [...followups].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  return `
    <div class="stats-grid">
      <div class="stat-card"><div class="label">Departments</div><div class="value primary">${depts.length}</div></div>
      <div class="stat-card"><div class="label">Employees</div><div class="value">${emps.length}</div></div>
      <div class="stat-card"><div class="label">Active Employees</div><div class="value success">${activeEmps.length}</div></div>
      <div class="stat-card"><div class="label">Open Follow-ups</div><div class="value warning">${openFollowups.length}</div></div>
    </div>
    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header"><h3>Recent Employees</h3></div>
        <ul class="recent-list">
          ${recentEmps.length ? recentEmps.map((e) => `
            <li>
              <span>${escapeHtml(e.first_name)} ${escapeHtml(e.last_name)} <span class="meta">· ${escapeHtml(e.job_title || "")}</span></span>
              ${employmentBadge(e.employment_status)}
            </li>
          `).join("") : "<li>No employees yet</li>"}
        </ul>
      </div>
      <div class="card">
        <div class="card-header"><h3>Recent Follow-ups</h3></div>
        <ul class="recent-list">
          ${recentFollowups.length ? recentFollowups.map((f) => `
            <li>
              <span>${escapeHtml(f.title)} <span class="meta">· ${empName(f.employee_id)}</span></span>
              ${priorityLabel(f.priority_level)}
            </li>
          `).join("") : "<li>No follow-ups yet</li>"}
        </ul>
      </div>
    </div>
  `;
}

// ─── Departments ─────────────────────────────────────────────

function renderDepartments() {
  const rows = getAll("departments");
  return `
    <div class="card">
      <div class="card-header">
        <h3>All Departments (${rows.length})</h3>
        <button class="btn btn-primary" data-action="add-department">+ Add Department</button>
      </div>
      <div class="card-body table-wrap">
        ${rows.length ? `
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              ${rows.map((d) => `
                <tr>
                  <td>${d.id}</td>
                  <td><strong>${escapeHtml(d.name)}</strong></td>
                  <td>${escapeHtml(d.description || "—")}</td>
                  <td>${activeBadge(d.is_active)}</td>
                  <td>${formatDate(d.created_at)}</td>
                  <td class="actions-cell">
                    <button class="btn btn-outline btn-sm" data-action="edit-department" data-id="${d.id}">Edit</button>
                    <button class="btn btn-danger btn-sm" data-action="delete-department" data-id="${d.id}">Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : renderEmpty("Add your first department to get started.")}
      </div>
    </div>
  `;
}

function departmentForm(d = {}) {
  return `
    <form id="entityForm" class="form-grid">
      <div class="form-group"><label>Name *</label><input name="name" value="${escapeHtml(d.name || "")}" required /></div>
      <div class="form-group full-width"><label>Description</label><textarea name="description">${escapeHtml(d.description || "")}</textarea></div>
      <div class="form-group checkbox-group"><input type="checkbox" name="is_active" id="is_active" ${d.is_active !== false ? "checked" : ""} /><label for="is_active">Active</label></div>
    </form>
  `;
}

// ─── Employees ───────────────────────────────────────────────

function renderEmployees() {
  const rows = getAll("employees");
  return `
    <div class="card">
      <div class="card-header">
        <h3>All Employees (${rows.length})</h3>
        <button class="btn btn-primary" data-action="add-employee">+ Add Employee</button>
      </div>
      <div class="card-body table-wrap">
        ${rows.length ? `
          <table>
            <thead><tr><th>Code</th><th>Name</th><th>Department</th><th>Job Title</th><th>Email</th><th>Status</th><th>Hire Date</th><th>Actions</th></tr></thead>
            <tbody>
              ${rows.map((e) => `
                <tr>
                  <td><code>${escapeHtml(e.employee_code)}</code></td>
                  <td><strong>${escapeHtml(e.first_name)} ${escapeHtml(e.last_name)}</strong></td>
                  <td>${escapeHtml(deptName(e.department_id))}</td>
                  <td>${escapeHtml(e.job_title || "—")}</td>
                  <td>${escapeHtml(e.email || "—")}</td>
                  <td>${employmentBadge(e.employment_status)}</td>
                  <td>${formatDate(e.hire_date)}</td>
                  <td class="actions-cell">
                    <button class="btn btn-outline btn-sm" data-action="edit-employee" data-id="${e.id}">Edit</button>
                    <button class="btn btn-danger btn-sm" data-action="delete-employee" data-id="${e.id}">Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : renderEmpty("Add your first employee to get started.")}
      </div>
    </div>
  `;
}

function employeeForm(e = {}) {
  const depts = getAll("departments");
  return `
    <form id="entityForm" class="form-grid">
      <div class="form-group"><label>Employee Code *</label><input name="employee_code" value="${escapeHtml(e.employee_code || "")}" required /></div>
      <div class="form-group"><label>Department</label>
        <select name="department_id">
          <option value="">— None —</option>
          ${depts.map((d) => `<option value="${d.id}" ${e.department_id == d.id ? "selected" : ""}>${escapeHtml(d.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group"><label>First Name</label><input name="first_name" value="${escapeHtml(e.first_name || "")}" /></div>
      <div class="form-group"><label>Last Name</label><input name="last_name" value="${escapeHtml(e.last_name || "")}" /></div>
      <div class="form-group"><label>Email</label><input type="email" name="email" value="${escapeHtml(e.email || "")}" /></div>
      <div class="form-group"><label>Phone</label><input name="phone" value="${escapeHtml(e.phone || "")}" /></div>
      <div class="form-group"><label>Job Title</label><input name="job_title" value="${escapeHtml(e.job_title || "")}" /></div>
      <div class="form-group"><label>Hire Date</label><input type="date" name="hire_date" value="${e.hire_date || ""}" /></div>
      <div class="form-group"><label>Employment Status</label>
        <select name="employment_status">
          ${["active", "on_leave", "suspended", "resigned"].map((s) =>
            `<option value="${s}" ${e.employment_status === s ? "selected" : ""}>${s.replace("_", " ")}</option>`
          ).join("")}
        </select>
      </div>
      <div class="form-group checkbox-group"><input type="checkbox" name="is_active" id="emp_active" ${e.is_active !== false ? "checked" : ""} /><label for="emp_active">Active</label></div>
    </form>
  `;
}

// ─── Roles ───────────────────────────────────────────────────

function renderRoles() {
  const rows = getAll("roles");
  return `
    <div class="card">
      <div class="card-header">
        <h3>All Roles (${rows.length})</h3>
        <button class="btn btn-primary" data-action="add-role">+ Add Role</button>
      </div>
      <div class="card-body table-wrap">
        ${rows.length ? `
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Code</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              ${rows.map((r) => `
                <tr>
                  <td>${r.id}</td>
                  <td><strong>${escapeHtml(r.name)}</strong></td>
                  <td><code>${escapeHtml(r.code)}</code></td>
                  <td>${formatDate(r.created_at)}</td>
                  <td class="actions-cell">
                    <button class="btn btn-outline btn-sm" data-action="edit-role" data-id="${r.id}">Edit</button>
                    <button class="btn btn-danger btn-sm" data-action="delete-role" data-id="${r.id}">Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : renderEmpty("Add roles to assign to users.")}
      </div>
    </div>
  `;
}

function roleForm(r = {}) {
  return `
    <form id="entityForm" class="form-grid">
      <div class="form-group"><label>Name *</label><input name="name" value="${escapeHtml(r.name || "")}" required /></div>
      <div class="form-group"><label>Code *</label><input name="code" value="${escapeHtml(r.code || "")}" required placeholder="e.g. ADMIN" /></div>
    </form>
  `;
}

// ─── Users ───────────────────────────────────────────────────

function renderUsers() {
  const rows = getAll("users");
  return `
    <div class="card">
      <div class="card-header">
        <h3>All Users (${rows.length})</h3>
        <button class="btn btn-primary" data-action="add-user">+ Add User</button>
      </div>
      <div class="card-body table-wrap">
        ${rows.length ? `
          <table>
            <thead><tr><th>Username</th><th>Employee</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
            <tbody>
              ${rows.map((u) => `
                <tr>
                  <td><strong>${escapeHtml(u.username)}</strong></td>
                  <td>${escapeHtml(empName(u.employee_id))}</td>
                  <td>${escapeHtml(roleName(u.role_id))}</td>
                  <td>${activeBadge(u.is_active)}</td>
                  <td>${formatDateTime(u.last_login_at)}</td>
                  <td class="actions-cell">
                    <button class="btn btn-outline btn-sm" data-action="edit-user" data-id="${u.id}">Edit</button>
                    <button class="btn btn-danger btn-sm" data-action="delete-user" data-id="${u.id}">Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : renderEmpty("Create user accounts linked to employees.")}
      </div>
    </div>
  `;
}

function userForm(u = {}) {
  const emps = getAll("employees");
  const roles = getAll("roles");
  const usedEmpIds = getAll("users").filter((x) => x.id !== u.id).map((x) => x.employee_id);
  return `
    <form id="entityForm" class="form-grid">
      <div class="form-group"><label>Username *</label><input name="username" value="${escapeHtml(u.username || "")}" required /></div>
      <div class="form-group"><label>Password ${u.id ? "(leave blank to keep)" : "*"}</label><input type="password" name="password_hash" ${u.id ? "" : "required"} placeholder="••••••••" /></div>
      <div class="form-group"><label>Employee *</label>
        <select name="employee_id" required>
          <option value="">— Select —</option>
          ${emps.filter((e) => !usedEmpIds.includes(e.id) || e.id === u.employee_id).map((e) =>
            `<option value="${e.id}" ${u.employee_id == e.id ? "selected" : ""}>${escapeHtml(e.first_name)} ${escapeHtml(e.last_name)} (${escapeHtml(e.employee_code)})</option>`
          ).join("")}
        </select>
      </div>
      <div class="form-group"><label>Role *</label>
        <select name="role_id" required>
          <option value="">— Select —</option>
          ${roles.map((r) => `<option value="${r.id}" ${u.role_id == r.id ? "selected" : ""}>${escapeHtml(r.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group checkbox-group"><input type="checkbox" name="is_active" id="user_active" ${u.is_active !== false ? "checked" : ""} /><label for="user_active">Active</label></div>
    </form>
  `;
}

// ─── Follow-up Status ────────────────────────────────────────

function renderFollowupStatus() {
  const rows = getAll("followup_status").sort((a, b) => a.sort_order - b.sort_order);
  return `
    <div class="card">
      <div class="card-header">
        <h3>Status Labels (${rows.length})</h3>
        <button class="btn btn-primary" data-action="add-status">+ Add Status</button>
      </div>
      <div class="card-body table-wrap">
        ${rows.length ? `
          <table>
            <thead><tr><th>Order</th><th>Name</th><th>Color</th><th>Closed?</th><th>Actions</th></tr></thead>
            <tbody>
              ${rows.map((s) => `
                <tr>
                  <td>${s.sort_order}</td>
                  <td><span class="color-dot" style="background:${escapeHtml(s.color_code)}"></span><strong>${escapeHtml(s.name)}</strong></td>
                  <td><code>${escapeHtml(s.color_code || "—")}</code></td>
                  <td>${s.is_closed ? "Yes" : "No"}</td>
                  <td class="actions-cell">
                    <button class="btn btn-outline btn-sm" data-action="edit-status" data-id="${s.id}">Edit</button>
                    <button class="btn btn-danger btn-sm" data-action="delete-status" data-id="${s.id}">Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : renderEmpty("Define status labels for follow-ups.")}
      </div>
    </div>
  `;
}

function statusForm(s = {}) {
  return `
    <form id="entityForm" class="form-grid">
      <div class="form-group"><label>Name *</label><input name="name" value="${escapeHtml(s.name || "")}" required /></div>
      <div class="form-group"><label>Color Code</label><input type="color" name="color_code" value="${s.color_code || "#2563eb"}" /></div>
      <div class="form-group"><label>Sort Order</label><input type="number" name="sort_order" value="${s.sort_order ?? 0}" min="0" /></div>
      <div class="form-group checkbox-group"><input type="checkbox" name="is_closed" id="is_closed" ${s.is_closed ? "checked" : ""} /><label for="is_closed">Mark as closed status</label></div>
    </form>
  `;
}

// ─── Follow-ups ──────────────────────────────────────────────

function renderFollowups() {
  const rows = getAll("followups");
  return `
    <div class="card">
      <div class="card-header">
        <h3>All Follow-ups (${rows.length})</h3>
        <button class="btn btn-primary" data-action="add-followup">+ Add Follow-up</button>
      </div>
      <div class="card-body table-wrap">
        ${rows.length ? `
          <table>
            <thead><tr><th>Title</th><th>Employee</th><th>Status</th><th>Priority</th><th>Date</th><th>Due</th><th>Actions</th></tr></thead>
            <tbody>
              ${rows.map((f) => `
                <tr>
                  <td><strong>${escapeHtml(f.title)}</strong></td>
                  <td>${escapeHtml(empName(f.employee_id))}</td>
                  <td>${statusLabel(f.status_id)}</td>
                  <td>${priorityLabel(f.priority_level)}</td>
                  <td>${formatDate(f.followup_date)}</td>
                  <td>${formatDateTime(f.due_at)}</td>
                  <td class="actions-cell">
                    <button class="btn btn-outline btn-sm" data-action="view-followup" data-id="${f.id}">View</button>
                    <button class="btn btn-outline btn-sm" data-action="edit-followup" data-id="${f.id}">Edit</button>
                    <button class="btn btn-danger btn-sm" data-action="delete-followup" data-id="${f.id}">Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : renderEmpty("Create follow-ups to track employee tasks.")}
      </div>
    </div>
  `;
}

function followupForm(f = {}) {
  const emps = getAll("employees");
  const statuses = getAll("followup_status");
  const users = getAll("users");
  const dueVal = f.due_at ? f.due_at.slice(0, 16) : "";
  return `
    <form id="entityForm" class="form-grid">
      <div class="form-group full-width"><label>Title *</label><input name="title" value="${escapeHtml(f.title || "")}" required /></div>
      <div class="form-group full-width"><label>Description</label><textarea name="description">${escapeHtml(f.description || "")}</textarea></div>
      <div class="form-group"><label>Employee *</label>
        <select name="employee_id" required>
          <option value="">— Select —</option>
          ${emps.map((e) => `<option value="${e.id}" ${f.employee_id == e.id ? "selected" : ""}>${escapeHtml(e.first_name)} ${escapeHtml(e.last_name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group"><label>Created By *</label>
        <select name="created_by" required>
          <option value="">— Select —</option>
          ${users.map((u) => `<option value="${u.id}" ${f.created_by == u.id ? "selected" : ""}>${escapeHtml(u.username)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group"><label>Status *</label>
        <select name="status_id" required>
          <option value="">— Select —</option>
          ${statuses.map((s) => `<option value="${s.id}" ${f.status_id == s.id ? "selected" : ""}>${escapeHtml(s.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group"><label>Follow-up Date *</label><input type="date" name="followup_date" value="${f.followup_date || ""}" required /></div>
      <div class="form-group"><label>Due At</label><input type="datetime-local" name="due_at" value="${dueVal}" /></div>
      <div class="form-group"><label>Priority</label>
        <select name="priority_level">
          <option value="1" ${f.priority_level == 1 ? "selected" : ""}>High</option>
          <option value="2" ${!f.priority_level || f.priority_level == 2 ? "selected" : ""}>Medium</option>
          <option value="3" ${f.priority_level == 3 ? "selected" : ""}>Low</option>
        </select>
      </div>
    </form>
  `;
}

function followupDetail(f) {
  const comments = getAll("followup_comments").filter((c) => c.followup_id === f.id);
  const attachments = getAll("followup_attachments").filter((a) => a.followup_id === f.id);

  return `
    <div>
      <p><strong>Employee:</strong> ${escapeHtml(empName(f.employee_id))}</p>
      <p><strong>Status:</strong> ${statusLabel(f.status_id)}</p>
      <p><strong>Priority:</strong> ${priorityLabel(f.priority_level)}</p>
      <p><strong>Date:</strong> ${formatDate(f.followup_date)} · <strong>Due:</strong> ${formatDateTime(f.due_at)}</p>
      <p style="margin-top:12px">${escapeHtml(f.description || "No description.")}</p>

      <div class="detail-section">
        <h4>Comments (${comments.length})</h4>
        ${comments.map((c) => `
          <div class="comment-item">
            <div class="comment-meta">${escapeHtml(userName(c.user_id))} · ${formatDateTime(c.created_at)}</div>
            ${escapeHtml(c.comment_text)}
          </div>
        `).join("") || "<p class='meta'>No comments yet.</p>"}
        <form id="addCommentForm" style="margin-top:12px" class="form-grid">
          <div class="form-group full-width"><label>Add Comment</label><textarea name="comment_text" required placeholder="Write a comment..."></textarea></div>
          <div class="form-group"><label>As User</label>
            <select name="user_id" required>
              ${getAll("users").map((u) => `<option value="${u.id}">${escapeHtml(u.username)}</option>`).join("")}
            </select>
          </div>
        </form>
      </div>

      <div class="detail-section">
        <h4>Attachments (${attachments.length})</h4>
        ${attachments.map((a) => `
          <div class="attachment-item">
            <span>📎</span>
            <div>
              <strong>${escapeHtml(a.file_name)}</strong>
              <div class="meta">${formatFileSize(a.file_size)} · ${escapeHtml(userName(a.uploaded_by))} · ${formatDateTime(a.created_at)}</div>
            </div>
          </div>
        `).join("") || "<p class='meta'>No attachments yet.</p>"}
        <form id="addAttachmentForm" style="margin-top:12px" class="form-grid">
          <div class="form-group"><label>File Name *</label><input name="file_name" required placeholder="document.pdf" /></div>
          <div class="form-group"><label>File Path</label><input name="file_path" placeholder="/uploads/document.pdf" /></div>
          <div class="form-group"><label>MIME Type</label><input name="mime_type" placeholder="application/pdf" /></div>
          <div class="form-group"><label>File Size (bytes)</label><input type="number" name="file_size" min="0" /></div>
          <div class="form-group"><label>Uploaded By</label>
            <select name="uploaded_by" required>
              ${getAll("users").map((u) => `<option value="${u.id}">${escapeHtml(u.username)}</option>`).join("")}
            </select>
          </div>
        </form>
      </div>
    </div>
  `;
}

// ─── Form parsing ────────────────────────────────────────────

function parseForm(form) {
  const data = {};
  const fd = new FormData(form);
  for (const [key, val] of fd.entries()) {
    const el = form.elements[key];
    if (el && el.type === "checkbox") {
      data[key] = el.checked;
    } else if (el && el.type === "number") {
      data[key] = val === "" ? null : Number(val);
    } else {
      data[key] = val === "" ? null : val;
    }
  }
  form.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    if (!fd.has(cb.name)) data[cb.name] = false;
  });
  return data;
}

function modalFooter(saveLabel, cancelLabel = "Cancel") {
  return `
    <button class="btn btn-outline" id="modalCancel">${cancelLabel}</button>
    <button class="btn btn-primary" id="modalSave">${saveLabel}</button>
  `;
}

// ─── Event binding ───────────────────────────────────────────

function bindViewEvents(view) {
  const content = $("#content");

  const handlers = {
    "add-department": () => showDepartmentModal(),
    "edit-department": (_, id) => showDepartmentModal(id),
    "delete-department": (_, id) => confirmDelete("departments", id, "department"),

    "add-employee": () => showEmployeeModal(),
    "edit-employee": (_, id) => showEmployeeModal(id),
    "delete-employee": (_, id) => confirmDelete("employees", id, "employee"),

    "add-role": () => showRoleModal(),
    "edit-role": (_, id) => showRoleModal(id),
    "delete-role": (_, id) => confirmDelete("roles", id, "role"),

    "add-user": () => showUserModal(),
    "edit-user": (_, id) => showUserModal(id),
    "delete-user": (_, id) => confirmDelete("users", id, "user"),

    "add-status": () => showStatusModal(),
    "edit-status": (_, id) => showStatusModal(id),
    "delete-status": (_, id) => confirmDelete("followup_status", id, "status"),

    "add-followup": () => showFollowupModal(),
    "edit-followup": (_, id) => showFollowupModal(id),
    "view-followup": (_, id) => showFollowupDetail(id),
    "delete-followup": (_, id) => confirmDelete("followups", id, "follow-up"),
  };

  content.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (handlers[action]) handlers[action](action, id);
  });
}

function confirmDelete(table, id, label) {
  if (!confirm(`Delete this ${label}? This action cannot be undone.`)) return;
  remove(table, id);
  showToast(`${label.charAt(0).toUpperCase() + label.slice(1)} deleted`);
  navigate(currentView);
}

function showDepartmentModal(id) {
  const d = id ? getById("departments", id) : {};
  openModal(id ? "Edit Department" : "Add Department", departmentForm(d), modalFooter("Save"));
  bindModalSave(() => {
    const data = parseForm($("#entityForm"));
    if (id) update("departments", id, data);
    else create("departments", data);
    closeModal();
    showToast(id ? "Department updated" : "Department created");
    navigate(currentView);
  });
}

function showEmployeeModal(id) {
  const e = id ? getById("employees", id) : {};
  openModal(id ? "Edit Employee" : "Add Employee", employeeForm(e), modalFooter("Save"));
  bindModalSave(() => {
    const data = parseForm($("#entityForm"));
    if (data.department_id) data.department_id = Number(data.department_id);
    if (id) update("employees", id, data);
    else create("employees", data);
    closeModal();
    showToast(id ? "Employee updated" : "Employee created");
    navigate(currentView);
  });
}

function showRoleModal(id) {
  const r = id ? getById("roles", id) : {};
  openModal(id ? "Edit Role" : "Add Role", roleForm(r), modalFooter("Save"));
  bindModalSave(() => {
    const data = parseForm($("#entityForm"));
    if (id) update("roles", id, data);
    else create("roles", data);
    closeModal();
    showToast(id ? "Role updated" : "Role created");
    navigate(currentView);
  });
}

function showUserModal(id) {
  const u = id ? getById("users", id) : {};
  openModal(id ? "Edit User" : "Add User", userForm(u), modalFooter("Save"));
  bindModalSave(() => {
    const data = parseForm($("#entityForm"));
    data.employee_id = Number(data.employee_id);
    data.role_id = Number(data.role_id);
    if (id && !data.password_hash) delete data.password_hash;
    if (id) update("users", id, data);
    else create("users", data);
    closeModal();
    showToast(id ? "User updated" : "User created");
    navigate(currentView);
  });
}

function showStatusModal(id) {
  const s = id ? getById("followup_status", id) : {};
  openModal(id ? "Edit Status" : "Add Status", statusForm(s), modalFooter("Save"));
  bindModalSave(() => {
    const data = parseForm($("#entityForm"));
    if (id) update("followup_status", id, data);
    else create("followup_status", data);
    closeModal();
    showToast(id ? "Status updated" : "Status created");
    navigate(currentView);
  });
}

function showFollowupModal(id) {
  const f = id ? getById("followups", id) : {};
  openModal(id ? "Edit Follow-up" : "Add Follow-up", followupForm(f), modalFooter("Save"));
  bindModalSave(() => {
    const data = parseForm($("#entityForm"));
    data.employee_id = Number(data.employee_id);
    data.created_by = Number(data.created_by);
    data.status_id = Number(data.status_id);
    data.priority_level = Number(data.priority_level);
    if (id) update("followups", id, data);
    else create("followups", data);
    closeModal();
    showToast(id ? "Follow-up updated" : "Follow-up created");
    navigate(currentView);
  });
}

function showFollowupDetail(id) {
  const f = getById("followups", id);
  openModal(f.title, followupDetail(f), `<button class="btn btn-outline" id="modalCancel">Close</button>`);

  $("#modalCancel").onclick = closeModal;

  const commentForm = $("#addCommentForm");
  if (commentForm) {
    commentForm.onsubmit = (e) => {
      e.preventDefault();
      const data = parseForm(commentForm);
      create("followup_comments", {
        followup_id: Number(id),
        user_id: Number(data.user_id),
        comment_text: data.comment_text,
      });
      showToast("Comment added");
      showFollowupDetail(id);
    };
  }

  const attachForm = $("#addAttachmentForm");
  if (attachForm) {
    attachForm.onsubmit = (e) => {
      e.preventDefault();
      const data = parseForm(attachForm);
      create("followup_attachments", {
        followup_id: Number(id),
        uploaded_by: Number(data.uploaded_by),
        file_name: data.file_name,
        file_path: data.file_path || `/uploads/${data.file_name}`,
        mime_type: data.mime_type,
        file_size: data.file_size,
      });
      showToast("Attachment added");
      showFollowupDetail(id);
    };
  }
}

function bindModalSave(onSave) {
  $("#modalCancel").onclick = closeModal;
  $("#modalSave").onclick = () => {
    const form = $("#entityForm");
    if (form && !form.reportValidity()) return;
    onSave();
  };
}

// ─── Init ────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  $("#sidebarNav").addEventListener("click", (e) => {
    const btn = e.target.closest(".nav-item");
    if (btn) navigate(btn.dataset.view);
  });

  $("#modalClose").onclick = closeModal;
  $("#modalOverlay").addEventListener("click", (e) => {
    if (e.target === $("#modalOverlay")) closeModal();
  });

  $("#resetDataBtn").addEventListener("click", () => {
    if (confirm("Reset all data to sample defaults?")) {
      resetDatabase();
      showToast("Sample data restored");
      navigate(currentView);
    }
  });

  navigate("dashboard");
});
