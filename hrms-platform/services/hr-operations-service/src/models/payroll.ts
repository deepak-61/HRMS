import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// Zod schema for validation
export const payrollSchema = z.object({
  employeeId: z.number().positive('Employee ID is required'),
  payPeriodStart: z.string().datetime('Invalid pay period start date'),
  payPeriodEnd: z.string().datetime('Invalid pay period end date'),
  baseSalary: z.number().positive('Base salary must be positive'),
  overtimeHours: z.number().min(0, 'Overtime hours cannot be negative').default(0),
  overtimeRate: z.number().min(0, 'Overtime rate cannot be negative').default(0),
  bonuses: z.number().min(0, 'Bonuses cannot be negative').default(0),
  deductions: z.object({
    tax: z.number().min(0).default(0),
    insurance: z.number().min(0).default(0),
    retirement: z.number().min(0).default(0),
    other: z.number().min(0).default(0)
  }).default({}),
  status: z.enum(['draft', 'processed', 'paid', 'cancelled']).default('draft'),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().optional()
});

export const payrollUpdateSchema = payrollSchema.partial();

export type PayrollInput = z.infer<typeof payrollSchema>;
export type PayrollUpdate = z.infer<typeof payrollUpdateSchema>;

// Mongoose schema
export interface IPayroll extends Document {
  employeeId: number;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  bonuses: number;
  deductions: {
    tax: number;
    insurance: number;
    retirement: number;
    other: number;
  };
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  status: 'draft' | 'processed' | 'paid' | 'cancelled';
  paymentDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayrollSchema = new Schema<IPayroll>({
  employeeId: { type: Number, required: true, index: true },
  payPeriodStart: { type: Date, required: true },
  payPeriodEnd: { type: Date, required: true },
  baseSalary: { type: Number, required: true, min: 0 },
  overtimeHours: { type: Number, default: 0, min: 0 },
  overtimeRate: { type: Number, default: 0, min: 0 },
  bonuses: { type: Number, default: 0, min: 0 },
  deductions: {
    tax: { type: Number, default: 0, min: 0 },
    insurance: { type: Number, default: 0, min: 0 },
    retirement: { type: Number, default: 0, min: 0 },
    other: { type: Number, default: 0, min: 0 }
  },
  grossPay: { type: Number, required: true },
  totalDeductions: { type: Number, required: true },
  netPay: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'processed', 'paid', 'cancelled'],
    default: 'draft'
  },
  paymentDate: Date,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate pay amounts before saving
PayrollSchema.pre('save', function(this: IPayroll) {
  // Calculate gross pay
  const overtimePay = this.overtimeHours * this.overtimeRate;
  this.grossPay = this.baseSalary + overtimePay + this.bonuses;
  
  // Calculate total deductions
  this.totalDeductions = this.deductions.tax + this.deductions.insurance + 
                        this.deductions.retirement + this.deductions.other;
  
  // Calculate net pay
  this.netPay = this.grossPay - this.totalDeductions;
});

// Compound index for unique employee-pay period combination
PayrollSchema.index({ employeeId: 1, payPeriodStart: 1, payPeriodEnd: 1 }, { unique: true });

export const Payroll = mongoose.model<IPayroll>('Payroll', PayrollSchema);