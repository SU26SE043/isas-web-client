import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { EmployerDashboardLayout } from '@/layouts/EmployerDashboardLayout';
import { CampaignDetailPage } from '@/features/employer-campaigns/pages/CampaignDetailPage';
import { CampaignListPage } from '@/features/employer-campaigns/pages/CampaignListPage';
import { CampaignWizardPage } from '@/features/employer-campaigns/pages/CampaignWizardPage';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireRole } from '@/routes/RequireRole';
import { UserRole } from '@/features/auth/types/auth.types';

export const enterpriseRoutes: RouteObject[] = [
  { path: '/enterprise', element: <Navigate to="/employer/campaigns" replace /> },
  { path: '/enterprise/dashboard', element: <Navigate to="/employer/campaigns" replace /> },
  { path: '/enterprise/campaigns', element: <Navigate to="/employer/campaigns" replace /> },
  { path: '/enterprise/*', element: <Navigate to="/employer/campaigns" replace /> },
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
              { index: true, element: <Navigate to="campaigns" replace /> },
              { path: 'campaigns', element: <CampaignListPage /> },
              { path: 'campaigns/new', element: <CampaignWizardPage /> },
              { path: 'campaigns/:id', element: <CampaignDetailPage /> },
              { path: 'campaigns/:id/edit', element: <CampaignWizardPage /> },
            ],
          },
        ],
      },
    ],
  },
];
