import type { RouteObject } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { RouteGroupPlaceholder } from '@/routes/RouteGroupPlaceholder';
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
            ],
          },
        ],
      },
    ],
  },
];
