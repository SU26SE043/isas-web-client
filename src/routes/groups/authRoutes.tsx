import type { RouteObject } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { PublicRoute } from '@/routes/PublicRoute';

export const authRoutes: RouteObject[] = [
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: '/register', element: <RegisterPage /> }],
      },
    ],
  },
];
