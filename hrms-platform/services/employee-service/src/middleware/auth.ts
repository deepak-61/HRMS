import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, catchAsync } from './errorHandler';
import { EmployeeService } from '../services/employeeService';

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

const employeeService = new EmployeeService();

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

  // 3) Check if user still exists
  const currentEmployee = await employeeService.getEmployeeById(decoded.id);
  if (!currentEmployee) {
    return next(new AppError('The employee belonging to this token does no longer exist.', 401));
  }

  // 4) Check if employee is active
  if (currentEmployee.status !== 'active') {
    return next(new AppError('Your account is not active. Please contact HR.', 401));
  }

  // Grant access to protected route
  req.user = {
    id: currentEmployee.id,
    email: currentEmployee.email,
    firstName: currentEmployee.firstName,
    lastName: currentEmployee.lastName,
    department: currentEmployee.department,
    position: currentEmployee.position
  };
  
  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // For now, we'll use position as role. In a real app, you might have a separate roles system
    if (!req.user || !roles.includes(req.user.position.toLowerCase())) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

export const signToken = (id: number, email: string): string => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};