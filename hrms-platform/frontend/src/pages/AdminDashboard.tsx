import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import {
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  CogIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface AdminStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaveRequests: number;
  todayAttendance: number;
  totalDepartments: number;
  systemHealth: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaveRequests: 0,
    todayAttendance: 0,
    totalDepartments: 0,
    systemHealth: 'Good',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      
      const [employeesResponse, leaveRequestsResponse] = await Promise.all([
        apiService.getAllEmployees(1, 100),
        apiService.getAllLeaveRequests(1, 100)
      ]);

      const employees = employeesResponse?.data?.employees || [];
      const leaveRequests = leaveRequestsResponse?.data?.requests || [];
      const departments = new Set(employees.map((emp: any) => emp.department)).size;

      setStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter((emp: any) => emp.status === 'active').length,
        pendingLeaveRequests: leaveRequests.filter((req: any) => req.status === 'pending').length,
        todayAttendance: Math.floor(employees.length * 0.85),
        totalDepartments: departments,
        systemHealth: 'Excellent',
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminStatCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: '+5.2%',
      changeType: 'increase',
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      change: '+2.1%',
      changeType: 'increase',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingLeaveRequests,
      icon: DocumentTextIcon,
      color: 'bg-yellow-500',
      change: '-12%',
      changeType: 'decrease',
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance,
      icon: ClockIcon,
      color: 'bg-purple-500',
      change: '+3.8%',
      changeType: 'increase',
    },
    {
      title: 'Departments',
      value: stats.totalDepartments,
      icon: ChartBarIcon,
      color: 'bg-indigo-500',
      change: 'Stable',
      changeType: 'neutral',
    },
    {
      title: 'System Health',
      value: stats.systemHealth,
      icon: CogIcon,
      color: 'bg-emerald-500',
      change: '99.9%',
      changeType: 'increase',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Welcome Section */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CogIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-5">
              <h1 className="text-2xl font-bold text-white">
                Administrator Dashboard
              </h1>
              <p className="mt-1 text-red-100">
                Welcome back, {user?.firstName}! You have full system access and control.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {adminStatCards.map((card) => {
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
                          {typeof card.value === 'number' ? card.value : card.value}
                        </div>
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            card.changeType === 'increase'
                              ? 'text-green-600'
                              : card.changeType === 'decrease'
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {card.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              System Management
            </h3>
            <div className="space-y-3">
              <button className="w-full inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                <CogIcon className="h-4 w-4 mr-2" />
                System Settings
              </button>
              <button className="w-full inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                <UsersIcon className="h-4 w-4 mr-2" />
                Manage All Employees
              </button>
              <button className="w-full inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Advanced Reports
              </button>
              <button className="w-full inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Audit Logs
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Admin Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <UsersIcon className="h-4 w-4 mr-2" />
                Add New Employee
              </button>
              <button className="w-full inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Bulk Approve Leaves
              </button>
              <button className="w-full inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <ClockIcon className="h-4 w-4 mr-2" />
                Generate Payroll
              </button>
              <button className="w-full inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Export All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent System Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent System Activity
          </h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {[
                { action: 'New employee registered', user: 'Sarah Wilson', time: '10 minutes ago', type: 'success' },
                { action: 'Leave request approved', user: 'Mike Johnson', time: '1 hour ago', type: 'info' },
                { action: 'System backup completed', user: 'System', time: '2 hours ago', type: 'success' },
                { action: 'Payroll processed', user: 'Jane Smith', time: '3 hours ago', type: 'info' },
              ].map((activity, index) => (
                <li key={index}>
                  <div className="relative pb-8">
                    {index !== 3 && (
                      <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" />
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className={`relative px-1`}>
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
                          <p className="mt-0.5 text-sm text-gray-500">by {activity.user}</p>
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

export default AdminDashboard;