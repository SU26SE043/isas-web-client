import React, { useMemo } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  Activity,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  CircleHelp,
  ClipboardCheck,
  DatabaseBackup,
  FileText,
  Flag,
  Gauge,
  HeartPulse,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  Settings,
  Shield,
  Users,
  Wrench,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BrandLogo } from '@/components/BrandLogo';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { NotificationBell } from '@/features/engagement/components/NotificationBell';
import { LanguageToggle } from './LanguageToggle';
import { SidebarLogoutButton } from './components/SidebarLogoutButton';

type NavItem = { to: string; label: string; icon: React.ReactNode; end?: boolean };

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

  const navItems = useMemo<NavItem[]>(
    () => [
      { to: '/admin/dashboard', label: t('admin.nav.dashboard'), end: true, icon: <Gauge className="h-4 w-4" aria-hidden /> },
      { to: '/admin/users', label: t('admin.nav.users'), icon: <Users className="h-4 w-4" aria-hidden /> },
      { to: '/admin/roles', label: t('admin.nav.roles'), icon: <Shield className="h-4 w-4" aria-hidden /> },
      { to: '/admin/permissions', label: t('admin.nav.permissions'), icon: <LockKeyhole className="h-4 w-4" aria-hidden /> },
      { to: '/admin/approvals', label: t('admin.nav.approvals'), icon: <ClipboardCheck className="h-4 w-4" aria-hidden /> },
      { to: '/admin/candidates', label: t('admin.nav.candidates'), icon: <Users className="h-4 w-4" aria-hidden /> },
      { to: '/admin/campaigns', label: t('admin.nav.campaigns'), icon: <Briefcase className="h-4 w-4" aria-hidden /> },
      { to: '/admin/content', label: t('admin.nav.content'), icon: <FileText className="h-4 w-4" aria-hidden /> },
      { to: '/admin/learning', label: t('admin.nav.learning'), icon: <BookOpen className="h-4 w-4" aria-hidden /> },
      { to: '/admin/ai-config', label: t('admin.nav.aiConfig'), icon: <Bot className="h-4 w-4" aria-hidden /> },
      { to: '/admin/notification-templates', label: t('admin.nav.templates'), icon: <Bell className="h-4 w-4" aria-hidden /> },
      { to: '/admin/reports', label: t('admin.nav.reports'), icon: <FileText className="h-4 w-4" aria-hidden /> },
      { to: '/admin/audit-logs', label: t('admin.nav.audit'), icon: <LockKeyhole className="h-4 w-4" aria-hidden /> },
      { to: '/admin/system-config', label: t('admin.nav.systemConfig'), icon: <Settings className="h-4 w-4" aria-hidden /> },
      { to: '/admin/feature-flags', label: t('admin.nav.flags'), icon: <Flag className="h-4 w-4" aria-hidden /> },
      { to: '/admin/monitoring', label: t('admin.nav.monitoring'), icon: <Activity className="h-4 w-4" aria-hidden /> },
      { to: '/admin/health', label: t('admin.nav.health'), icon: <HeartPulse className="h-4 w-4" aria-hidden /> },
      { to: '/admin/backups', label: t('admin.nav.backups'), icon: <DatabaseBackup className="h-4 w-4" aria-hidden /> },
      { to: '/admin/maintenance', label: t('admin.nav.maintenance'), icon: <Wrench className="h-4 w-4" aria-hidden /> },
      { to: '/admin/support-tickets', label: t('admin.nav.support'), icon: <LifeBuoy className="h-4 w-4" aria-hidden /> },
      { to: '/admin/notifications', label: t('engagement.nav.notifications'), icon: <Bell className="h-4 w-4" aria-hidden /> },
      { to: '/admin/settings', label: t('engagement.nav.settings'), icon: <Settings className="h-4 w-4" aria-hidden /> },
      { to: '/admin/help', label: t('engagement.nav.help'), icon: <CircleHelp className="h-4 w-4" aria-hidden /> },
      { to: '/admin/support', label: t('engagement.nav.support'), icon: <LifeBuoy className="h-4 w-4" aria-hidden /> },
    ],
    [t],
  );

  return (
    <div className="min-h-screen surface-base">
      <div className="flex min-h-screen">
        <aside className="glass-sidebar sticky top-0 flex h-screen w-[4.5rem] shrink-0 flex-col border-r sm:w-72">
          <div className="flex items-center justify-center border-b border-subtle px-3 py-4 sm:justify-between">
            <Link to="/" className="focus-ring hidden rounded-md sm:block"><BrandLogo className="h-7" /></Link>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:hidden">AD</span>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} aria-label={item.label} title={item.label} className={({ isActive }) => navLinkClassName(isActive)}>
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">{item.icon}</span>
                  <span className="hidden truncate sm:inline">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
          <div className="space-y-3 border-t border-subtle p-3">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <NotificationBell scope="admin" panelPlacement="sidebar" />
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {t('engagement.nav.notifications')}
              </span>
            </div>
            <div className="hidden sm:flex sm:justify-start"><LanguageToggle compact /></div>
            <SidebarLogoutButton className={navLinkClassName(false)} aria-label={t('admin.nav.logout')}>
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">{t('admin.nav.logout')}</span>
            </SidebarLogoutButton>
          </div>
        </aside>
        <main className="min-w-0 flex-1 overflow-hidden bg-surface-base">
          <div className="glass-topbar border-b px-4 py-3 sm:px-6">
            <Alert variant="info">
              <AlertDescription>
                {t('admin.layout.mfaRequired')} {t('admin.layout.singleSession')}
              </AlertDescription>
            </Alert>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
