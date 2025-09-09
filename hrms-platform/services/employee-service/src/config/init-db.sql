-- Employee Service Database Schema
-- Create database (run this separately if needed)
-- CREATE DATABASE hrms_employees;

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    department VARCHAR(50) NOT NULL,
    position VARCHAR(50) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    hire_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    manager_id INTEGER REFERENCES employees(id),
    password_hash VARCHAR(255) NOT NULL,
    address JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO employees (
    first_name, last_name, email, phone, department, position, salary, hire_date, password_hash, address
) VALUES 
(
    'John', 'Doe', 'john.doe@company.com', '1234567890', 'IT', 'Software Engineer', 75000.00, 
    '2023-01-15', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewJyMZO.8xOqHuWm', -- password: password123
    '{"street": "123 Main St", "city": "New York", "state": "NY", "zipCode": "10001", "country": "USA"}'
),
(
    'Jane', 'Smith', 'jane.smith@company.com', '0987654321', 'HR', 'HR Manager', 85000.00, 
    '2022-03-10', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewJyMZO.8xOqHuWm', -- password: password123
    '{"street": "456 Oak Ave", "city": "Los Angeles", "state": "CA", "zipCode": "90210", "country": "USA"}'
),
(
    'Mike', 'Johnson', 'mike.johnson@company.com', '5551234567', 'Finance', 'Financial Analyst', 65000.00, 
    '2023-06-01', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewJyMZO.8xOqHuWm', -- password: password123
    '{"street": "789 Pine Rd", "city": "Chicago", "state": "IL", "zipCode": "60601", "country": "USA"}'
),
(
    'Sarah', 'Wilson', 'sarah.wilson@company.com', '5559876543', 'Marketing', 'Marketing Manager', 70000.00, 
    '2022-11-20', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewJyMZO.8xOqHuWm', -- password: password123
    '{"street": "321 Elm St", "city": "Miami", "state": "FL", "zipCode": "33101", "country": "USA"}'
),
(
    'Admin', 'User', 'admin@company.com', '5550000000', 'Administration', 'Admin', 100000.00, 
    '2022-01-01', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewJyMZO.8xOqHuWm', -- password: password123
    '{"street": "999 Admin Blvd", "city": "Washington", "state": "DC", "zipCode": "20001", "country": "USA"}'
)
ON CONFLICT (email) DO NOTHING;

-- Update manager relationships
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE email = 'jane.smith@company.com') 
WHERE email IN ('john.doe@company.com', 'mike.johnson@company.com', 'sarah.wilson@company.com');