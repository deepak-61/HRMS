import { LeaveRequest, ILeaveRequest, LeaveRequestInput, LeaveRequestUpdate } from '../models/leaveRequest';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import axios from 'axios';

export class LeaveService {
  async createLeaveRequest(employeeId: number, leaveData: LeaveRequestInput): Promise<ILeaveRequest> {
    try {
      // Validate that employee exists
      await this.validateEmployee(employeeId);
      
      // Check for overlapping leave requests
      const overlapping = await LeaveRequest.findOne({
        employeeId,
        status: { $in: ['pending', 'approved'] },
        $or: [
          {
            startDate: { $lte: new Date(leaveData.endDate) },
            endDate: { $gte: new Date(leaveData.startDate) }
          }
        ]
      });

      if (overlapping) {
        throw new AppError('You have an overlapping leave request for these dates', 400);
      }

      const leaveRequest = new LeaveRequest({
        ...leaveData,
        employeeId,
        startDate: new Date(leaveData.startDate),
        endDate: new Date(leaveData.endDate)
      });

      await leaveRequest.save();
      logger.info(`Leave request created for employee ${employeeId}`);
      
      return leaveRequest;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create leave request', 500);
    }
  }

  async getLeaveRequestsByEmployee(employeeId: number, page: number = 1, limit: number = 10): Promise<{
    requests: ILeaveRequest[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [requests, total] = await Promise.all([
      LeaveRequest.find({ employeeId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LeaveRequest.countDocuments({ employeeId })
    ]);

    return {
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getAllLeaveRequests(page: number = 1, limit: number = 10, status?: string): Promise<{
    requests: ILeaveRequest[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const filter = status ? { status } : {};
    
    const [requests, total] = await Promise.all([
      LeaveRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LeaveRequest.countDocuments(filter)
    ]);

    return {
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateLeaveRequest(requestId: string, updateData: LeaveRequestUpdate, userId: number): Promise<ILeaveRequest | null> {
    const leaveRequest = await LeaveRequest.findById(requestId);
    
    if (!leaveRequest) {
      return null;
    }

    // Only the employee who created the request or HR can update it
    if (leaveRequest.employeeId !== userId) {
      // Check if user is HR manager through Employee Service
      const isHRManager = await this.checkHRPermission(userId);
      if (!isHRManager) {
        throw new AppError('You can only update your own leave requests', 403);
      }
    }

    // If request is being approved/rejected, only HR can do it
    if (updateData.status && ['approved', 'rejected'].includes(updateData.status)) {
      const isHRManager = await this.checkHRPermission(userId);
      if (!isHRManager) {
        throw new AppError('Only HR managers can approve or reject leave requests', 403);
      }
      updateData.approverId = userId;
    }

    Object.assign(leaveRequest, updateData);
    await leaveRequest.save();
    
    logger.info(`Leave request ${requestId} updated by user ${userId}`);
    return leaveRequest;
  }

  async deleteLeaveRequest(requestId: string, userId: number): Promise<boolean> {
    const leaveRequest = await LeaveRequest.findById(requestId);
    
    if (!leaveRequest) {
      return false;
    }

    // Only the employee who created the request can delete it (if pending)
    if (leaveRequest.employeeId !== userId || leaveRequest.status !== 'pending') {
      throw new AppError('You can only delete your own pending leave requests', 403);
    }

    await LeaveRequest.findByIdAndDelete(requestId);
    logger.info(`Leave request ${requestId} deleted by user ${userId}`);
    
    return true;
  }

  async getLeaveBalance(employeeId: number): Promise<{
    annual: number;
    sick: number;
    personal: number;
    used: { [key: string]: number };
  }> {
    // Calculate used leave days for current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const approvedLeaves = await LeaveRequest.find({
      employeeId,
      status: 'approved',
      startDate: { $gte: startOfYear },
      endDate: { $lte: endOfYear }
    });

    const used = approvedLeaves.reduce((acc, leave) => {
      acc[leave.leaveType] = (acc[leave.leaveType] || 0) + leave.daysRequested;
      return acc;
    }, {} as { [key: string]: number });

    // Standard leave allocations (in a real app, this would come from employee data)
    const allocations = {
      annual: 21,
      sick: 10,
      personal: 5
    };

    return {
      annual: allocations.annual - (used.annual || 0),
      sick: allocations.sick - (used.sick || 0),
      personal: allocations.personal - (used.personal || 0),
      used
    };
  }

  private async validateEmployee(employeeId: number): Promise<void> {
    try {
      const employeeServiceUrl = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:3001';
      await axios.get(`${employeeServiceUrl}/api/employees/${employeeId}`);
    } catch (error) {
      throw new AppError('Invalid employee ID', 400);
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