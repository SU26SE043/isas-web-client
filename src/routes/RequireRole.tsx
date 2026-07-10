import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { UserRoleType } from '@/features/auth/types/auth.types';
import { ForbiddenPage } from '@/pages/errors/ErrorPages';

interface RequireRoleProps {
  roles: UserRoleType[];
}

export function RequireRole({ roles }: RequireRoleProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!roles.includes(user.role)) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
}
