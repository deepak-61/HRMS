export const getUserRole = (position: string): 'admin' | 'hr_manager' | 'employee' => {
  const lowerPosition = position.toLowerCase();
  
  if (lowerPosition === 'admin' || lowerPosition.includes('administrator')) {
    return 'admin';
  }
  
  if (lowerPosition.includes('hr') && (lowerPosition.includes('manager') || lowerPosition.includes('director'))) {
    return 'hr_manager';
  }
  
  return 'employee';
};

export const getRoleName = (role: 'admin' | 'hr_manager' | 'employee'): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'hr_manager':
      return 'HR Manager';
    case 'employee':
      return 'Employee';
    default:
      return 'Employee';
  }
};

export const getRoleColor = (role: 'admin' | 'hr_manager' | 'employee'): string => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'hr_manager':
      return 'bg-blue-100 text-blue-800';
    case 'employee':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const hasPermission = (
  userRole: 'admin' | 'hr_manager' | 'employee',
  requiredRole: 'admin' | 'hr_manager' | 'employee'
): boolean => {
  const roleHierarchy = {
    admin: 3,
    hr_manager: 2,
    employee: 1,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};