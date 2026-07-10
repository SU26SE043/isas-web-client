import { useRoutes } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { useUnauthorizedHandler } from '@/shared/api';
import { adminRoutes } from './groups/adminRoutes';
import { authRoutes } from './groups/authRoutes';
import { candidateRoutes } from './groups/candidateRoutes';
import { employerRoutes } from './groups/employerRoutes';
import { publicRoutes } from './groups/publicRoutes';

export function AppRouter() {
  useUnauthorizedHandler();

  return useRoutes([
    {
      element: <RootLayout />,
      children: [...publicRoutes, ...authRoutes, ...candidateRoutes, ...employerRoutes, ...adminRoutes],
    },
  ]);
}
