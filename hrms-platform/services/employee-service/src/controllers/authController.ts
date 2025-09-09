import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employeeService';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { signToken } from '../middleware/auth';
import { loginSchema, registerSchema } from '../models/employee';
import { logger } from '../utils/logger';

const employeeService = new EmployeeService();

const createSendToken = (employee: any, statusCode: number, res: Response) => {
  const token = signToken(employee.id, employee.email);
  
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  const { password, ...employeeWithoutPassword } = employee;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      employee: employeeWithoutPassword
    }
  });
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Validate input
  const validatedData = registerSchema.parse(req.body);
  
  try {
    const newEmployee = await employeeService.createEmployee(validatedData);
    
    logger.info(`New employee registered: ${validatedData.email}`);
    createSendToken(newEmployee, 201, res);
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return next(new AppError('Employee with this email already exists', 400));
    }
    throw error;
  }
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = loginSchema.parse(req.body);

  // Check if employee exists && password is correct
  const employee = await employeeService.validatePassword(email, password);
  
  if (!employee) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // If everything ok, send token to client
  logger.info(`Employee logged in: ${email}`);
  createSendToken(employee, 200, res);
});

export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({ 
    status: 'success',
    message: 'Logged out successfully'
  });
};

export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const employee = await employeeService.getEmployeeById(req.user!.id);
  
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      employee
    }
  });
});