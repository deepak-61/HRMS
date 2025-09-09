import { Payroll, IPayroll, PayrollInput, PayrollUpdate } from '../models/payroll';
import { Attendance } from '../models/attendance';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import moment from 'moment';
import axios from 'axios';

export class PayrollService {
  async createPayroll(payrollData: PayrollInput): Promise<IPayroll> {
    try {
      // Validate employee exists
      await this.validateEmployee(payrollData.employeeId);
      
      // Check for existing payroll for the same period
      const existingPayroll = await Payroll.findOne({
        employeeId: payrollData.employeeId,
        payPeriodStart: new Date(payrollData.payPeriodStart),
        payPeriodEnd: new Date(payrollData.payPeriodEnd)
      });

      if (existingPayroll) {
        throw new AppError('Payroll already exists for this employee and period', 400);
      }

      const payroll = new Payroll({
        ...payrollData,
        payPeriodStart: new Date(payrollData.payPeriodStart),
        payPeriodEnd: new Date(payrollData.payPeriodEnd),
        paymentDate: payrollData.paymentDate ? new Date(payrollData.paymentDate) : undefined
      });

      await payroll.save();
      logger.info(`Payroll created for employee ${payrollData.employeeId}`);
      
      return payroll;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create payroll', 500);
    }
  }

  async generatePayroll(
    employeeId: number,
    payPeriodStart: string,
    payPeriodEnd: string
  ): Promise<IPayroll> {
    try {
      // Get employee data
      const employee = await this.getEmployeeData(employeeId);
      
      // Calculate hours worked from attendance
      const hoursData = await this.calculateHoursWorked(employeeId, payPeriodStart, payPeriodEnd);
      
      // Calculate pay components
      const baseSalary = this.calculateBaseSalary(employee.salary, payPeriodStart, payPeriodEnd);
      const overtimeHours = Math.max(0, hoursData.totalHours - hoursData.regularHours);
      const overtimeRate = (employee.salary / 2080) * 1.5; // Assuming 40 hrs/week * 52 weeks = 2080 hrs/year
      
      // Calculate deductions (simplified calculation)
      const deductions = this.calculateDeductions(baseSalary + (overtimeHours * overtimeRate));
      
      const payrollData: PayrollInput = {
        employeeId,
        payPeriodStart,
        payPeriodEnd,
        baseSalary,
        overtimeHours,
        overtimeRate,
        bonuses: 0, // Default, can be updated later
        deductions,
        status: 'draft'
      };

      return await this.createPayroll(payrollData);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to generate payroll', 500);
    }
  }

