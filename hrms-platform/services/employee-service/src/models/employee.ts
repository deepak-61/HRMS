import { z } from 'zod';

// Employee schema for validation
export const employeeSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  department: z.string().min(2, 'Department is required'),
  position: z.string().min(2, 'Position is required'),
  salary: z.number().positive('Salary must be positive'),
  hireDate: z.string().datetime('Invalid hire date format'),
  status: z.enum(['active', 'inactive', 'terminated']).default('active'),
  managerId: z.number().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default('USA')
  }).optional()
});

export const employeeUpdateSchema = employeeSchema.partial();

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = employeeSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// TypeScript types
export type Employee = z.infer<typeof employeeSchema> & {
  id: number;
  createdAt: Date;
  updatedAt: Date;
};

export type EmployeeInput = z.infer<typeof employeeSchema>;
export type EmployeeUpdate = z.infer<typeof employeeUpdateSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;