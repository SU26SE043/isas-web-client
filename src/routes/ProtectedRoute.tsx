import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/stores/authStore';
import { UserRole } from '../features/auth/types/auth.types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // If not authenticated, redirect to home/login
  if (!isAuthenticated) {
    // You can redirect to a specific login route if you have one, e.g., '/login'
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If authenticated but role is not allowed, redirect to home/unauthorized
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
