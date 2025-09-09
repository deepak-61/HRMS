import { Employee, EmployeeStatus, Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { EmployeeInput, EmployeeUpdate } from '../models/employee';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

export type EmployeeWithoutPassword = Omit<Employee, 'passwordHash'>;

export class EmployeeService {
  async createEmployee(employeeData: EmployeeInput & { password: string }): Promise<EmployeeWithoutPassword> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(employeeData.password, 12);
      
      // Check if email already exists
      const existingEmployee = await prisma.employee.findUnique({
        where: { email: employeeData.email }
      });
      
      if (existingEmployee) {
        throw new AppError('Employee with this email already exists', 400);
      }
      
      const employee = await prisma.employee.create({
        data: {
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          email: employeeData.email,
          phone: employeeData.phone,
          department: employeeData.department,
          position: employeeData.position,
          salary: employeeData.salary,
          hireDate: new Date(employeeData.hireDate),
          status: employeeData.status ? this.mapStatusToEnum(employeeData.status) : EmployeeStatus.ACTIVE,
          managerId: employeeData.managerId || null,
          passwordHash: hashedPassword,
          address: employeeData.address || Prisma.JsonNull
        }
      });
      
      logger.info(`Employee created: ${employeeData.email}`);
      return this.excludePassword(employee);
      
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AppError('Employee with this email already exists', 400);
        }
      }
      throw error instanceof AppError ? error : new AppError('Failed to create employee', 500);
    }
  }

  async getEmployeeById(id: number): Promise<EmployeeWithoutPassword | null> {
    const employee = await prisma.employee.findFirst({
      where: {
        id,
        status: { not: EmployeeStatus.TERMINATED }
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        }
      }
    });
    
    if (!employee) {
      return null;
    }
    
    return this.excludePassword(employee);
  }

  async getEmployeeByEmail(email: string): Promise<EmployeeWithoutPassword | null> {
    const employee = await prisma.employee.findFirst({
      where: {
        email,
        status: { not: EmployeeStatus.TERMINATED }
      }
    });
    
    if (!employee) {
      return null;
    }
    
    return this.excludePassword(employee);
  }

  async getAllEmployees(page: number = 1, limit: number = 10, department?: string): Promise<{
    employees: EmployeeWithoutPassword[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const where: Prisma.EmployeeWhereInput = {
      status: { not: EmployeeStatus.TERMINATED }
    };
    
    if (department) {
      where.department = department;
    }
    
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              position: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.employee.count({ where })
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      employees: employees.map(emp => this.excludePassword(emp)),
      total,
      page,
      totalPages
    };
  }

  async updateEmployee(id: number, updateData: EmployeeUpdate): Promise<EmployeeWithoutPassword | null> {
    try {
      // Check if employee exists
      const existingEmployee = await prisma.employee.findFirst({
        where: {
          id,
          status: { not: EmployeeStatus.TERMINATED }
        }
      });
      
      if (!existingEmployee) {
        return null;
      }
      
      // Prepare update data
      const data: Prisma.EmployeeUpdateInput = {};
      
      if (updateData.firstName) data.firstName = updateData.firstName;
      if (updateData.lastName) data.lastName = updateData.lastName;
      if (updateData.email) data.email = updateData.email;
      if (updateData.phone) data.phone = updateData.phone;
      if (updateData.department) data.department = updateData.department;
      if (updateData.position) data.position = updateData.position;
      if (updateData.salary !== undefined) data.salary = updateData.salary;
      if (updateData.hireDate) data.hireDate = new Date(updateData.hireDate);
      if (updateData.status) data.status = this.mapStatusToEnum(updateData.status);
      if (updateData.managerId !== undefined) data.managerId = updateData.managerId;
      if (updateData.address !== undefined) data.address = updateData.address || Prisma.JsonNull;
      
      const updatedEmployee = await prisma.employee.update({
        where: { id },
        data,
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              position: true
            }
          }
        }
      });
      
      logger.info(`Employee updated: ID ${id}`);
      return this.excludePassword(updatedEmployee);
      
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AppError('Employee with this email already exists', 400);
        }
      }
      throw error instanceof AppError ? error : new AppError('Failed to update employee', 500);
    }
  }

  async deleteEmployee(id: number): Promise<boolean> {
    try {
      const updatedEmployee = await prisma.employee.updateMany({
        where: {
          id,
          status: { not: EmployeeStatus.TERMINATED }
        },
        data: {
          status: EmployeeStatus.TERMINATED
        }
      });
      
      if (updatedEmployee.count === 0) {
        return false;
      }
      
      logger.info(`Employee soft deleted: ID ${id}`);
      return true;
      
    } catch (error) {
      throw new AppError('Failed to delete employee', 500);
    }
  }

  async validatePassword(email: string, password: string): Promise<EmployeeWithoutPassword | null> {
    const employee = await prisma.employee.findFirst({
      where: {
        email,
        status: EmployeeStatus.ACTIVE
      }
    });
    
    if (!employee) {
      return null;
    }
    
    const isValidPassword = await bcrypt.compare(password, employee.passwordHash);
    
    if (!isValidPassword) {
      return null;
    }
    
    return this.excludePassword(employee);
  }

  async getEmployeesByDepartment(department: string, page: number = 1, limit: number = 10): Promise<{
    employees: EmployeeWithoutPassword[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.getAllEmployees(page, limit, department);
  }

  async getSubordinates(managerId: number): Promise<EmployeeWithoutPassword[]> {
    const subordinates = await prisma.employee.findMany({
      where: {
        managerId,
        status: { not: EmployeeStatus.TERMINATED }
      },
      orderBy: { firstName: 'asc' }
    });
    
    return subordinates.map(emp => this.excludePassword(emp));
  }

  private excludePassword(employee: Employee & any): EmployeeWithoutPassword {
    const { passwordHash, ...employeeWithoutPassword } = employee;
    return {
      ...employeeWithoutPassword,
      status: this.mapEnumToStatus(employee.status)
    };
  }

  private mapStatusToEnum(status: string): EmployeeStatus {
    switch (status.toLowerCase()) {
      case 'active': return EmployeeStatus.ACTIVE;
      case 'inactive': return EmployeeStatus.INACTIVE;
      case 'terminated': return EmployeeStatus.TERMINATED;
      default: return EmployeeStatus.ACTIVE;
    }
  }

  private mapEnumToStatus(status: EmployeeStatus): string {
    switch (status) {
      case EmployeeStatus.ACTIVE: return 'active';
      case EmployeeStatus.INACTIVE: return 'inactive';
      case EmployeeStatus.TERMINATED: return 'terminated';
      default: return 'active';
    }
  }
}