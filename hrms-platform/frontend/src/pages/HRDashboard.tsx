import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import {
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface HRStats {
  totalEmployees: number;
  pendingLeaveRequests: number;
  approvedLeavesToday: number;
  attendanceRate: number;
  newHiresThisMonth: number;
  upcomingLeaves: number;
}

const HRDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<HRStats>({
    totalEmployees: 0,
    pendingLeaveRequests: 0,
    approvedLeavesToday: 0,
    attendanceRate: 0,
    newHiresThisMonth: 0,
    upcomingLeaves: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHRStats();
  }, []);

  const fetchHRStats = async () => {
    try {
      setLoading(true);
      
      const [employeesResponse, leaveRequestsResponse] = await Promise.all([
        apiService.getAllEmployees(1, 100),
        apiService.getAllLeaveRequests(1, 100)
      ]);

      const employees = employeesResponse?.data?.employees || [];
      const leaveRequests = leaveRequestsResponse?.data?.requests || [];
      
      const currentMonth = new Date().getMonth();
      const newHires = employees.filter((emp: any) => 
        new Date(emp.hireDate).getMonth() === currentMonth
      ).length;

      setStats({
        totalEmployees: employees.length,
        pendingLeaveRequests: leaveRequests.filter((req: any) => req.status === 'pending').length,
        approvedLeavesToday: leaveRequests.filter((req: any) => req.status === 'approved').length,
        attendanceRate: 87.5, // Mock data
        newHiresThisMonth: newHires,
        upcomingLeaves: leaveRequests.filter((req: any) => 
          req.status === 'approved' && new Date(req.startDate) > new Date()
        ).length,
      });
    } catch (error) {
      console.error('Error fetching HR stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const hrStatCards = [
    {
      title: 'Team Members',
      value: stats.totalEmployees,
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: `+${stats.newHiresThisMonth} this month`,
      changeType: 'increase',
    },
    {
      title: 'Pending Leave Requests',
      value: stats.pendingLeaveRequests,
      icon: ExclamationTriangleIcon,
      color: 'bg-yellow-500',
      change: 'Needs Review',
      changeType: 'neutral',
    },
    {
      title: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      change: '+2.3%',
      changeType: 'increase',
    },
    {
      title: 'Upcoming Leaves',
      value: stats.upcomingLeaves,
      icon: CalendarIcon,
      color: 'bg-purple-500',
      change: 'Next 30 days',
      changeType: 'neutral',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HR Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-5">
              <h1 className="text-2xl font-bold text-white">
                HR Manager Dashboard
              </h1>
              <p className="mt-1 text-blue-100">
                Welcome back, {user?.firstName}! Manage your team and HR operations efficiently.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* HR Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {hrStatCards.map((card) => {
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
                      </dd>
                      <dd className="text-sm text-gray-600 mt-1">
                        {card.change}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* HR Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Pending Actions
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    {stats.pendingLeaveRequests} Leave Requests
                  </span>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Review
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-blue-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    Attendance Reports
                  </span>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Generate
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    Performance Reviews
                  </span>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* HR Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              HR Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <UsersIcon className="h-4 w-4 mr-2" />
                Add New Employee
              </button>
              <button className="w-full inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Manage Leave Policies
              </button>
              <button className="w-full inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <ClockIcon className="h-4 w-4 mr-2" />
                Attendance Reports
              </button>
              <button className="w-full inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Interviews
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Team Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Team Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</div>
              <div className="text-sm text-gray-600">Total Employees</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.newHiresThisMonth}</div>
              <div className="text-sm text-gray-600">New Hires This Month</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.upcomingLeaves}</div>
              <div className="text-sm text-gray-600">Upcoming Leaves</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent HR Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent HR Activity
          </h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {[
                { action: 'Leave request approved', user: 'John Doe', time: '30 minutes ago', type: 'success' },
                { action: 'New employee onboarded', user: 'Sarah Wilson', time: '2 hours ago', type: 'info' },
                { action: 'Performance review completed', user: 'Mike Johnson', time: '4 hours ago', type: 'success' },
                { action: 'Leave policy updated', user: 'You', time: '1 day ago', type: 'info' },
              ].map((activity, index) => (
                <li key={index}>
                  <div className="relative pb-8">
                    {index !== 3 && (
                      <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" />
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          <CheckCircleIcon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">{activity.action}</span>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500">for {activity.user}</p>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          <time>{activity.time}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;