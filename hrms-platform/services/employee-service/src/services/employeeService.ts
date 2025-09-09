import pool from '../config/database';
import { Employee, EmployeeInput, EmployeeUpdate } from '../models/employee';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

export class EmployeeService {
  async createEmployee(employeeData: EmployeeInput & { password: string }): Promise<Employee> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(employeeData.password, 12);
      
      // Check if email already exists
      const existingEmployee = await client.query(
        'SELECT id FROM employees WHERE email = $1',
        [employeeData.email]
      );
      
      if (existingEmployee.rows.length > 0) {
        throw new AppError('Employee with this email already exists', 400);
      }
      
      const query = `
        INSERT INTO employees (
          first_name, last_name, email, phone, department, position, 
          salary, hire_date, status, manager_id, password_hash, address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;
      
      const values = [
        employeeData.firstName,
        employeeData.lastName,
        employeeData.email,
        employeeData.phone,
        employeeData.department,
        employeeData.position,
        employeeData.salary,
        employeeData.hireDate,
        employeeData.status || 'active',
        employeeData.managerId || null,
        hashedPassword,
        JSON.stringify(employeeData.address || {})
      ];
      
      const result = await client.query(query, values);
      await client.query('COMMIT');
      
      logger.info(`Employee created: ${employeeData.email}`);
      return this.mapDbRowToEmployee(result.rows[0]);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getEmployeeById(id: number): Promise<Employee | null> {
    const query = 'SELECT * FROM employees WHERE id = $1 AND status != $2';
    const result = await pool.query(query, [id, 'terminated']);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapDbRowToEmployee(result.rows[0]);
  }

  async getEmployeeByEmail(email: string): Promise<Employee | null> {
    const query = 'SELECT * FROM employees WHERE email = $1 AND status != $2';
    const result = await pool.query(query, [email, 'terminated']);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapDbRowToEmployee(result.rows[0]);
  }

  async getAllEmployees(page: number = 1, limit: number = 10, department?: string): Promise<{
    employees: Employee[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM employees WHERE status != $1';
    let countQuery = 'SELECT COUNT(*) FROM employees WHERE status != $1';
    const params: any[] = ['terminated'];
    
    if (department) {
      query += ' AND department = $2';
      countQuery += ' AND department = $2';
      params.push(department);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    const [employeesResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2)) // Remove limit and offset for count
    ]);
    
    const employees = employeesResult.rows.map(row => this.mapDbRowToEmployee(row));
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);
    
    return {
      employees,
      total,
      page,
      totalPages
    };
  }

  async updateEmployee(id: number, updateData: EmployeeUpdate): Promise<Employee | null> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if employee exists
      const existingEmployee = await client.query(
        'SELECT id FROM employees WHERE id = $1 AND status != $2',
        [id, 'terminated']
      );
      
      if (existingEmployee.rows.length === 0) {
        return null;
      }
      
      // Build dynamic update query
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbField = this.camelToSnakeCase(key);
          if (key === 'address') {
            updateFields.push(`${dbField} = $${paramCount}`);
            values.push(JSON.stringify(value));
          } else {
            updateFields.push(`${dbField} = $${paramCount}`);
            values.push(value);
          }
          paramCount++;
        }
      });
      
      if (updateFields.length === 0) {
        throw new AppError('No valid fields to update', 400);
      }
      
      updateFields.push(`updated_at = NOW()`);
      values.push(id);
      
      const query = `
        UPDATE employees 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
      
      const result = await client.query(query, values);
      await client.query('COMMIT');
      
      logger.info(`Employee updated: ID ${id}`);
      return this.mapDbRowToEmployee(result.rows[0]);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const query = `
      UPDATE employees 
      SET status = 'terminated', updated_at = NOW()
      WHERE id = $1 AND status != 'terminated'
      RETURNING id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return false;
    }
    
    logger.info(`Employee soft deleted: ID ${id}`);
    return true;
  }

  async validatePassword(email: string, password: string): Promise<Employee | null> {
    const query = 'SELECT * FROM employees WHERE email = $1 AND status = $2';
    const result = await pool.query(query, [email, 'active']);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const employee = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, employee.password_hash);
    
    if (!isValidPassword) {
      return null;
    }
    
    return this.mapDbRowToEmployee(employee);
  }

  private mapDbRowToEmployee(row: any): Employee {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      department: row.department,
      position: row.position,
      salary: parseFloat(row.salary),
      hireDate: row.hire_date,
      status: row.status,
      managerId: row.manager_id,
      address: row.address ? JSON.parse(row.address) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}