// Employee types
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'terminated';
  managerId?: number;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  manager?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
  status?: 'active' | 'inactive' | 'terminated';
  managerId?: number;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  password: string;
  confirmPassword: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    employee: Employee;
  };
}

// Leave Request types
export interface LeaveRequest {
  _id: string;
  employeeId: number;
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approverId?: number;
  approverComments?: string;
  attachments?: string[];
  daysRequested: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestInput {
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  reason: string;
}

// Attendance types
export interface Attendance {
  _id: string;
  employeeId: number;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'holiday';
  notes?: string;
  location?: string;
  isRemote: boolean;
  hoursWorked?: number;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
  results?: number;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
  };
}

export interface ApiError {
  status: string;
  message: string;
  error?: any;
}

// Dashboard types
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaveRequests: number;
  todayAttendance: number;
  departments: Array<{
    name: string;
    count: number;
  }>;
}