import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { getRoleName, getRoleColor } from '../utils/roleUtils';

// Import pages
import EmployeeDashboard from '../pages/EmployeeDashboard';
import LeaveRequests from '../pages/LeaveRequests';
import Attendance from '../pages/Attendance';
import Profile from '../pages/Profile';

const EmployeeLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'My Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'My Leave Requests', href: '/leave-requests', icon: DocumentTextIcon },
    { name: 'My Attendance', href: '/attendance', icon: ClockIcon },
    { name: 'Pay Stubs', href: '/paystubs', icon: CurrencyDollarIcon },
    { name: 'Company Calendar', href: '/calendar', icon: CalendarIcon },
    { name: 'My Profile', href: '/profile', icon: UserIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCurrentPath = (path: string) => location.pathname === path;

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} isCurrentPath={isCurrentPath} userRole="employee" />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={navigation} isCurrentPath={isCurrentPath} userRole="employee" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="flex items-center h-16">
                    <h1 className="text-2xl font-semibold text-gray-900">Employee Self-Service Portal</h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user!.role)}`}>
                  {getRoleName(user!.role)}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-gray-500">{user?.department}</span>
                <button
                  onClick={handleLogout}
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Routes>
                <Route path="/dashboard" element={<EmployeeDashboard />} />
                <Route path="/leave-requests" element={<LeaveRequests />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/paystubs" element={<div className="p-8 text-center text-gray-500">Pay Stubs - Coming Soon</div>} />
                <Route path="/calendar" element={<div className="p-8 text-center text-gray-500">Company Calendar - Coming Soon</div>} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

interface SidebarContentProps {
  navigation: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  isCurrentPath: (path: string) => boolean;
  userRole: string;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ navigation, isCurrentPath, userRole }) => {
  const roleColors = {
    admin: 'bg-red-500',
    hr_manager: 'bg-blue-500',
    employee: 'bg-green-500'
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`h-8 w-8 ${roleColors[userRole as keyof typeof roleColors]} rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">E</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">HRMS Portal</p>
              <p className="text-xs font-medium text-gray-500">Employee Self-Service</p>
            </div>
          </div>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  isCurrentPath(item.href)
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium border-l-4`}
              >
                <Icon className="mr-3 h-6 w-6" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default EmployeeLayout;