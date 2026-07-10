import type { RouteObject } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { HomePage } from '@/features/home/pages/HomePage';
import { RouteGroupPlaceholder } from '@/routes/RouteGroupPlaceholder';

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'pricing', element: <RouteGroupPlaceholder titleKey="route.authShell" /> },
      { path: 'terms', element: <RouteGroupPlaceholder titleKey="route.authShell" /> },
      { path: 'privacy', element: <RouteGroupPlaceholder titleKey="route.authShell" /> },
    ],
  },
];
