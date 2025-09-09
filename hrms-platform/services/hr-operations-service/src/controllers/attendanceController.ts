import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendanceService';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { attendanceSchema, attendanceUpdateSchema } from '../models/attendance';

const attendanceService = new AttendanceService();

export const checkIn = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { location, isRemote } = req.body;
  
  const attendance = await attendanceService.checkIn(req.user!.id, location, isRemote);

  res.status(200).json({
    status: 'success',
    message: 'Checked in successfully',
    data: {
      attendance
    }
  });
});

export const checkOut = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const attendance = await attendanceService.checkOut(req.user!.id);

  res.status(200).json({
    status: 'success',
    message: 'Checked out successfully',
    data: {
      attendance
    }
  });
});

export const getMyAttendance = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  const result = await attendanceService.getAttendanceByEmployee(
    req.user!.id, startDate, endDate, page, limit
  );

  res.status(200).json({
    status: 'success',
    results: result.attendance.length,
    pagination: {
      page: result.page,
      totalPages: result.totalPages,
      total: result.total
    },
    data: {
      attendance: result.attendance,
      summary: result.summary
    }
  });
});

export const getAllAttendance = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const date = req.query.date as string;
  const department = req.query.department as string;

  const result = await attendanceService.getAllAttendance(date, department, page, limit);

  res.status(200).json({
    status: 'success',
    results: result.attendance.length,
    pagination: {
      page: result.page,
      totalPages: result.totalPages,
      total: result.total
    },
    data: {
      attendance: result.attendance
    }
  });
});

export const getAttendanceReport = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.query as { startDate: string; endDate: string };
  const employeeIds = req.query.employeeIds as string;
  
  if (!startDate || !endDate) {
    return next(new AppError('Start date and end date are required', 400));
  }

  const employeeIdArray = employeeIds ? employeeIds.split(',').map(id => parseInt(id)) : undefined;
  
  const report = await attendanceService.getAttendanceReport(startDate, endDate, employeeIdArray);

  res.status(200).json({
    status: 'success',
    data: {
      report
    }
  });
});