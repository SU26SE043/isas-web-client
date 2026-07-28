import type { ReactNode } from 'react';
import {
  BadgeCheck,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CircleHelp,
  LayoutDashboard,
  LifeBuoy,
  ReceiptText,
  Settings,
  Users,
} from 'lucide-react';
import { PHASE11_CAMPAIGN_ID } from '@/features/employer-analytics/mocks/employerAnalytics.fixtures';
import { UserRole, type UserRoleType } from '@/features/auth/types/auth.types';

export type EmployerNavItem = {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  roles?: UserRoleType[];
};

export function buildEmployerNavItems(t: (key: string) => string): EmployerNavItem[] {
  return [
    {
      to: '/employer/dashboard',
      label: t('employer.nav.dashboard'),
      end: true,
      icon: <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />,
    },
    {
      to: '/employer/company',
      label: t('employer.nav.company'),
      end: true,
      icon: <Building2 className="h-4 w-4 shrink-0" aria-hidden />,
      roles: [UserRole.ORG_ADMIN, UserRole.ADMIN],
    },
    {
      to: '/employer/company/verify',
      label: t('employer.nav.verify'),
      icon: <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />,
      roles: [UserRole.ORG_ADMIN, UserRole.ADMIN],
    },
    {
      to: '/employer/campaigns',
      label: t('employer.campaigns.nav.campaigns'),
      icon: <BriefcaseBusiness className="h-4 w-4 shrink-0" aria-hidden />,
    },
    {
      to: `/employer/campaigns/${PHASE11_CAMPAIGN_ID}/candidates`,
      label: t('employer.nav.pipeline'),
      icon: <Users className="h-4 w-4 shrink-0" aria-hidden />,
    },
    {
      to: '/employer/analytics',
      label: t('employer.nav.analytics'),
      icon: <BarChart3 className="h-4 w-4 shrink-0" aria-hidden />,
    },
    {
      to: '/employer/billing',
      label: t('employer.nav.billing'),
      icon: <ReceiptText className="h-4 w-4 shrink-0" aria-hidden />,
    },
    {
      to: '/employer/notifications',
      label: t('engagement.nav.notifications'),
      icon: <Bell className="h-4 w-4 shrink-0" aria-hidden />,
    },
    {
      to: '/employer/settings',
      label: t('engagement.nav.settings'),
      icon: <Settings className="h-4 w-4 shrink-0" aria-hidden />,
    },
    {
      to: '/employer/team',
      label: t('engagement.nav.team'),
      icon: <Users className="h-4 w-4 shrink-0" aria-hidden />,
      roles: [UserRole.ORG_ADMIN],
    },
    {
      to: '/employer/help',
      label: t('engagement.nav.help'),
      icon: <CircleHelp className="h-4 w-4 shrink-0" aria-hidden />,
    },
    {
      to: '/employer/support',
      label: t('engagement.nav.support'),
      icon: <LifeBuoy className="h-4 w-4 shrink-0" aria-hidden />,
    },
  ];
}

export function filterEmployerNavItems(items: EmployerNavItem[], role: UserRoleType) {
  return items.filter((item) => !item.roles?.length || item.roles.some((allowed) => allowed === role));
}
