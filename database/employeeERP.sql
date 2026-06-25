# step one: create the database
CREATE DATABASE employee_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE employee_erp;


# step two: create the tables
# tableOne: departments
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# tableTwo: roles
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
	id  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# tableThree: employees
DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    department_id BIGINT UNSIGNED,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(30),
    hire_date DATE,
    job_title VARCHAR(100),
    salary DECIMAL(12,2) DEFAULT 0,
    employment_status ENUM('active','on_leave','suspended','resigned') DEFAULT 'active',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_id) REFERENCES departments(id) # (relationship) becuz department contained employees
    ON UPDATE CASCADE ON DELETE SET NULL
);

# tableFour: users
DROP TABLE IF EXISTS users;
CREATE TABLE users (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    employee_id BIGINT UNSIGNED NOT NULL UNIQUE,
    role_id BIGINT UNSIGNED NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) # (relationship) becuz employee has user account
    ON UPDATE CASCADE ON DELETE CASCADE,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) # (relationship) becuz users r assigned roles
	ON UPDATE CASCADE ON DELETE RESTRICT
);

# tableFive: followup status
DROP TABLE IF EXISTS followup_status;
CREATE TABLE followup_status (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    name VARCHAR(100) NOT NULL,
    color_code VARCHAR(20),
    sort_order INT DEFAULT 0,
    is_closed BOOLEAN DEFAULT FALSE
);

# tableSix: followups
DROP TABLE IF EXISTS followups;
CREATE TABLE followups (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    employee_id BIGINT UNSIGNED NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    status_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    followup_date DATE NOT NULL,
    due_at DATETIME,
    priority_level TINYINT DEFAULT 2,
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) # (relationship) becuz employees are assigned follow ups
    ON UPDATE CASCADE ON DELETE CASCADE,
    
    FOREIGN KEY (created_by) REFERENCES users(id) # (relationship) becuz users created follow ups
    ON UPDATE CASCADE ON DELETE RESTRICT,
    
    FOREIGN KEY (status_id) REFERENCES followup_status(id) # (relationship) becuz follow up status labels follow ups
    ON UPDATE CASCADE ON DELETE RESTRICT
);

# tableSeven: followup comments
DROP TABLE IF EXISTS followup_comments;
CREATE TABLE followup_comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    followup_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (followup_id) REFERENCES followups(id) # (relationship) becuz follow ups has follow up comments 
    ON UPDATE CASCADE ON DELETE CASCADE,

    FOREIGN KEY (user_id) REFERENCES users(id) # (relationship) becuz user writes follow up comments
    ON UPDATE CASCADE ON DELETE RESTRICT
);

# tableEight: followup attachments
DROP TABLE IF EXISTS followup_attachments;
CREATE TABLE followup_attachments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    followup_id BIGINT UNSIGNED NOT NULL,
    uploaded_by BIGINT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (followup_id) REFERENCES followups(id) # (relationship) becuz follow ups have follow up attachements
    ON UPDATE CASCADE ON DELETE CASCADE,

    FOREIGN KEY (uploaded_by) REFERENCES users(id) # (relationship) becuz user uploads follow up attachements
    ON UPDATE CASCADE ON DELETE RESTRICT
);


# step three: add top 10 functions of HRM
# tableNine: attendance
DROP TABLE IF EXISTS attendance;
CREATE TABLE attendance (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id BIGINT UNSIGNED NOT NULL,
    attendance_date DATE NOT NULL,
    check_in TIME NULL,
    check_out TIME NULL,
    status ENUM(
        'present',
        'absent',
        'late',
        'half_day',
        'remote'
    ) DEFAULT 'present',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_attendance_emp_date (employee_id, attendance_date), # one record per employee per day

    FOREIGN KEY (employee_id) REFERENCES employees(id) # (relationship) becuz employee has attendance records
    ON UPDATE CASCADE ON DELETE CASCADE
);

# tableTen: leave types
DROP TABLE IF EXISTS leave_types;
CREATE TABLE leave_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    days_allowed INT DEFAULT 0
);

# tableEleven: leave requests
DROP TABLE IF EXISTS leave_requests;
CREATE TABLE leave_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id BIGINT UNSIGNED NOT NULL,
    leave_type_id BIGINT UNSIGNED NOT NULL,
    approved_by BIGINT UNSIGNED NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status ENUM(
        'pending',
        'approved',
        'rejected'
    ) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES employees(id) # (relationship) becuz employees submit leave requests
    ON UPDATE CASCADE ON DELETE CASCADE,

    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) # (relationship) becuz leave request belongs to leave type
    ON UPDATE CASCADE ON DELETE RESTRICT,

    FOREIGN KEY (approved_by) REFERENCES users(id) # (relationship) becuz manager approves leave request
    ON UPDATE CASCADE ON DELETE SET NULL
);

# tableTwelve: payroll
DROP TABLE IF EXISTS payroll;
CREATE TABLE payroll (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id BIGINT UNSIGNED NOT NULL,
    payroll_month DATE NOT NULL,
    basic_salary DECIMAL(12,2) NOT NULL,
    bonus DECIMAL(12,2) DEFAULT 0,
    deductions DECIMAL(12,2) DEFAULT 0,
    net_salary DECIMAL(12,2) NOT NULL,
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_payroll_emp_month (employee_id, payroll_month), # one payslip per employee per month

    FOREIGN KEY (employee_id) REFERENCES employees(id) # (relationship) becuz payroll belongs to employee
    ON UPDATE CASCADE ON DELETE CASCADE
);

