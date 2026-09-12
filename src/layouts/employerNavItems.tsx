import type { ReactNode } from 'react';
import { BriefcaseBusiness, Building2, LayoutDashboard, ReceiptText, Users } from 'lucide-react';
import { UserRole, type UserRoleType } from '@/features/auth/types/auth.types';

export type EmployerNavItem = {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  roles?: UserRoleType[];
};

// Chỉ còn màn có BE thật. Analytics / thông báo / help / support / hồ sơ công ty từng là fixture
// (`useEmployerAnalytics`, `useEngagement`, `useEmployerWorkspace`) — gỡ hẳn 2026-09-13.
export function buildEmployerNavItems(t: (key: string) => string): EmployerNavItem[] {
  return [
    {
      to: '/employer/dashboard',
      label: t('employer.nav.dashboard'),
      end: true,
      icon: <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />,
    },
    {
      to: '/employer/campaigns',
      label: t('employer.campaigns.nav.campaigns'),
      icon: <BriefcaseBusiness className="h-4 w-4 shrink-0" aria-hidden />,
    },
    {
      to: '/employer/billing',
      label: t('employer.nav.billing'),
      icon: <ReceiptText className="h-4 w-4 shrink-0" aria-hidden />,
      roles: [UserRole.ORG_ADMIN, UserRole.ADMIN],
    },
    {
      to: '/employer/team',
      label: t('engagement.nav.team'),
      icon: <Users className="h-4 w-4 shrink-0" aria-hidden />,
      roles: [UserRole.ORG_ADMIN],
    },
    {
      // Trang "Tổ chức" — form `GET/PUT /auth/org` thật (OrgAdmin sửa, HrMember chỉ xem).
      to: '/employer/settings',
      label: t('engagement.organization.pageTitle'),
      icon: <Building2 className="h-4 w-4 shrink-0" aria-hidden />,
    },
  ];
}

export function filterEmployerNavItems(items: EmployerNavItem[], role: UserRoleType) {
  return items.filter((item) => !item.roles?.length || item.roles.some((allowed) => allowed === role));
}
