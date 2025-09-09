import { Request, Response, NextFunction } from 'express';
import { LeaveService } from '../services/leaveService';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { leaveRequestSchema, leaveRequestUpdateSchema } from '../models/leaveRequest';
import { logger } from '../utils/logger';

const leaveService = new LeaveService();

export const createLeaveRequest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const validatedData = leaveRequestSchema.parse(req.body);
  
  const leaveRequest = await leaveService.createLeaveRequest(req.user!.id, validatedData);

  res.status(201).json({
    status: 'success',
    data: {
      leaveRequest
    }
  });
});

export const getMyLeaveRequests = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await leaveService.getLeaveRequestsByEmployee(req.user!.id, page, limit);

  res.status(200).json({
    status: 'success',
    results: result.requests.length,
    pagination: {
      page: result.page,
      totalPages: result.totalPages,
      total: result.total
    },
    data: {
      requests: result.requests
    }
  });
});

export const getAllLeaveRequests = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;

  const result = await leaveService.getAllLeaveRequests(page, limit, status);

  res.status(200).json({
    status: 'success',
    results: result.requests.length,
    pagination: {
      page: result.page,
      totalPages: result.totalPages,
      total: result.total
    },
    data: {
      requests: result.requests
    }
  });
});

export const updateLeaveRequest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const validatedData = leaveRequestUpdateSchema.parse(req.body);
  
  const updatedRequest = await leaveService.updateLeaveRequest(id, validatedData, req.user!.id);

  if (!updatedRequest) {
    return next(new AppError('Leave request not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      leaveRequest: updatedRequest
    }
  });
});

export const deleteLeaveRequest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const deleted = await leaveService.deleteLeaveRequest(id, req.user!.id);

  if (!deleted) {
    return next(new AppError('Leave request not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const getLeaveBalance = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const employeeId = req.params.employeeId ? parseInt(req.params.employeeId) : req.user!.id;
  
  const balance = await leaveService.getLeaveBalance(employeeId);

  res.status(200).json({
    status: 'success',
    data: {
      balance
    }
  });
});