import type { RouteObject } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RouteGroupPlaceholder } from '@/routes/RouteGroupPlaceholder';

export const authRoutes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    element: <AuthLayout />,
    children: [
      { path: '/register', element: <RouteGroupPlaceholder titleKey="route.authShell" /> },
      { path: '/forgot-password', element: <RouteGroupPlaceholder titleKey="route.authShell" /> },
    ],
  },
];
