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

const BOOLEAN_FIELDS = new Set(["is_active", "is_closed"]);

const DATE_FIELDS = new Set([
  "hire_date",
  "followup_date",
  "payroll_month",
  "attendance_date",
  "start_date",
  "end_date",
  "review_date",
  "payment_date",
  "assigned_date",
  "resignation_date",
  "last_working_day",
]);

const DATETIME_FIELDS = new Set([
  "created_at",
  "updated_at",
  "due_at",
  "completed_at",
  "last_login_at",
  "uploaded_at",
]);

module.exports = { TABLES, BOOLEAN_FIELDS, DATE_FIELDS, DATETIME_FIELDS };
