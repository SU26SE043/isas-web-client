import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { AdminDashboardLayout } from '@/layouts/AdminDashboardLayout';
import { AdminAiConfigPage } from '@/features/admin/pages/AdminAiConfigPage';
import { AdminBillingPage } from '@/features/admin/pages/AdminBillingPage';
import { AdminAuditLogsPage } from '@/features/admin/pages/AdminAuditLogsPage';
import { AdminCampaignsPage } from '@/features/admin/pages/AdminCampaignsPage';
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { AdminFeatureFlagsPage } from '@/features/admin/pages/AdminFeatureFlagsPage';
import { AdminHealthPage } from '@/features/admin/pages/AdminHealthPage';
import { AdminMaintenancePage } from '@/features/admin/pages/AdminMaintenancePage';
import { AdminMonitoringPage } from '@/features/admin/pages/AdminMonitoringPage';
import { AdminOrganizationsPage } from '@/features/admin/pages/AdminOrganizationsPage';
import { AdminPermissionsPage } from '@/features/admin/pages/AdminPermissionsPage';
import { AdminResourcePage } from '@/features/admin/pages/AdminResourcePage';
import { AdminRolesPage } from '@/features/admin/pages/AdminRolesPage';
import { AdminSystemConfigPage } from '@/features/admin/pages/AdminSystemConfigPage';
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage';
import { AdminPromptsPage } from '@/features/admin/pages/AdminPromptsPage';
import { AdminRubricsPage } from '@/features/admin/pages/AdminRubricsPage';
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
            element: <AdminDashboardLayout />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: 'dashboard', element: <AdminDashboardPage /> },
              { path: 'billing', element: <AdminBillingPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'organizations', element: <AdminOrganizationsPage /> },
              { path: 'roles', element: <AdminRolesPage /> },
              { path: 'permissions', element: <AdminPermissionsPage /> },
              { path: 'approvals', element: <AdminResourcePage resourceKey="approvals" /> },
              { path: 'candidates', element: <AdminResourcePage resourceKey="candidates" /> },
              { path: 'campaigns', element: <AdminCampaignsPage /> },
              { path: 'content', element: <AdminResourcePage resourceKey="content" /> },
              { path: 'learning', element: <AdminResourcePage resourceKey="learning" /> },
              { path: 'ai-config', element: <AdminAiConfigPage /> },
              { path: 'prompts', element: <AdminPromptsPage /> },
              { path: 'rubrics', element: <AdminRubricsPage /> },
              { path: 'notification-templates', element: <AdminResourcePage resourceKey="notificationTemplates" /> },
              { path: 'reports', element: <AdminResourcePage resourceKey="reports" /> },
              { path: 'audit-logs', element: <AdminAuditLogsPage /> },
              { path: 'system-config', element: <AdminSystemConfigPage /> },
              { path: 'feature-flags', element: <AdminFeatureFlagsPage /> },
              { path: 'monitoring', element: <AdminMonitoringPage /> },
              { path: 'health', element: <AdminHealthPage /> },
              { path: 'backups', element: <AdminResourcePage resourceKey="backups" /> },
              { path: 'maintenance', element: <AdminMaintenancePage /> },
              { path: 'support-tickets', element: <AdminResourcePage resourceKey="supportTickets" /> },
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
