import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { RouteGroupPlaceholder } from '@/routes/RouteGroupPlaceholder';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireRole } from '@/routes/RequireRole';
import { UserRole } from '@/features/auth/types/auth.types';

export const enterpriseRoutes: RouteObject[] = [
  { path: '/employer', element: <Navigate to="/enterprise/dashboard" replace /> },
  { path: '/employer/campaigns', element: <Navigate to="/enterprise/campaigns" replace /> },
  { path: '/employer/*', element: <Navigate to="/enterprise/dashboard" replace /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole roles={[UserRole.HR, UserRole.ORGANIZE, UserRole.ADMIN]} />,
        children: [
          {
            path: '/enterprise',
            element: <MainLayout />,
            children: [
              { path: 'dashboard', element: <RouteGroupPlaceholder titleKey="route.enterpriseShell" /> },
              { path: 'campaigns', element: <RouteGroupPlaceholder titleKey="route.enterpriseShell" /> },
            ],
          },
        ],
      },
    ],
  },
];
