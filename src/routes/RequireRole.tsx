import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { RouteLoadingFallback } from '@/components/RouteLoadingFallback';
import type { UserRoleType } from '@/features/auth/types/auth.types';

interface RequireRoleProps {
  roles: UserRoleType[];
}

export function RequireRole({ roles }: RequireRoleProps) {
  const { hasHydrated, isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!hasHydrated) return <RouteLoadingFallback />;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}
