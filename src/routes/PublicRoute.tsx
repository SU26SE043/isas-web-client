import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/stores/authStore';

export const PublicRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // If already authenticated, redirect away from public routes (like login/register)
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
