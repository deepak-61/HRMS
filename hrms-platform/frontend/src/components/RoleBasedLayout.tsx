import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from './AdminLayout';
import HRLayout from './HRLayout';
import EmployeeLayout from './EmployeeLayout';

const RoleBasedLayout: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route to appropriate layout based on user role
  switch (user.role) {
    case 'admin':
      return <AdminLayout />;
    case 'hr_manager':
      return <HRLayout />;
    case 'employee':
      return <EmployeeLayout />;
    default:
      return <EmployeeLayout />; // Default to employee layout
  }
};

export default RoleBasedLayout;