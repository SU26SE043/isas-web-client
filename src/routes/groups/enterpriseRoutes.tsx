import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { EmployerDashboardLayout } from '@/layouts/EmployerDashboardLayout';
import { CompanyProfilePage } from '@/features/employer/pages/CompanyProfilePage';
import { CompanyVerificationPage } from '@/features/employer/pages/CompanyVerificationPage';
import { EmployerDashboardPage } from '@/features/employer/pages/EmployerDashboardPage';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireRole } from '@/routes/RequireRole';
import { UserRole } from '@/features/auth/types/auth.types';

export const enterpriseRoutes: RouteObject[] = [
  { path: '/enterprise', element: <Navigate to="/employer/dashboard" replace /> },
  { path: '/enterprise/dashboard', element: <Navigate to="/employer/dashboard" replace /> },
  { path: '/enterprise/company', element: <Navigate to="/employer/company" replace /> },
  { path: '/enterprise/company/verify', element: <Navigate to="/employer/company/verify" replace /> },
  { path: '/enterprise/*', element: <Navigate to="/employer/dashboard" replace /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole roles={[UserRole.HR, UserRole.ORGANIZE, UserRole.ADMIN]} />,
        children: [
          {
            path: '/employer',
            element: <EmployerDashboardLayout />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: 'dashboard', element: <EmployerDashboardPage /> },
              { path: 'company', element: <CompanyProfilePage /> },
              { path: 'company/verify', element: <CompanyVerificationPage /> },
            ],
          },
        ],
      },
    ],
  },
];
