import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { EmployerDashboardLayout } from '@/layouts/EmployerDashboardLayout';
import { CampaignDetailPage } from '@/features/employer-campaigns/pages/CampaignDetailPage';
import { CampaignResultDetailPage } from '@/features/employer-campaigns/pages/CampaignResultDetailPage';
import { CampaignListPage } from '@/features/employer-campaigns/pages/CampaignListPage';
import { CampaignWizardPage } from '@/features/employer-campaigns/pages/CampaignWizardPage';
import { CampaignInvitePage } from '@/features/employer-campaigns/pages/CampaignInvitePage';
import { CampaignInviteCvPage } from '@/features/employer-campaigns/pages/CampaignInviteCvPage';
import { CampaignInviteEmailPage } from '@/features/employer-campaigns/pages/CampaignInviteEmailPage';
import { CampaignInviteResultPage } from '@/features/employer-campaigns/pages/CampaignInviteResultPage';
import { CampaignWorkspaceRedirect } from '@/features/employer-campaigns/pages/CampaignWorkspaceRedirect';
import { EmployerDashboardPage } from '@/features/employer/pages/EmployerDashboardPage';
import { EmployerAnalyticsPage } from '@/features/employer-analytics/pages/EmployerAnalyticsPage';
import { BillingShell } from '@/features/employer-billing/components/live/BillingShell';
import { EmployerInvoicesPage } from '@/features/employer-billing/pages/EmployerInvoicesPage';
import { EmployerBillingOverviewPage } from '@/features/employer-billing/pages/live/EmployerBillingOverviewPage';
import { EmployerPackagesPage } from '@/features/employer-billing/pages/live/EmployerPackagesPage';
import { EmployerOrdersPage } from '@/features/employer-billing/pages/live/EmployerOrdersPage';
import { EmployerOrderDetailPage } from '@/features/employer-billing/pages/live/EmployerOrderDetailPage';
import { EmployerTransactionsPage } from '@/features/employer-billing/pages/live/EmployerTransactionsPage';
import { EmployerPaymentCallbackPage } from '@/features/employer-billing/pages/live/EmployerPaymentCallbackPage';
import { EmployerTeamPage } from '@/features/engagement/pages/EmployerTeamPage';
import { OrganizationSettingsPage } from '@/features/engagement/pages/OrganizationSettingsPage';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireRole } from '@/routes/RequireRole';
import { UserRole } from '@/features/auth/types/auth.types';

// Đường `candidates/:id(/report)`, `campaigns/:id/candidates`, `company*` từng chạy trên fixture
// (`useEmployerWorkspace`) — gỡ hẳn 2026-09-13, BE không có endpoint tương ứng. `/employer/analytics` dựng lại
// cùng ngày trên endpoint thật `GET /api/v1/campaign/analytics` (cùng gate role với các trang chiến dịch).
export const enterpriseRoutes: RouteObject[] = [
  { path: '/enterprise/dashboard', element: <Navigate to="/employer/dashboard" replace /> },
  { path: '/enterprise/campaigns', element: <Navigate to="/employer/campaigns" replace /> },
  { path: '/enterprise/subscription', element: <Navigate to="/employer/subscription" replace /> },
  { path: '/enterprise/billing', element: <Navigate to="/employer/billing" replace /> },
  { path: '/enterprise/invoices', element: <Navigate to="/employer/invoices" replace /> },
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
              { path: 'campaigns', element: <CampaignListPage /> },
              { path: 'analytics', element: <EmployerAnalyticsPage /> },
              { path: 'campaigns/new', element: <CampaignWizardPage /> },
              { path: 'campaigns/:id/selection', element: <Navigate to="../invite" relative="path" replace /> },
              { path: 'campaigns/:id/invite', element: <CampaignInvitePage /> },
              { path: 'campaigns/:id/invite/cv', element: <CampaignInviteCvPage /> },
              { path: 'campaigns/:id/invite/email', element: <CampaignInviteEmailPage /> },
              { path: 'campaigns/:id/invite/result', element: <CampaignInviteResultPage /> },
              {
                path: 'campaigns/:id/cv-screening',
                element: <CampaignWorkspaceRedirect target="invitation-screening" />,
              },
              {
                path: 'campaigns/:id/invitations/new',
                element: <CampaignWorkspaceRedirect target="invitation-compose" />,
              },
              { path: 'campaigns/:id/invitations', element: <CampaignInviteEmailPage /> },
              {
                path: 'campaigns/:id/results',
                element: <CampaignWorkspaceRedirect target="overview-results" />,
              },
              { path: 'campaigns/:id/results/:sessionId', element: <CampaignResultDetailPage /> },
              { path: 'campaigns/:id/overview', element: <CampaignDetailPage /> },
              { path: 'campaigns/:id/edit', element: <CampaignWizardPage /> },
              {
                path: 'campaigns/:id',
                element: <CampaignWorkspaceRedirect target="overview-details" />,
              },
              {
                element: <RequireRole roles={[UserRole.ORG_ADMIN, UserRole.ADMIN]} />,
                children: [
                  {
                    path: 'billing',
                    element: <BillingShell />,
                    children: [
                      { index: true, element: <EmployerBillingOverviewPage /> },
                      { path: 'packages', element: <EmployerPackagesPage /> },
                      { path: 'orders', element: <EmployerOrdersPage /> },
                      { path: 'orders/:orderId', element: <EmployerOrderDetailPage /> },
                      { path: 'transactions', element: <EmployerTransactionsPage /> },
                      { path: 'invoices', element: <EmployerInvoicesPage /> },
                    ],
                  },
                  { path: 'payment/success', element: <EmployerPaymentCallbackPage mode="success" /> },
                  { path: 'payment/cancel', element: <EmployerPaymentCallbackPage mode="cancel" /> },
                  { path: 'invoices', element: <Navigate to="/employer/billing/invoices" replace /> },
                  { path: 'subscription', element: <Navigate to="/employer/billing/packages" replace /> },
                ],
              },
              // Trang "Tổ chức" (`PUT /auth/org` thật). Thông báo/help/support/preferences là fixture — gỡ 2026-09-13.
              { path: 'settings', element: <OrganizationSettingsPage /> },
              {
                element: <RequireRole roles={[UserRole.ORG_ADMIN]} />,
                children: [
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
