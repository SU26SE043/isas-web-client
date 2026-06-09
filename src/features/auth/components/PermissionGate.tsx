import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Permission, UserRole } from '../types/auth.types';

interface PermissionGateProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // true = require ALL permissions/roles, false = require ANY
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallback = null,
  requireAll = false,
}) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission, hasRole, hasAnyRole } = usePermissions();

  // Check permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
    
    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  // Check roles
  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireAll
      ? requiredRoles.every(role => hasRole(role))
      : hasAnyRole(requiredRoles);
    
    if (!hasRequiredRoles) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <PermissionGate requiredRoles={[UserRole.ADMIN]} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const HROnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <PermissionGate requiredRoles={[UserRole.HR]} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const InterviewerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <PermissionGate requiredRoles={[UserRole.INTERVIEWER]} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const StaffOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <PermissionGate requiredRoles={[UserRole.ADMIN, UserRole.HR, UserRole.INTERVIEWER]} fallback={fallback}>
    {children}
  </PermissionGate>
);