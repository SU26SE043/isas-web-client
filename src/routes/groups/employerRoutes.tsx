import type { RouteObject } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { RouteGroupPlaceholder } from '@/routes/RouteGroupPlaceholder';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireRole } from '@/routes/RequireRole';
import { UserRole } from '@/features/auth/types/auth.types';

export const employerRoutes: RouteObject[] = [
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole roles={[UserRole.HR, UserRole.ORGANIZE, UserRole.ADMIN]} />,
        children: [
          {
            path: '/employer',
            element: <MainLayout />,
            children: [
              { index: true, element: <RouteGroupPlaceholder titleKey="route.employerShell" /> },
              { path: 'campaigns', element: <RouteGroupPlaceholder titleKey="route.employerShell" /> },
            ],
          },
        ],
      },
    ],
  },
];
