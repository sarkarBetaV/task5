-- Important: Create database first
CREATE DATABASE user_management_app;

USE user_management_app;

-- Note: Users table with unique index on email
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE, -- Nota bene: This creates unique index
    password VARCHAR(255) NOT NULL,
    status ENUM('unverified', 'active', 'blocked') DEFAULT 'unverified',
    last_login_time TIMESTAMP NULL,
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Important: Create explicit unique index (requirement)
CREATE UNIQUE INDEX idx_email_unique ON users(email);