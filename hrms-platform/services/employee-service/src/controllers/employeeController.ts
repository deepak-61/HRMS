import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employeeService';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { employeeSchema, employeeUpdateSchema } from '../models/employee';
import { logger } from '../utils/logger';

const employeeService = new EmployeeService();

export const getAllEmployees = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const department = req.query.department as string;

  const result = await employeeService.getAllEmployees(page, limit, department);

  res.status(200).json({
    status: 'success',
    results: result.employees.length,
    pagination: {
      page: result.page,
      totalPages: result.totalPages,
      total: result.total
    },
    data: {
      employees: result.employees
    }
  });
});

export const getEmployee = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return next(new AppError('Invalid employee ID', 400));
  }

  const employee = await employeeService.getEmployeeById(id);

  if (!employee) {
    return next(new AppError('No employee found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      employee
    }
  });
});

export const createEmployee = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Only HR managers can create employees
  if (req.user!.position.toLowerCase() !== 'hr manager' && req.user!.position.toLowerCase() !== 'admin') {
    return next(new AppError('You do not have permission to create employees', 403));
  }

  const validatedData = employeeSchema.parse(req.body);
  
  // Generate a temporary password (in real app, this should be sent via email)
  const tempPassword = Math.random().toString(36).slice(-8);
  
  const newEmployee = await employeeService.createEmployee({
    ...validatedData,
    password: tempPassword
  });

  logger.info(`Employee created by ${req.user!.email}: ${validatedData.email}`);

  res.status(201).json({
    status: 'success',
    data: {
      employee: newEmployee,
      tempPassword // In production, send this via email
    }
  });
});

export const updateEmployee = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return next(new AppError('Invalid employee ID', 400));
  }

  // Employees can only update their own profile, unless they're HR managers
  if (req.user!.id !== id && req.user!.position.toLowerCase() !== 'hr manager' && req.user!.position.toLowerCase() !== 'admin') {
    return next(new AppError('You can only update your own profile', 403));
  }

  const validatedData = employeeUpdateSchema.parse(req.body);
  
  const updatedEmployee = await employeeService.updateEmployee(id, validatedData);

  if (!updatedEmployee) {
    return next(new AppError('No employee found with that ID', 404));
  }

  logger.info(`Employee updated by ${req.user!.email}: ID ${id}`);

  res.status(200).json({
    status: 'success',
    data: {
      employee: updatedEmployee
    }
  });
});

export const deleteEmployee = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return next(new AppError('Invalid employee ID', 400));
  }

  // Only HR managers can delete employees
  if (req.user!.position.toLowerCase() !== 'hr manager' && req.user!.position.toLowerCase() !== 'admin') {
    return next(new AppError('You do not have permission to delete employees', 403));
  }

  const deleted = await employeeService.deleteEmployee(id);

  if (!deleted) {
    return next(new AppError('No employee found with that ID', 404));
  }

  logger.info(`Employee deleted by ${req.user!.email}: ID ${id}`);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const getEmployeesByDepartment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { department } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await employeeService.getAllEmployees(page, limit, department);

  res.status(200).json({
    status: 'success',
    results: result.employees.length,
    pagination: {
      page: result.page,
      totalPages: result.totalPages,
      total: result.total
    },
    data: {
      employees: result.employees,
      department
    }
  });
});