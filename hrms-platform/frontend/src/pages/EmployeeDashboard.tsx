import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import {
  ClockIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface EmployeeStats {
  leaveBalance: {
    annual: number;
    sick: number;
    personal: number;
  };
  pendingLeaveRequests: number;
  attendanceThisMonth: number;
  hoursWorkedThisWeek: number;
}

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<EmployeeStats>({
    leaveBalance: { annual: 21, sick: 10, personal: 5 },
    pendingLeaveRequests: 0,
    attendanceThisMonth: 22,
    hoursWorkedThisWeek: 38.5,
  });
  const [loading, setLoading] = useState(true);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);

  useEffect(() => {
    fetchEmployeeStats();
  }, []);

  const fetchEmployeeStats = async () => {
    try {
      setLoading(true);
      
      const [leaveRequestsResponse, leaveBalanceResponse] = await Promise.all([
        apiService.getMyLeaveRequests(1, 10),
        apiService.getLeaveBalance().catch(() => ({ balance: { annual: 21, sick: 10, personal: 5 } }))
      ]);

      const leaveRequests = leaveRequestsResponse?.data?.requests || [];
      const balance = leaveBalanceResponse?.balance || { annual: 21, sick: 10, personal: 5 };

      setStats({
        leaveBalance: balance,
        pendingLeaveRequests: leaveRequests.filter((req: any) => req.status === 'pending').length,
        attendanceThisMonth: 22, // Mock data
        hoursWorkedThisWeek: 38.5, // Mock data
      });
    } catch (error) {
      console.error('Error fetching employee stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await apiService.checkIn();
      setTodayCheckedIn(true);
      // Show success message
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const handleCheckOut = async () => {
    try {
      await apiService.checkOut();
      setTodayCheckedIn(false);
      // Show success message
    } catch (error) {
      console.error('Check-out failed:', error);
    }
  };

  const employeeStatCards = [
    {
      title: 'Annual Leave Balance',
      value: stats.leaveBalance.annual,
      unit: 'days',
      icon: CalendarIcon,
      color: 'bg-green-500',
      description: 'Available this year',
    },
    {
      title: 'Sick Leave Balance',
      value: stats.leaveBalance.sick,
      unit: 'days',
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      description: 'Available this year',
    },
    {
      title: 'Attendance This Month',
      value: stats.attendanceThisMonth,
      unit: 'days',
      icon: CheckCircleIcon,
      color: 'bg-purple-500',
      description: 'Out of 23 working days',
    },
    {
      title: 'Hours This Week',
      value: stats.hoursWorkedThisWeek,
      unit: 'hrs',
      icon: ClockIcon,
      color: 'bg-indigo-500',
      description: 'Target: 40 hours',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Employee Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-5">
                <h1 className="text-2xl font-bold text-white">
                  Welcome, {user?.firstName}!
                </h1>
                <p className="mt-1 text-green-100">
                  {user?.position} • {user?.department} Department
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {!todayCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                >
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Check In
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-md text-white bg-transparent hover:bg-white hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Check Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employee Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {employeeStatCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${card.color} p-3 rounded-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.title}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {card.value}
                        </div>
                        <div className="ml-2 text-sm font-medium text-gray-500">
                          {card.unit}
                        </div>
                      </dd>
                      <dd className="text-sm text-gray-600 mt-1">
                        {card.description}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Employee Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Self Service Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Self Service
            </h3>
            <div className="space-y-3">
              <button className="w-full inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Request Leave
              </button>
              <button className="w-full inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <ClockIcon className="h-4 w-4 mr-2" />
                View Timesheet
              </button>
              <button className="w-full inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <UserIcon className="h-4 w-4 mr-2" />
                Update Profile
              </button>
              <button className="w-full inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <CalendarIcon className="h-4 w-4 mr-2" />
                View Pay Stubs
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              My Recent Activity
            </h3>
            <div className="space-y-3">
              {stats.pendingLeaveRequests > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="text-sm font-medium text-gray-900">
                      {stats.pendingLeaveRequests} Pending Leave Request{stats.pendingLeaveRequests > 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                    Pending
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    Checked in today
                  </span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  9:15 AM
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-blue-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    Performance review scheduled
                  </span>
                </div>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  Next Week
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balance Details */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Leave Balance Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{stats.leaveBalance.annual}</div>
              <div className="text-sm text-gray-600 mt-1">Annual Leave</div>
              <div className="text-xs text-gray-500 mt-1">Out of 21 days</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{stats.leaveBalance.sick}</div>
              <div className="text-sm text-gray-600 mt-1">Sick Leave</div>
              <div className="text-xs text-gray-500 mt-1">Out of 10 days</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{stats.leaveBalance.personal}</div>
              <div className="text-sm text-gray-600 mt-1">Personal Leave</div>
              <div className="text-xs text-gray-500 mt-1">Out of 5 days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;