# tableThirteen: performance reviews
DROP TABLE IF EXISTS performance_reviews;
CREATE TABLE performance_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id BIGINT UNSIGNED NOT NULL,
    reviewer_id BIGINT UNSIGNED NOT NULL,
    review_period VARCHAR(100),
    rating DECIMAL(4,2),
    comments TEXT,
    review_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES employees(id) # (relationship) becuz employees receive reviews
    ON UPDATE CASCADE ON DELETE CASCADE,

    FOREIGN KEY (reviewer_id) REFERENCES users(id) # (relationship) becuz user performs review
    ON UPDATE CASCADE ON DELETE RESTRICT
);

# tableFourteen: job positions
DROP TABLE IF EXISTS job_positions;
CREATE TABLE job_positions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    department_id BIGINT UNSIGNED,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    vacancies INT DEFAULT 1,
    status ENUM(
        'open',
        'closed'
    ) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (department_id) REFERENCES departments(id) # (relationship) becuz department opens job positions
    ON UPDATE CASCADE ON DELETE SET NULL
);

# tableFifteen: applicants
DROP TABLE IF EXISTS applicants;
CREATE TABLE applicants (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    job_position_id BIGINT UNSIGNED,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    resume_path VARCHAR(500),
    status ENUM(
        'applied',
        'interview',
        'accepted',
        'rejected'
    ) DEFAULT 'applied',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (job_position_id) REFERENCES job_positions(id) # (relationship) becuz applicant applies to job position
    ON UPDATE CASCADE ON DELETE SET NULL
);

# tableSixteen: training programs
DROP TABLE IF EXISTS training_programs;
CREATE TABLE training_programs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(150) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# tableSeventeen: employee training
DROP TABLE IF EXISTS employee_training;
CREATE TABLE employee_training (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id BIGINT UNSIGNED NOT NULL,
    training_id BIGINT UNSIGNED NOT NULL,
    completion_status ENUM(
        'assigned',
        'completed'
    ) DEFAULT 'assigned',
    score DECIMAL(5,2),
    
    UNIQUE KEY uq_emp_training (employee_id, training_id), # no duplicate enrollment

    FOREIGN KEY (employee_id) REFERENCES employees(id) # (relationship) becuz employee attends training
    ON UPDATE CASCADE ON DELETE CASCADE,

    FOREIGN KEY (training_id) REFERENCES training_programs(id) # (relationship) becuz training is assigned to employees
    ON UPDATE CASCADE ON DELETE CASCADE
);

# tableEighteen: benefits
DROP TABLE IF EXISTS benefits;
CREATE TABLE benefits (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    description TEXT
);

# tableNineteen: employee benefits
DROP TABLE IF EXISTS employee_benefits;
CREATE TABLE employee_benefits (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id BIGINT UNSIGNED NOT NULL,
    benefit_id BIGINT UNSIGNED NOT NULL,
    start_date DATE,

    UNIQUE KEY uq_emp_benefit (employee_id, benefit_id), # no duplicate benefit assignment

    FOREIGN KEY (employee_id) REFERENCES employees(id) # (relationship) becuz employee receives benefits
    ON UPDATE CASCADE ON DELETE CASCADE,

    FOREIGN KEY (benefit_id) REFERENCES benefits(id) # (relationship) becuz benefit is assigned to employee
    ON UPDATE CASCADE ON DELETE CASCADE
);

# tableTwenty: shifts
DROP TABLE IF EXISTS shifts;
CREATE TABLE shifts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    shift_name VARCHAR(100),
    start_time TIME,
    end_time TIME
);

# tableTwentyOne: employee shifts
DROP TABLE IF EXISTS employee_shifts;
CREATE TABLE employee_shifts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id BIGINT UNSIGNED NOT NULL,
    shift_id BIGINT UNSIGNED NOT NULL,
    assigned_date DATE,

    UNIQUE KEY uq_emp_shift_date (employee_id, shift_id, assigned_date), # no duplicate shift per day

    FOREIGN KEY (employee_id) REFERENCES employees(id) # (relationship) becuz employee is assigned shift
    ON UPDATE CASCADE ON DELETE CASCADE,

    FOREIGN KEY (shift_id) REFERENCES shifts(id) # (relationship) becuz shift is assigned to employees
    ON UPDATE CASCADE ON DELETE CASCADE
);

# tableTwentyTwo: employee documents
DROP TABLE IF EXISTS employee_documents;
CREATE TABLE employee_documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id BIGINT UNSIGNED NOT NULL,
    document_type VARCHAR(100),
    document_name VARCHAR(255),
    file_path VARCHAR(500),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES employees(id) # (relationship) becuz employee owns documents
    ON UPDATE CASCADE ON DELETE CASCADE
);

# tableTwentyThree: exit requests
DROP TABLE IF EXISTS exit_requests;
CREATE TABLE exit_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id BIGINT UNSIGNED NOT NULL,
    resignation_date DATE,
    last_working_day DATE,
    reason TEXT,
    status ENUM(
        'pending',
        'approved',
        'rejected'
    ) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES employees(id) # (relationship) becuz employee can submit resignation
    ON UPDATE CASCADE ON DELETE CASCADE
);