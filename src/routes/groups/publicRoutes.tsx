import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { HomePage } from '@/features/home/pages/HomePage';
import { EnterprisePage } from '@/features/marketing/pages/EnterprisePage';
import { MagicLinkLandingPage } from '@/features/campaigns/pages/MagicLinkLandingPage';
import { PricingPage } from '@/features/marketing/pages/PricingPage';
import { PrivacyPage } from '@/features/marketing/pages/PrivacyPage';
import { TermsPage } from '@/features/marketing/pages/TermsPage';
import { ForbiddenPage, MaintenancePage, NotFoundPage, ServerErrorPage } from '@/pages/errors/ErrorPages';
import { ComponentHarnessPage } from '@/pages/dev/ComponentHarnessPage';
import { OrderDetailUiPreviewPage } from '@/features/payment/pages/OrderDetailUiPreviewPage';

const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: 'dev',
        element: <DashboardLayout />,
        children: [
          { path: 'components', element: <ComponentHarnessPage /> },
          { path: 'order-detail', element: <OrderDetailUiPreviewPage /> },
        ],
      },
    ]
  : [];

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <MarketingLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'enterprise', element: <EnterprisePage /> },
      { path: 'employers', element: <Navigate to="/enterprise" replace /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'maintenance', element: <MaintenancePage /> },
      { path: 'invite/:token', element: <MagicLinkLandingPage /> },
      ...devRoutes,
    ],
  },
  { path: '/403', element: <ForbiddenPage /> },
  { path: '/404', element: <NotFoundPage /> },
  { path: '/500', element: <ServerErrorPage /> },
  { path: '*', element: <NotFoundPage /> },
];
