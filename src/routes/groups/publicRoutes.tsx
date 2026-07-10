import type { RouteObject } from 'react-router-dom';
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { HomePage } from '@/features/home/pages/HomePage';
import { RouteGroupPlaceholder } from '@/routes/RouteGroupPlaceholder';
import { ForbiddenPage, MaintenancePage, NotFoundPage, ServerErrorPage } from '@/pages/errors/ErrorPages';
import { ComponentHarnessPage } from '@/pages/dev/ComponentHarnessPage';

const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: 'dev',
        element: <DashboardLayout />,
        children: [{ path: 'components', element: <ComponentHarnessPage /> }],
      },
    ]
  : [];

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <MarketingLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'pricing', element: <RouteGroupPlaceholder titleKey="route.authShell" /> },
      { path: 'terms', element: <RouteGroupPlaceholder titleKey="route.authShell" /> },
      { path: 'privacy', element: <RouteGroupPlaceholder titleKey="route.authShell" /> },
      { path: 'maintenance', element: <MaintenancePage /> },
      ...devRoutes,
    ],
  },
  { path: '/403', element: <ForbiddenPage /> },
  { path: '/404', element: <NotFoundPage /> },
  { path: '/500', element: <ServerErrorPage /> },
  { path: '*', element: <NotFoundPage /> },
];
