import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { AdminDashboardLayout } from '@/layouts/AdminDashboardLayout';
import { AdminBillingPage } from '@/features/admin/pages/AdminBillingPage';
import { AdminCampaignsPage } from '@/features/admin/pages/AdminCampaignsPage';
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { AdminOrganizationsPage } from '@/features/admin/pages/AdminOrganizationsPage';
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage';
import { AdminPromptsPage } from '@/features/admin/pages/AdminPromptsPage';
import { AdminRubricsPage } from '@/features/admin/pages/AdminRubricsPage';
import { AdminRoadmapThresholdsPage } from '@/features/admin/pages/AdminRoadmapThresholdsPage';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireRole } from '@/routes/RequireRole';
import { UserRole } from '@/features/auth/types/auth.types';

// Chỉ giữ màn có BE thật. Các mục roles/permissions/approvals/content/learning/ai-config/
// notification-templates/reports/audit-logs/system-config/feature-flags/monitoring/health/backups/
// maintenance/support-tickets/notifications/settings/help/support từng chạy trên fixture
// (`useAdminPlatform`/`useEngagement`) — gỡ hẳn 2026-09-13 để demo không bấm nhầm vào dữ liệu giả.
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
              { path: 'campaigns', element: <AdminCampaignsPage /> },
              { path: 'prompts', element: <AdminPromptsPage /> },
              { path: 'rubrics', element: <AdminRubricsPage /> },
              { path: 'roadmap-thresholds', element: <AdminRoadmapThresholdsPage /> },
              { path: '*', element: <Navigate to="/admin/dashboard" replace /> },
            ],
          },
        ],
      },
    ],
  },
];
