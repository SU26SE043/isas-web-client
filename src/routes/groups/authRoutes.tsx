import type { RouteObject } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RouteGroupPlaceholder } from '@/routes/RouteGroupPlaceholder';

export const authRoutes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RouteGroupPlaceholder titleKey="route.authShell" /> },
  { path: '/forgot-password', element: <RouteGroupPlaceholder titleKey="route.authShell" /> },
];
