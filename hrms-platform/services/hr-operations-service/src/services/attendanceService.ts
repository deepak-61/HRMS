import { Attendance, IAttendance, AttendanceInput, AttendanceUpdate } from '../models/attendance';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import moment from 'moment';

export class AttendanceService {
  async checkIn(employeeId: number, location?: string, isRemote: boolean = false): Promise<IAttendance> {
    const today = moment().startOf('day').toDate();
    const now = new Date();

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: today
    });

    if (existingAttendance && existingAttendance.checkIn) {
      throw new AppError('You have already checked in today', 400);
    }

    // Determine if late (assuming work starts at 9 AM)
    const workStartTime = moment().startOf('day').add(9, 'hours').toDate();
    const isLate = now > workStartTime;

    const attendanceData: any = {
      employeeId,
      date: today,
      checkIn: now,
      status: isLate ? 'late' : 'present',
      location,
      isRemote
    };

    let attendance;
    if (existingAttendance) {
      Object.assign(existingAttendance, attendanceData);
      attendance = await existingAttendance.save();
    } else {
      attendance = new Attendance(attendanceData);
      await attendance.save();
    }

    logger.info(`Employee ${employeeId} checked in at ${now.toISOString()}`);
    return attendance;
  }

  async checkOut(employeeId: number): Promise<IAttendance> {
    const today = moment().startOf('day').toDate();
    const now = new Date();

    const attendance = await Attendance.findOne({
      employeeId,
      date: today
    });

    if (!attendance) {
      throw new AppError('No check-in record found for today', 400);
    }

    if (!attendance.checkIn) {
      throw new AppError('You must check in before checking out', 400);
    }

    if (attendance.checkOut) {
      throw new AppError('You have already checked out today', 400);
    }

    attendance.checkOut = now;
    await attendance.save();

    logger.info(`Employee ${employeeId} checked out at ${now.toISOString()}`);
    return attendance;
  }

  async getAttendanceByEmployee(
    employeeId: number,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    attendance: IAttendance[];
    total: number;
    page: number;
    totalPages: number;
    summary: {
      totalDays: number;
      presentDays: number;
      absentDays: number;
      lateDays: number;
      totalHours: number;
    };
  }> {
    const skip = (page - 1) * limit;
    
    // Build date filter
    const dateFilter: any = { employeeId };
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to current month
      const startOfMonth = moment().startOf('month').toDate();
      const endOfMonth = moment().endOf('month').toDate();
      dateFilter.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const [attendance, total] = await Promise.all([
      Attendance.find(dateFilter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(dateFilter)
    ]);

    // Calculate summary
    const allAttendance = await Attendance.find(dateFilter);
    const summary = this.calculateAttendanceSummary(allAttendance);

    return {
      attendance,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      summary
    };
  }

  async getAllAttendance(
    date?: string,
    department?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    attendance: IAttendance[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: any = {};
    if (date) {
      const targetDate = moment(date).startOf('day').toDate();
      const nextDay = moment(date).add(1, 'day').startOf('day').toDate();
      filter.date = { $gte: targetDate, $lt: nextDay };
    }

    // If department filter is needed, we'd need to join with employee data
    // For now, we'll keep it simple

    const [attendance, total] = await Promise.all([
      Attendance.find(filter)
        .sort({ date: -1, employeeId: 1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(filter)
    ]);

    return {
      attendance,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateAttendance(
    attendanceId: string,
    updateData: AttendanceUpdate,
    userId: number
  ): Promise<IAttendance | null> {
    const attendance = await Attendance.findById(attendanceId);
    
    if (!attendance) {
      return null;
    }

    // Only HR managers or the employee themselves can update attendance
    if (attendance.employeeId !== userId) {
      // In a real app, check HR permission via Employee Service
      // For now, we'll allow the update
    }

    Object.assign(attendance, updateData);
    if (updateData.checkIn) attendance.checkIn = new Date(updateData.checkIn);
    if (updateData.checkOut) attendance.checkOut = new Date(updateData.checkOut);
    if (updateData.date) attendance.date = new Date(updateData.date);

    await attendance.save();
    
    logger.info(`Attendance ${attendanceId} updated by user ${userId}`);
    return attendance;
  }

  async markAbsent(employeeId: number, date: string, reason?: string): Promise<IAttendance> {
    const targetDate = moment(date).startOf('day').toDate();
    
    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: targetDate
    });

    if (existingAttendance) {
      existingAttendance.status = 'absent';
      existingAttendance.notes = reason;
      await existingAttendance.save();
      return existingAttendance;
    }

    const attendance = new Attendance({
      employeeId,
      date: targetDate,
      status: 'absent',
      notes: reason
    });

    await attendance.save();
    logger.info(`Employee ${employeeId} marked absent for ${date}`);
    
    return attendance;
  }

  async getAttendanceReport(
    startDate: string,
    endDate: string,
    employeeIds?: number[]
  ): Promise<{
    summary: {
      totalEmployees: number;
      averageAttendance: number;
      totalWorkingDays: number;
    };
    employeeStats: Array<{
      employeeId: number;
      presentDays: number;
      absentDays: number;
      lateDays: number;
      totalHours: number;
      attendanceRate: number;
    }>;
  }> {
    const filter: any = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (employeeIds && employeeIds.length > 0) {
      filter.employeeId = { $in: employeeIds };
    }

    const attendanceRecords = await Attendance.find(filter);
    
    // Group by employee
    const employeeGroups = attendanceRecords.reduce((acc, record) => {
      if (!acc[record.employeeId]) {
        acc[record.employeeId] = [];
      }
      acc[record.employeeId].push(record);
      return acc;
    }, {} as { [key: number]: IAttendance[] });

    const workingDays = moment(endDate).diff(moment(startDate), 'days') + 1;
    
    const employeeStats = Object.entries(employeeGroups).map(([employeeId, records]) => {
      const summary = this.calculateAttendanceSummary(records);
      return {
        employeeId: parseInt(employeeId),
        presentDays: summary.presentDays,
        absentDays: summary.absentDays,
        lateDays: summary.lateDays,
        totalHours: summary.totalHours,
        attendanceRate: (summary.presentDays / workingDays) * 100
      };
    });

    const averageAttendance = employeeStats.length > 0 
      ? employeeStats.reduce((sum, stat) => sum + stat.attendanceRate, 0) / employeeStats.length
      : 0;

    return {
      summary: {
        totalEmployees: employeeStats.length,
        averageAttendance,
        totalWorkingDays: workingDays
      },
      employeeStats
    };
  }

  private calculateAttendanceSummary(attendance: IAttendance[]): {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalHours: number;
  } {
    return attendance.reduce((summary, record) => {
      summary.totalDays++;
      
      switch (record.status) {
        case 'present':
          summary.presentDays++;
          break;
        case 'late':
          summary.presentDays++;
          summary.lateDays++;
          break;
        case 'absent':
          summary.absentDays++;
          break;
      }
      
      if (record.hoursWorked) {
        summary.totalHours += record.hoursWorked;
      }
      
      return summary;
    }, {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      totalHours: 0
    });
  }
}