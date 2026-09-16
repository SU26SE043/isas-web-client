import React, { useMemo } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  ClipboardList,
  CreditCard,
  Gauge,
  LogOut,
  SlidersHorizontal,
  Target,
  BookOpen,
  ReceiptText,
  Users,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { LanguageToggle } from './LanguageToggle';
import { SidebarLogoutButton } from './components/SidebarLogoutButton';

type NavItem = { to: string; label: string; icon: React.ReactNode; end?: boolean };
/**
 * Nhóm mục theo VIỆC của PlatformAdmin (đợt B, 2026-09-16): Vận hành · Tiền · Chất lượng AI. Nhóm "Hệ thống"
 * (công tắc & trạng thái cờ) chờ đợt C — không dựng nhóm rỗng. Trước đó 8 mục phẳng: "Thước đo chấm điểm"
 * đứng cạnh "Người dùng" nên admin không thấy 3 màn cấu hình AI là một cụm.
 */
type NavGroup = { key: 'operations' | 'money' | 'aiQuality'; items: NavItem[] };

function navLinkClassName(isActive: boolean) {
  return cn(
    'group flex items-center justify-center rounded-xl px-0 py-2.5 text-sm font-medium transition-[background-color,color,box-shadow] duration-200 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] sm:justify-start sm:gap-3 sm:px-3',
    isActive
      ? 'bg-surface-elevated text-foreground shadow-sm ring-1 ring-white/8'
      : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
  );
}

export const AdminDashboardLayout: React.FC = () => {
  const { t } = useLanguage();

  const navGroups = useMemo<NavGroup[]>(
    () => [
      { key: 'operations', items: [
        { to: '/admin/dashboard', label: t('admin.nav.dashboard'), end: true, icon: <Gauge className="h-4 w-4" aria-hidden /> },
        { to: '/admin/users', label: t('admin.nav.users'), icon: <Users className="h-4 w-4" aria-hidden /> },
        { to: '/admin/organizations', label: t('admin.nav.organizations'), icon: <Building2 className="h-4 w-4" aria-hidden /> },
        { to: '/admin/campaigns', label: t('admin.nav.campaigns'), icon: <Briefcase className="h-4 w-4" aria-hidden /> },
      ] },
      { key: 'money', items: [
        { to: '/admin/billing', label: t('admin.nav.billing'), icon: <CreditCard className="h-4 w-4" aria-hidden /> },
        { to: '/admin/orders', label: t('admin.nav.orders'), icon: <ReceiptText className="h-4 w-4" aria-hidden /> },
      ] },
      { key: 'aiQuality', items: [
        { to: '/admin/rubrics', label: t('admin.nav.rubrics'), icon: <ClipboardList className="h-4 w-4" aria-hidden /> },
        { to: '/admin/prompts', label: t('admin.nav.prompts'), icon: <SlidersHorizontal className="h-4 w-4" aria-hidden /> },
        { to: '/admin/roadmap-thresholds', label: t('admin.nav.roadmapThresholds'), icon: <Target className="h-4 w-4" aria-hidden /> },
        { to: '/admin/knowledge', label: t('admin.nav.knowledge'), icon: <BookOpen className="h-4 w-4" aria-hidden /> },
      ] },
    ],
    [t],
  );

  return (
    <div className="min-h-screen surface-page">
      <div className="flex min-h-screen">
        <aside className="glass-sidebar sticky top-0 flex h-screen w-[4.5rem] shrink-0 flex-col border-r sm:w-72">
          <div className="flex items-center justify-center border-b border-subtle px-3 py-4 sm:justify-between">
            <Link to="/" className="focus-ring hidden rounded-lg sm:block"><BrandLogo className="h-7" /></Link>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:hidden">AD</span>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
            <div className="space-y-4">
              {navGroups.map((group, index) => (
                <div key={group.key} role="group" aria-label={t(`admin.nav.group.${group.key}`)} className={cn(index > 0 && 'border-t border-subtle pt-4 sm:border-0 sm:pt-0')}>
                  {/* Tên nhóm chỉ hiện khi sidebar rộng; sidebar thu gọn (icon) dùng đường kẻ ngăn nhóm. */}
                  <p className="mb-1 hidden px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:block">{t(`admin.nav.group.${group.key}`)}</p>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <NavLink key={item.to} to={item.to} end={item.end} aria-label={item.label} title={item.label} className={({ isActive }) => navLinkClassName(isActive)}>
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center">{item.icon}</span>
                        <span className="hidden truncate sm:inline">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>
          <div className="shrink-0 space-y-1 border-t border-subtle p-3">
            <div className="hidden items-center rounded-xl py-2.5 sm:flex sm:justify-start sm:px-3">
              <LanguageToggle compact />
            </div>
            <SidebarLogoutButton className={navLinkClassName(false)} aria-label={t('admin.nav.logout')}>
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">{t('admin.nav.logout')}</span>
            </SidebarLogoutButton>
          </div>
        </aside>
        {/* `overflow-x-clip` chứ KHÔNG `overflow-hidden`: hidden biến main thành scroll container ⇒ mọi
            `position: sticky` bên trong (header reader bài học, thanh công cụ trang) không bao giờ dính —
            cùng lỗi đã đo ở layout employer (rail ở y = −675 sau khi cuộn). */}
        <main className="min-w-0 flex-1 overflow-x-clip bg-surface-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
