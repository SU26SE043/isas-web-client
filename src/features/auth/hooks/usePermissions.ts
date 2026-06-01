import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { Permission, UserRole } from '../types/auth.types';
import { ROLE_PERMISSIONS } from '../utils/rolePermissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const userPermissions = useMemo(() => {
    if (!user) return [];
    
    // Combine role-based permissions with user-specific permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const userSpecificPermissions = user.permissions || [];
    
    // Merge and deduplicate permissions
    return [...new Set([...rolePermissions, ...userSpecificPermissions])];
  }, [user]);

  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isAdmin = (): boolean => {
    return hasRole(UserRole.ADMIN);
  };

  const isHR = (): boolean => {
    return hasRole(UserRole.HR);
  };

  const isInterviewer = (): boolean => {
    return hasRole(UserRole.INTERVIEWER);
  };

  const isCandidate = (): boolean => {
    return hasRole(UserRole.CANDIDATE);
  };

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isAdmin,
    isHR,
    isInterviewer,
    isCandidate,
  };
};