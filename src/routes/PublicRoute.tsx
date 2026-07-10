import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/stores/authStore';
import { getPostLoginPath } from '@/features/auth/utils/getPostLoginPath';

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to={getPostLoginPath(user.role)} replace />;
  }

  return <Outlet />;
};
