# step one: create the database
CREATE DATABASE employee_erp;
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
    employment_status ENUM('active','on_leave','suspended','resigned') DEFAULT 'active',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_id) REFERENCES departments(id) # becuz department contained employees (relationship)
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
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) # becuz employee has user account (relationship)
    ON UPDATE CASCADE ON DELETE CASCADE,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) # becuz users r assigned roles (relationship)
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
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) # becuz employees are assigned follow ups (relationship)
    ON UPDATE CASCADE ON DELETE CASCADE,
    
    FOREIGN KEY (created_by) REFERENCES users(id) # becuz users created follow ups (relationship)
    ON UPDATE CASCADE ON DELETE RESTRICT,
    
    FOREIGN KEY (status_id) REFERENCES followup_status(id) # becuz follow up status labels follow ups (relationship)
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

    FOREIGN KEY (followup_id) REFERENCES followups(id) # becuz follow ups has follow up comments (relationship)
    ON UPDATE CASCADE ON DELETE CASCADE,

    FOREIGN KEY (user_id) REFERENCES users(id) # becuz user writes follow up comments (relationship)
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

    FOREIGN KEY (followup_id) REFERENCES followups(id) # becuz follow ups have follow up attachements (relationship)
    ON UPDATE CASCADE ON DELETE CASCADE,

    FOREIGN KEY (uploaded_by) REFERENCES users(id) # becuz user uploads follow up attachements (relationship)
    ON UPDATE CASCADE ON DELETE RESTRICT
);