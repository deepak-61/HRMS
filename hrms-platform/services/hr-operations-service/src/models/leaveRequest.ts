import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// Zod schema for validation
export const leaveRequestSchema = z.object({
  employeeId: z.number().positive('Employee ID is required'),
  leaveType: z.enum(['annual', 'sick', 'maternity', 'paternity', 'personal', 'emergency']),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).default('pending'),
  approverId: z.number().optional(),
  approverComments: z.string().optional(),
  attachments: z.array(z.string()).optional()
});

export const leaveRequestUpdateSchema = leaveRequestSchema.partial();

export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
export type LeaveRequestUpdate = z.infer<typeof leaveRequestUpdateSchema>;

// Mongoose schema
export interface ILeaveRequest extends Document {
  employeeId: number;
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'personal' | 'emergency';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approverId?: number;
  approverComments?: string;
  attachments?: string[];
  daysRequested: number;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>({
  employeeId: { type: Number, required: true, index: true },
  leaveType: {
    type: String,
    required: true,
    enum: ['annual', 'sick', 'maternity', 'paternity', 'personal', 'emergency']
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true, minlength: 10 },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approverId: { type: Number, index: true },
  approverComments: String,
  attachments: [String],
  daysRequested: { type: Number, required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate days requested before saving
LeaveRequestSchema.pre('save', function(this: ILeaveRequest) {
  if (this.isModified('startDate') || this.isModified('endDate')) {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    this.daysRequested = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
});

// Indexes for performance
LeaveRequestSchema.index({ employeeId: 1, status: 1 });
LeaveRequestSchema.index({ startDate: 1, endDate: 1 });

export const LeaveRequest = mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);