  async getPayrollByEmployee(
    employeeId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    payrolls: IPayroll[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [payrolls, total] = await Promise.all([
      Payroll.find({ employeeId })
        .sort({ payPeriodStart: -1 })
        .skip(skip)
        .limit(limit),
      Payroll.countDocuments({ employeeId })
    ]);

    return {
      payrolls,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getAllPayrolls(
    page: number = 1,
    limit: number = 10,
    status?: string,
    payPeriodStart?: string,
    payPeriodEnd?: string
  ): Promise<{
    payrolls: IPayroll[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (payPeriodStart && payPeriodEnd) {
      filter.payPeriodStart = { $gte: new Date(payPeriodStart) };
      filter.payPeriodEnd = { $lte: new Date(payPeriodEnd) };
    }
    
    const [payrolls, total] = await Promise.all([
      Payroll.find(filter)
        .sort({ payPeriodStart: -1, employeeId: 1 })
        .skip(skip)
        .limit(limit),
      Payroll.countDocuments(filter)
    ]);

    return {
      payrolls,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updatePayroll(
    payrollId: string,
    updateData: PayrollUpdate,
    userId: number
  ): Promise<IPayroll | null> {
    const payroll = await Payroll.findById(payrollId);
    
    if (!payroll) {
      return null;
    }

    // Only HR managers can update payroll
    const isHRManager = await this.checkHRPermission(userId);
    if (!isHRManager) {
      throw new AppError('Only HR managers can update payroll records', 403);
    }

    // Don't allow updates to processed or paid payrolls
    if (payroll.status === 'paid') {
      throw new AppError('Cannot update paid payroll records', 400);
    }

    Object.assign(payroll, updateData);
    if (updateData.payPeriodStart) payroll.payPeriodStart = new Date(updateData.payPeriodStart);
    if (updateData.payPeriodEnd) payroll.payPeriodEnd = new Date(updateData.payPeriodEnd);
    if (updateData.paymentDate) payroll.paymentDate = new Date(updateData.paymentDate);

    await payroll.save();
    
    logger.info(`Payroll ${payrollId} updated by user ${userId}`);
    return payroll;
  }

  async processPayroll(payrollId: string, userId: number): Promise<IPayroll | null> {
    const payroll = await Payroll.findById(payrollId);
    
    if (!payroll) {
      return null;
    }

    // Only HR managers can process payroll
    const isHRManager = await this.checkHRPermission(userId);
    if (!isHRManager) {
      throw new AppError('Only HR managers can process payroll', 403);
    }

    if (payroll.status !== 'draft') {
      throw new AppError('Only draft payrolls can be processed', 400);
    }

    payroll.status = 'processed';
    await payroll.save();
    
    logger.info(`Payroll ${payrollId} processed by user ${userId}`);
    return payroll;
  }

  async markPayrollAsPaid(payrollId: string, userId: number, paymentDate?: string): Promise<IPayroll | null> {
    const payroll = await Payroll.findById(payrollId);
    
    if (!payroll) {
      return null;
    }

    // Only HR managers can mark payroll as paid
    const isHRManager = await this.checkHRPermission(userId);
    if (!isHRManager) {
      throw new AppError('Only HR managers can mark payroll as paid', 403);
    }

    if (payroll.status !== 'processed') {
      throw new AppError('Only processed payrolls can be marked as paid', 400);
    }

    payroll.status = 'paid';
    payroll.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
    await payroll.save();
    
    logger.info(`Payroll ${payrollId} marked as paid by user ${userId}`);
    return payroll;
  }

  async getPayrollSummary(
    startDate: string,
    endDate: string
  ): Promise<{
    totalPayrolls: number;
    totalGrossPay: number;
    totalNetPay: number;
    totalDeductions: number;
    statusBreakdown: { [key: string]: number };
    averagePay: number;
  }> {
    const payrolls = await Payroll.find({
      payPeriodStart: { $gte: new Date(startDate) },
      payPeriodEnd: { $lte: new Date(endDate) }
    });

    const summary = payrolls.reduce((acc, payroll) => {
      acc.totalGrossPay += payroll.grossPay;
      acc.totalNetPay += payroll.netPay;
      acc.totalDeductions += payroll.totalDeductions;
      acc.statusBreakdown[payroll.status] = (acc.statusBreakdown[payroll.status] || 0) + 1;
      return acc;
    }, {
      totalGrossPay: 0,
      totalNetPay: 0,
      totalDeductions: 0,
      statusBreakdown: {} as { [key: string]: number }
    });

    return {
      totalPayrolls: payrolls.length,
      ...summary,
      averagePay: payrolls.length > 0 ? summary.totalNetPay / payrolls.length : 0
    };
  }

  private async calculateHoursWorked(employeeId: number, startDate: string, endDate: string): Promise<{
    totalHours: number;
    regularHours: number;
    overtimeHours: number;
  }> {
    const attendance = await Attendance.find({
      employeeId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      hoursWorked: { $exists: true, $ne: null }
    });

    const totalHours = attendance.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
    const workingDays = attendance.length;
    const regularHours = Math.min(totalHours, workingDays * 8); // Assuming 8 hours per day
    const overtimeHours = Math.max(0, totalHours - regularHours);

    return { totalHours, regularHours, overtimeHours };
  }

  private calculateBaseSalary(annualSalary: number, startDate: string, endDate: string): number {
    const start = moment(startDate);
    const end = moment(endDate);
    const daysInPeriod = end.diff(start, 'days') + 1;
    const daysInYear = moment().isLeapYear() ? 366 : 365;
    
    return (annualSalary / daysInYear) * daysInPeriod;
  }

  private calculateDeductions(grossPay: number): {
    tax: number;
    insurance: number;
    retirement: number;
    other: number;
  } {
    // Simplified deduction calculations
    const tax = grossPay * 0.22; // 22% tax rate
    const insurance = grossPay * 0.05; // 5% for health insurance
    const retirement = grossPay * 0.06; // 6% for 401k
    const other = 0;

    return { tax, insurance, retirement, other };
  }

  private async validateEmployee(employeeId: number): Promise<void> {
    try {
      const employeeServiceUrl = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:3001';
      await axios.get(`${employeeServiceUrl}/api/employees/${employeeId}`);
    } catch (error) {
      throw new AppError('Invalid employee ID', 400);
    }
  }

  private async getEmployeeData(employeeId: number): Promise<any> {
    try {
      const employeeServiceUrl = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:3001';
      const response = await axios.get(`${employeeServiceUrl}/api/employees/${employeeId}`);
      return response.data.data.employee;
    } catch (error) {
      throw new AppError('Failed to fetch employee data', 500);
    }
  }

  private async checkHRPermission(userId: number): Promise<boolean> {
    try {
      const employeeServiceUrl = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:3001';
      const response = await axios.get(`${employeeServiceUrl}/api/employees/${userId}`);
      const employee = response.data.data.employee;
      
      return employee.position.toLowerCase().includes('hr') || employee.position.toLowerCase() === 'admin';
    } catch (error) {
      return false;
    }
  }
}