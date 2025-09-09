import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// Zod schema for validation
export const attendanceSchema = z.object({
  employeeId: z.number().positive('Employee ID is required'),
  date: z.string().datetime('Invalid date format'),
  checkIn: z.string().datetime('Invalid check-in time').optional(),
  checkOut: z.string().datetime('Invalid check-out time').optional(),
  status: z.enum(['present', 'absent', 'late', 'half-day', 'holiday']).default('present'),
  notes: z.string().optional(),
  location: z.string().optional(),
  isRemote: z.boolean().default(false)
});

export const attendanceUpdateSchema = attendanceSchema.partial();

export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type AttendanceUpdate = z.infer<typeof attendanceUpdateSchema>;

// Mongoose schema
export interface IAttendance extends Document {
  employeeId: number;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'holiday';
  notes?: string;
  location?: string;
  isRemote: boolean;
  hoursWorked?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  employeeId: { type: Number, required: true, index: true },
  date: { type: Date, required: true },
  checkIn: Date,
  checkOut: Date,
  status: {
    type: String,
    required: true,
    enum: ['present', 'absent', 'late', 'half-day', 'holiday'],
    default: 'present'
  },
  notes: String,
  location: String,
  isRemote: { type: Boolean, default: false },
  hoursWorked: Number
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate hours worked before saving
AttendanceSchema.pre('save', function(this: IAttendance) {
  if (this.checkIn && this.checkOut) {
    const diffTime = this.checkOut.getTime() - this.checkIn.getTime();
    this.hoursWorked = Math.round((diffTime / (1000 * 60 * 60)) * 100) / 100;
  }
});

// Compound index for unique employee-date combination
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);