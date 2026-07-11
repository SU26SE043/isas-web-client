import { useRoutes } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { useUnauthorizedHandler } from '@/shared/api';
import { adminRoutes } from './groups/adminRoutes';
import { authRoutes } from './groups/authRoutes';
import { candidateRoutes } from './groups/candidateRoutes';
import { interviewRoutes } from './groups/interviewRoutes';
import { enterpriseRoutes } from './groups/enterpriseRoutes';
import { publicRoutes } from './groups/publicRoutes';

export function AppRouter() {
  useUnauthorizedHandler();

  return useRoutes([
    {
      element: <RootLayout />,
      children: [...publicRoutes, ...authRoutes, ...candidateRoutes, ...interviewRoutes, ...enterpriseRoutes, ...adminRoutes],
    },
  ]);
}
