import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { EmployerDashboardLayout } from '@/layouts/EmployerDashboardLayout';
import { CampaignDetailPage } from '@/features/employer-campaigns/pages/CampaignDetailPage';
import { CampaignListPage } from '@/features/employer-campaigns/pages/CampaignListPage';
import { CampaignWizardPage } from '@/features/employer-campaigns/pages/CampaignWizardPage';
import { CompanyProfilePage } from '@/features/employer/pages/CompanyProfilePage';
import { CompanyVerificationPage } from '@/features/employer/pages/CompanyVerificationPage';
import { EmployerDashboardPage } from '@/features/employer/pages/EmployerDashboardPage';
import { CandidatePipelinePage } from '@/features/employer-analytics/pages/CandidatePipelinePage';
import { EmployerAnalyticsPage } from '@/features/employer-analytics/pages/EmployerAnalyticsPage';
import { EmployerCandidateProfilePage } from '@/features/employer-analytics/pages/EmployerCandidateProfilePage';
import { EmployerCandidateReportPage } from '@/features/employer-analytics/pages/EmployerCandidateReportPage';
import { EmployerBillingPage } from '@/features/employer-billing/pages/EmployerBillingPage';
import { EmployerInvoicesPage } from '@/features/employer-billing/pages/EmployerInvoicesPage';
import { EmployerSubscriptionPage } from '@/features/employer-billing/pages/EmployerSubscriptionPage';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireRole } from '@/routes/RequireRole';
import { UserRole } from '@/features/auth/types/auth.types';

export const enterpriseRoutes: RouteObject[] = [
  { path: '/enterprise', element: <Navigate to="/employer/dashboard" replace /> },
  { path: '/enterprise/dashboard', element: <Navigate to="/employer/dashboard" replace /> },
  { path: '/enterprise/campaigns', element: <Navigate to="/employer/campaigns" replace /> },
  { path: '/enterprise/company', element: <Navigate to="/employer/company" replace /> },
  { path: '/enterprise/company/verify', element: <Navigate to="/employer/company/verify" replace /> },
  { path: '/enterprise/analytics', element: <Navigate to="/employer/analytics" replace /> },
  { path: '/enterprise/subscription', element: <Navigate to="/employer/subscription" replace /> },
  { path: '/enterprise/billing', element: <Navigate to="/employer/billing" replace /> },
  { path: '/enterprise/invoices', element: <Navigate to="/employer/invoices" replace /> },
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
              { path: 'campaigns', element: <CampaignListPage /> },
              { path: 'campaigns/new', element: <CampaignWizardPage /> },
              { path: 'campaigns/:id/candidates', element: <CandidatePipelinePage /> },
              { path: 'campaigns/:id/edit', element: <CampaignWizardPage /> },
              { path: 'campaigns/:id', element: <CampaignDetailPage /> },
              { path: 'candidates/:id', element: <EmployerCandidateProfilePage /> },
              { path: 'candidates/:id/report', element: <EmployerCandidateReportPage /> },
              { path: 'analytics', element: <EmployerAnalyticsPage /> },
              {
                element: <RequireRole roles={[UserRole.ORGANIZE, UserRole.ADMIN]} />,
                children: [
                  { path: 'subscription', element: <EmployerSubscriptionPage /> },
                  { path: 'billing', element: <EmployerBillingPage /> },
                  { path: 'invoices', element: <EmployerInvoicesPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
