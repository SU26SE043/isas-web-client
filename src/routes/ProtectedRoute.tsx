import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/stores/authStore';
import type { UserRoleType } from '../features/auth/types/auth.types';

interface ProtectedRouteProps {
  allowedRoles?: UserRoleType[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center surface-base px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-4">Không có quyền truy cập</h2>
          <p className="text-muted-foreground mb-6">
            Vai trò của bạn không được phép truy cập trang này.
          </p>
          <button type="button" onClick={() => window.history.back()} className="btn-primary px-6 py-2">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
