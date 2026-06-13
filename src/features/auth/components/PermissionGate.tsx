import React from 'react';
import { UserRole } from '../types/auth.types';

interface RoleGateProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // true = require ALL roles, false = require ANY
}

export const RoleGate: React.FC<RoleGateProps> = ({
  children,
  requiredRoles = [],
  fallback = null,
  requireAll = false,
}) => {
  // Replace with your actual user role context/hook
  const userRole: UserRole | null = null; // TODO: get user role from context/store

  if (!userRole) {
    return <>{fallback}</>;
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireAll
      ? requiredRoles.every(role => userRole === role)
      : requiredRoles.includes(userRole);

    if (!hasRequiredRoles) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <RoleGate requiredRoles={[UserRole.ADMIN]} fallback={fallback}>
    {children}
  </RoleGate>
);

export const HROnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <RoleGate requiredRoles={[UserRole.HR]} fallback={fallback}>
    {children}
  </RoleGate>
);

export const InterviewerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <RoleGate requiredRoles={[UserRole.INTERVIEWER]} fallback={fallback}>
    {children}
  </RoleGate>
);

export const StaffOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <RoleGate requiredRoles={[UserRole.ADMIN, UserRole.HR, UserRole.INTERVIEWER]} fallback={fallback}>
    {children}
  </RoleGate>
);
