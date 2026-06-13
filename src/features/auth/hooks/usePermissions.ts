import { UserRole } from '../types/auth.types';
import { useAuth } from './useAuth';

export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isAdmin = (): boolean => hasRole(UserRole.ADMIN);
  const isHR = (): boolean => hasRole(UserRole.HR);
  const isInterviewer = (): boolean => hasRole(UserRole.INTERVIEWER);
  const isCandidate = (): boolean => hasRole(UserRole.CANDIDATE);

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isHR,
    isInterviewer,
    isCandidate,
    userRole: user?.role ?? null,
  };
};
