import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import {
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaveRequests: number;
  todayAttendance: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaveRequests: 0,
    todayAttendance: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch basic stats
      const [employeesResponse, leaveRequestsResponse] = await Promise.all([
        apiService.getAllEmployees(1, 100),
        user?.position?.toLowerCase().includes('hr') || user?.position?.toLowerCase() === 'admin'
          ? apiService.getAllLeaveRequests(1, 100)
          : apiService.getMyLeaveRequests(1, 10)
      ]);

      const employees = employeesResponse?.data?.employees || [];
      const leaveRequests = leaveRequestsResponse?.data?.requests || [];

      setStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter((emp: any) => emp.status === 'active').length,
        pendingLeaveRequests: leaveRequests.filter((req: any) => req.status === 'pending').length,
        todayAttendance: Math.floor(employees.length * 0.85), // Mock data
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: 1,
          type: 'leave_request',
          message: 'New leave request submitted',
          time: '2 hours ago',
          user: 'John Doe',
        },
        {
          id: 2,
          type: 'employee_joined',
          message: 'New employee onboarded',
          time: '1 day ago',
          user: 'Sarah Wilson',
        },
        {
          id: 3,
          type: 'attendance',
          message: 'Monthly attendance report generated',
          time: '2 days ago',
          user: 'System',
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: '+2.5%',
      changeType: 'increase',
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      change: '+1.2%',
      changeType: 'increase',
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaveRequests,
      icon: DocumentTextIcon,
      color: 'bg-yellow-500',
      change: '-5.4%',
      changeType: 'decrease',
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance,
      icon: ClockIcon,
      color: 'bg-purple-500',
      change: '+3.1%',
      changeType: 'increase',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening in your organization today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white overflow-hidden shadow rounded-lg">
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
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            card.changeType === 'increase'
                              ? 'text-green-600'
                              : 'text-red-600'
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

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Actions
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-3">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <ClockIcon className="h-4 w-4 mr-2" />
                Check In/Out
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Request Leave
              </button>
              {(user?.position?.toLowerCase().includes('hr') || user?.position?.toLowerCase() === 'admin') && (
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Add Employee
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
            <div className="mt-5 flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, index) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {index !== recentActivity.length - 1 && (
                        <span
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center">
                            <UsersIcon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">
                                {activity.user}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">
                              {activity.time}
                            </p>
                          </div>
                          <div className="mt-2 text-sm text-gray-700">
                            <p>{activity.message}</p>
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
    </div>
  );
};

export default Dashboard;