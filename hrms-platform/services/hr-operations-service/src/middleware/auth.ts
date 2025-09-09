import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { AppError, catchAsync } from './errorHandler';
import { logger } from '../utils/logger';

interface JwtPayload {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        department: string;
        position: string;
      };
    }
  }
}

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

  // 3) Verify employee with Employee Service
  try {
    const employeeServiceUrl = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:3001';
    const response = await axios.get(`${employeeServiceUrl}/api/employees/${decoded.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.data.data.employee) {
      return next(new AppError('The employee belonging to this token does no longer exist.', 401));
    }

    const employee = response.data.data.employee;

    // 4) Check if employee is active
    if (employee.status !== 'active') {
      return next(new AppError('Your account is not active. Please contact HR.', 401));
    }

    // Grant access to protected route
    req.user = {
      id: employee.id,
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      department: employee.department,
      position: employee.position
    };
    
    next();
  } catch (error: any) {
    logger.error('Error verifying employee with Employee Service:', error.message);
    return next(new AppError('Authentication failed. Please try again.', 401));
  }
});

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.position.toLowerCase())) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};