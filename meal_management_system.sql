-- File: database_setup.sql
CREATE DATABASE IF NOT EXISTS meal_management_system;
USE meal_management_system;

-- Bảng đơn vị
CREATE TABLE units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_code VARCHAR(20) UNIQUE NOT NULL,
    unit_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng người dùng
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    military_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    role ENUM('admin', 'soldier') DEFAULT 'soldier',
    unit_id INT,
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
);

-- Bảng bữa ăn (cấu hình)
CREATE TABLE meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meal_type ENUM('breakfast', 'lunch', 'dinner') NOT NULL,
    meal_name VARCHAR(50) NOT NULL,
    description TEXT,
    start_time TIME,
    end_time TIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng đăng ký suất ăn
CREATE TABLE meal_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    meal_id INT NOT NULL,
    registration_date DATE NOT NULL,
    status ENUM('registered', 'cancelled') DEFAULT 'registered',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (user_id, meal_id, registration_date)
);

-- Bảng cấu hình hệ thống
CREATE TABLE system_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(50) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng nhật ký
CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert dữ liệu mẫu
INSERT INTO units (unit_code, unit_name) VALUES
('UNIT001', 'Đại đội 1'),
('UNIT002', 'Đại đội 2'),
('UNIT003', 'Đại đội 3');

INSERT INTO meals (meal_type, meal_name, start_time, end_time) VALUES
('breakfast', 'Bữa sáng', '06:00:00', '08:00:00'),
('lunch', 'Bữa trưa', '11:00:00', '13:00:00'),
('dinner', 'Bữa tối', '17:00:00', '19:00:00');

INSERT INTO system_configs (config_key, config_value, description) VALUES
('cancel_deadline', '1', 'Số ngày tối thiểu trước khi hủy (0 = không cho hủy)'),
('registration_deadline', '18:00', 'Giờ đăng ký muộn nhất'),
('allow_same_day_cancel', 'false', 'Cho phép hủy cùng ngày'),
('system_title', 'Hệ thống quản lý suất ăn', 'Tiêu đề hệ thống');

-- Tạo tài khoản admin mặc định (password: admin123)
INSERT INTO users (military_code, full_name, password, role, position) VALUES
('ADMIN001', 'Quản trị viên', 'admin123', 'admin', 'Quản trị hệ thống');

-- Tạo tài khoản quân nhân mẫu (password: soldier123)
INSERT INTO users (military_code, full_name, password, role, unit_id, position) VALUES
('QN001', 'Nguyễn Văn A', 'soldier123', 'soldier', 1, 'Binh nhất'),
('QN002', 'Trần Thị B', 'soldier123', 'soldier', 2, 'Binh nhì'),
('QN003', 'Lê Văn C', 'soldier123', 'soldier', 3, 'Hạ sĩ');