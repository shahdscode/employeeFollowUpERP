const { TABLES } = require("./tables");

async function seedDatabase(pool) {
  const conn = await pool.getConnection();
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    for (const table of [...TABLES].reverse()) {
      await conn.query(`TRUNCATE TABLE \`${table}\``);
    }
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    await conn.query(
      `INSERT INTO departments (id, name, description, is_active, created_at) VALUES
      (1, 'Engineering', 'Software & IT', 1, ?),
      (2, 'Human Resources', 'People operations', 1, ?),
      (3, 'Sales', 'Revenue & accounts', 1, ?)`,
      [now, now, now]
    );

    await conn.query(
      `INSERT INTO roles (id, name, code, created_at) VALUES
      (1, 'Administrator', 'ADMIN', ?),
      (2, 'Manager', 'MANAGER', ?),
      (3, 'Employee', 'EMPLOYEE', ?)`,
      [now, now, now]
    );

    await conn.query(
      `INSERT INTO employees (id, department_id, employee_code, first_name, last_name, email, phone, hire_date, job_title, employment_status, is_active, created_at) VALUES
      (1, 1, 'EMP001', 'Ahmad', 'Hassan', 'ahmad.hassan@company.com', '+966501234567', '2022-03-15', 'Senior Developer', 'active', 1, ?),
      (2, 2, 'EMP002', 'Sara', 'Al-Rashid', 'sara.rashid@company.com', '+966509876543', '2021-08-01', 'HR Manager', 'active', 1, ?),
      (3, 3, 'EMP003', 'Omar', 'Khalil', 'omar.khalil@company.com', '+966551122334', '2023-01-10', 'Sales Executive', 'on_leave', 1, ?)`,
      [now, now, now]
    );

    await conn.query(
      `INSERT INTO users (id, employee_id, role_id, username, password_hash, is_active, last_login_at, created_at) VALUES
      (1, 1, 1, 'ahmad.admin', '********', 1, ?, ?),
      (2, 2, 2, 'sara.manager', '********', 1, NULL, ?)`,
      [now, now, now]
    );

    await conn.query(
      `INSERT INTO followup_status (id, name, color_code, sort_order, is_closed) VALUES
      (1, 'Open', '#2563eb', 1, 0),
      (2, 'In Progress', '#d97706', 2, 0),
      (3, 'Completed', '#16a34a', 3, 1),
      (4, 'Cancelled', '#64748b', 4, 1)`
    );

    await conn.query(
      `INSERT INTO followups (id, employee_id, created_by, status_id, title, description, followup_date, due_at, priority_level, completed_at, created_at, updated_at) VALUES
      (1, 3, 1, 2, 'Q1 Sales Review', 'Review quarterly sales performance and targets.', '2026-06-20', '2026-06-30 17:00:00', 2, NULL, ?, ?),
      (2, 1, 2, 1, 'Code Review Follow-up', 'Address pending PR comments on auth module.', '2026-06-22', '2026-06-25 12:00:00', 1, NULL, ?, ?)`,
      [now, now, now, now]
    );

    await conn.query(
      `INSERT INTO followup_comments (id, followup_id, user_id, comment_text, created_at) VALUES
      (1, 1, 1, 'Please prepare the sales report before the meeting.', ?)`,
      [now]
    );

    await conn.query(
      `INSERT INTO followup_attachments (id, followup_id, uploaded_by, file_name, file_path, mime_type, file_size, created_at) VALUES
      (1, 1, 1, 'q1_targets.pdf', '/uploads/q1_targets.pdf', 'application/pdf', 245760, ?)`,
      [now]
    );

    await conn.query(
      `INSERT INTO attendance (id, employee_id, attendance_date, check_in, check_out, status, created_at) VALUES
      (1, 1, '2026-06-24', '09:00:00', '17:30:00', 'present', ?),
      (2, 2, '2026-06-24', '09:15:00', '17:00:00', 'late', ?),
      (3, 3, '2026-06-24', NULL, NULL, 'absent', ?)`,
      [now, now, now]
    );

    await conn.query(
      `INSERT INTO leave_types (id, name, days_allowed) VALUES
      (1, 'Annual Leave', 21),
      (2, 'Sick Leave', 14),
      (3, 'Unpaid Leave', 0)`
    );

    await conn.query(
      `INSERT INTO leave_requests (id, employee_id, leave_type_id, approved_by, start_date, end_date, reason, status, created_at) VALUES
      (1, 3, 1, 2, '2026-07-01', '2026-07-05', 'Family vacation', 'approved', ?),
      (2, 1, 2, NULL, '2026-06-28', '2026-06-29', 'Flu', 'pending', ?)`,
      [now, now]
    );

    await conn.query(
      `INSERT INTO payroll (id, employee_id, payroll_month, basic_salary, bonus, deductions, net_salary, payment_date, created_at) VALUES
      (1, 1, '2026-05-01', 12000, 1500, 500, 13000, '2026-05-28', ?),
      (2, 2, '2026-05-01', 15000, 0, 800, 14200, '2026-05-28', ?)`,
      [now, now]
    );

    await conn.query(
      `INSERT INTO performance_reviews (id, employee_id, reviewer_id, review_period, rating, comments, review_date, created_at) VALUES
      (1, 1, 2, 'H1 2026', 4.50, 'Strong technical delivery.', '2026-06-15', ?)`,
      [now]
    );

    await conn.query(
      `INSERT INTO job_positions (id, department_id, title, description, vacancies, status, created_at) VALUES
      (1, 1, 'Backend Engineer', 'Build and maintain APIs.', 2, 'open', ?),
      (2, 3, 'Account Manager', 'Manage key client accounts.', 1, 'open', ?)`,
      [now, now]
    );

    await conn.query(
      `INSERT INTO applicants (id, job_position_id, full_name, email, resume_path, status, created_at) VALUES
      (1, 1, 'Layla Mahmoud', 'layla.m@example.com', '/resumes/layla.pdf', 'interview', ?),
      (2, 1, 'Yousef Adel', 'yousef.adel@example.com', '/resumes/yousef.pdf', 'applied', ?)`,
      [now, now]
    );

    await conn.query(
      `INSERT INTO training_programs (id, title, description, start_date, end_date, created_at) VALUES
      (1, 'Onboarding 101', 'Company orientation program.', '2026-06-01', '2026-06-03', ?),
      (2, 'Advanced SQL', 'Database performance and design.', '2026-07-10', '2026-07-12', ?)`,
      [now, now]
    );

    await conn.query(
      `INSERT INTO employee_training (id, employee_id, training_id, completion_status, score) VALUES
      (1, 1, 1, 'completed', 92.00),
      (2, 1, 2, 'assigned', NULL)`
    );

    await conn.query(
      `INSERT INTO benefits (id, name, description) VALUES
      (1, 'Health Insurance', 'Comprehensive medical coverage.'),
      (2, 'Transport Allowance', 'Monthly commuting allowance.')`
    );

    await conn.query(
      `INSERT INTO employee_benefits (id, employee_id, benefit_id, start_date) VALUES
      (1, 1, 1, '2022-03-15'),
      (2, 2, 1, '2021-08-01')`
    );

    await conn.query(
      `INSERT INTO shifts (id, shift_name, start_time, end_time) VALUES
      (1, 'Morning', '09:00:00', '17:00:00'),
      (2, 'Evening', '14:00:00', '22:00:00')`
    );

    await conn.query(
      `INSERT INTO employee_shifts (id, employee_id, shift_id, assigned_date) VALUES
      (1, 1, 1, '2026-06-24'),
      (2, 3, 2, '2026-06-24')`
    );

    await conn.query(
      `INSERT INTO employee_documents (id, employee_id, document_type, document_name, file_path, uploaded_at) VALUES
      (1, 1, 'Contract', 'employment_contract.pdf', '/docs/emp1_contract.pdf', ?)`,
      [now]
    );

    await conn.query(
      `INSERT INTO exit_requests (id, employee_id, resignation_date, last_working_day, reason, status, created_at) VALUES
      (1, 3, '2026-06-20', '2026-07-20', 'New opportunity', 'pending', ?)`,
      [now]
    );
  } finally {
    conn.release();
  }
}

module.exports = { seedDatabase };
