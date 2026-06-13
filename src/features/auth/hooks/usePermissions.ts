import { useAuth } from './useAuth';
import { UserRole } from '../types/auth.types';
 

export const usePermissions = () => {
  const { user } = useAuth();

 

 

 

 

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
    hasRole,
    hasAnyRole,
    isAdmin,
    isHR,
    isInterviewer,
    isCandidate,
  };
};