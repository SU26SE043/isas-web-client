import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { EmployerDashboardLayout } from '@/layouts/EmployerDashboardLayout';
import { CampaignDetailPage } from '@/features/employer-campaigns/pages/CampaignDetailPage';
import { CampaignListPage } from '@/features/employer-campaigns/pages/CampaignListPage';
import { CampaignWizardPage } from '@/features/employer-campaigns/pages/CampaignWizardPage';
import { CampaignInvitePage } from '@/features/employer-campaigns/pages/CampaignInvitePage';
import { CampaignInviteCvPage } from '@/features/employer-campaigns/pages/CampaignInviteCvPage';
import { CampaignInviteEmailPage } from '@/features/employer-campaigns/pages/CampaignInviteEmailPage';
import { CampaignInviteResultPage } from '@/features/employer-campaigns/pages/CampaignInviteResultPage';
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
import { EmployerTeamPage } from '@/features/engagement/pages/EmployerTeamPage';
import { HelpPage } from '@/features/engagement/pages/HelpPage';
import { NotificationsPage } from '@/features/engagement/pages/NotificationsPage';
import { SettingsPage } from '@/features/engagement/pages/SettingsPage';
import { SupportPage } from '@/features/engagement/pages/SupportPage';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireRole } from '@/routes/RequireRole';
import { UserRole } from '@/features/auth/types/auth.types';

export const enterpriseRoutes: RouteObject[] = [
  { path: '/enterprise/dashboard', element: <Navigate to="/employer/dashboard" replace /> },
  { path: '/enterprise/campaigns', element: <Navigate to="/employer/campaigns" replace /> },
  { path: '/enterprise/company', element: <Navigate to="/employer/company" replace /> },
  { path: '/enterprise/company/verify', element: <Navigate to="/employer/company/verify" replace /> },
  { path: '/enterprise/analytics', element: <Navigate to="/employer/analytics" replace /> },
  { path: '/enterprise/subscription', element: <Navigate to="/employer/subscription" replace /> },
  { path: '/enterprise/billing', element: <Navigate to="/employer/billing" replace /> },
  { path: '/enterprise/invoices', element: <Navigate to="/employer/invoices" replace /> },
  { path: '/enterprise/notifications', element: <Navigate to="/employer/notifications" replace /> },
  { path: '/enterprise/settings', element: <Navigate to="/employer/settings" replace /> },
  { path: '/enterprise/team', element: <Navigate to="/employer/team" replace /> },
  { path: '/enterprise/*', element: <Navigate to="/employer/dashboard" replace /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole roles={[UserRole.HR_MEMBER, UserRole.ORG_ADMIN, UserRole.ADMIN]} />,
        children: [
          {
            path: '/employer',
            element: <EmployerDashboardLayout />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: 'dashboard', element: <EmployerDashboardPage /> },
              {
                element: <RequireRole roles={[UserRole.ORG_ADMIN, UserRole.ADMIN]} />,
                children: [
                  { path: 'company', element: <CompanyProfilePage /> },
                  { path: 'company/verify', element: <CompanyVerificationPage /> },
                ],
              },
              { path: 'campaigns', element: <CampaignListPage /> },
              { path: 'campaigns/new', element: <CampaignWizardPage /> },
              { path: 'campaigns/:id/candidates', element: <CandidatePipelinePage /> },
              { path: 'campaigns/:id/selection', element: <Navigate to="../invite" relative="path" replace /> },
              { path: 'campaigns/:id/invite', element: <CampaignInvitePage /> },
              { path: 'campaigns/:id/invite/cv', element: <CampaignInviteCvPage /> },
              { path: 'campaigns/:id/invite/email', element: <CampaignInviteEmailPage /> },
              { path: 'campaigns/:id/invite/result', element: <CampaignInviteResultPage /> },
              { path: 'campaigns/:id/edit', element: <CampaignWizardPage /> },
              { path: 'campaigns/:id', element: <CampaignDetailPage /> },
              { path: 'candidates/:id', element: <EmployerCandidateProfilePage /> },
              { path: 'candidates/:id/report', element: <EmployerCandidateReportPage /> },
              { path: 'analytics', element: <EmployerAnalyticsPage /> },
              { path: 'notifications', element: <NotificationsPage scope="employer" /> },
              { path: 'settings', element: <SettingsPage scope="employer" /> },
              { path: 'help', element: <HelpPage scope="employer" /> },
              { path: 'support', element: <SupportPage scope="employer" /> },
              {
                element: <RequireRole roles={[UserRole.ORG_ADMIN, UserRole.ADMIN]} />,
                children: [
                  { path: 'subscription', element: <EmployerSubscriptionPage /> },
                  { path: 'billing', element: <EmployerBillingPage /> },
                  { path: 'invoices', element: <EmployerInvoicesPage /> },
                  { path: 'team', element: <EmployerTeamPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
