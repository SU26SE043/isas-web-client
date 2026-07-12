import type { RouteObject } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { RouteGroupPlaceholder } from '@/routes/RouteGroupPlaceholder';
import { HelpPage } from '@/features/engagement/pages/HelpPage';
import { NotificationsPage } from '@/features/engagement/pages/NotificationsPage';
import { SettingsPage } from '@/features/engagement/pages/SettingsPage';
import { SupportPage } from '@/features/engagement/pages/SupportPage';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireRole } from '@/routes/RequireRole';
import { UserRole } from '@/features/auth/types/auth.types';

export const adminRoutes: RouteObject[] = [
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole roles={[UserRole.ADMIN]} />,
        children: [
          {
            path: '/admin',
            element: <MainLayout />,
            children: [
              { index: true, element: <RouteGroupPlaceholder titleKey="route.adminShell" /> },
              { path: 'users', element: <RouteGroupPlaceholder titleKey="route.adminShell" /> },
              { path: 'notifications', element: <NotificationsPage scope="admin" /> },
              { path: 'settings', element: <SettingsPage scope="admin" /> },
              { path: 'help', element: <HelpPage scope="admin" /> },
              { path: 'support', element: <SupportPage scope="admin" /> },
            ],
          },
        ],
      },
    ],
  },
];
