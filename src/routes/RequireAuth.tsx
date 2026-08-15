import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { RouteLoadingFallback } from '@/components/RouteLoadingFallback';

export function RequireAuth() {
  const { hasHydrated, isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!hasHydrated) return <RouteLoadingFallback />;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
