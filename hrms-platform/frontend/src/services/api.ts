import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '../types';

class ApiService {
  private employeeService: AxiosInstance;
  private hrOperationsService: AxiosInstance;

  constructor() {
    // Employee Service API
    this.employeeService = axios.create({
      baseURL: process.env.REACT_APP_EMPLOYEE_SERVICE_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // HR Operations Service API
    this.hrOperationsService = axios.create({
      baseURL: process.env.REACT_APP_HR_OPERATIONS_SERVICE_URL || 'http://localhost:3002/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptors to add auth token
    [this.employeeService, this.hrOperationsService].forEach(service => {
      service.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Response interceptors for error handling
      service.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      );
    });
  }

  // Helper method to handle API responses
  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (response.data.status === 'success') {
      return response.data.data as T;
    }
    throw new Error(response.data.message || 'API request failed');
  }

  // Helper method to handle API errors
  private handleError(error: any): never {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.message) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred');
  }

  // Employee Service endpoints
  async login(email: string, password: string) {
    try {
      const response = await this.employeeService.post('/auth/login', { email, password });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async register(userData: any) {
    try {
      const response = await this.employeeService.post('/auth/register', userData);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.employeeService.get('/auth/me');
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAllEmployees(page = 1, limit = 10, department?: string) {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (department) params.append('department', department);
      
      const response = await this.employeeService.get(`/employees?${params}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getEmployee(id: number) {
    try {
      const response = await this.employeeService.get(`/employees/${id}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createEmployee(employeeData: any) {
    try {
      const response = await this.employeeService.post('/employees', employeeData);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateEmployee(id: number, employeeData: any) {
    try {
      const response = await this.employeeService.patch(`/employees/${id}`, employeeData);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteEmployee(id: number) {
    try {
      const response = await this.employeeService.delete(`/employees/${id}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // HR Operations Service endpoints
  async getMyLeaveRequests(page = 1, limit = 10) {
    try {
      const response = await this.hrOperationsService.get(`/leave/requests?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAllLeaveRequests(page = 1, limit = 10, status?: string) {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (status) params.append('status', status);
      
      const response = await this.hrOperationsService.get(`/leave/requests/all?${params}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createLeaveRequest(leaveData: any) {
    try {
      const response = await this.hrOperationsService.post('/leave/requests', leaveData);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateLeaveRequest(id: string, updateData: any) {
    try {
      const response = await this.hrOperationsService.patch(`/leave/requests/${id}`, updateData);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getLeaveBalance(employeeId?: number) {
    try {
      const url = employeeId ? `/leave/balance/${employeeId}` : '/leave/balance';
      const response = await this.hrOperationsService.get(url);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async checkIn(location?: string, isRemote = false) {
    try {
      const response = await this.hrOperationsService.post('/attendance/checkin', { location, isRemote });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async checkOut() {
    try {
      const response = await this.hrOperationsService.post('/attendance/checkout');
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMyAttendance(page = 1, limit = 10, startDate?: string, endDate?: string) {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await this.hrOperationsService.get(`/attendance/my?${params}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAllAttendance(page = 1, limit = 10, date?: string) {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (date) params.append('date', date);
      
      const response = await this.hrOperationsService.get(`/attendance/all?${params}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAttendanceReport(startDate: string, endDate: string, employeeIds?: number[]) {
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (employeeIds && employeeIds.length > 0) {
        params.append('employeeIds', employeeIds.join(','));
      }
      
      const response = await this.hrOperationsService.get(`/attendance/report?${params}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const apiService = new ApiService();
export default apiService;