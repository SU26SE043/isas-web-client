import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { UserRole } from '../types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireAuth?: boolean;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireAuth = true,
  fallbackPath = '/',
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasAnyRole } = usePermissions();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

 

  // Check roles
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Không có quyền truy cập</h2>
          <p className="text-slate-600 mb-6">Vai trò của bạn không được phép truy cập trang này.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-brand-green text-white px-6 py-2 rounded-lg hover:bg-brand-green/90 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};