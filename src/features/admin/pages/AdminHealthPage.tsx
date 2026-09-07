import { AdminPageShell } from '../components/AdminPageShell';
import { AdminStatusBadge } from '../components/AdminStatusBadge';
import { useAdminPlatform } from '../hooks/useAdminPlatform';
import { useLanguage } from '@/shared/languages';

export function AdminHealthPage() {
  const { t, language } = useLanguage();
  const { snapshot } = useAdminPlatform();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  return (
    <AdminPageShell title={t('admin.health.title')} description={t('admin.health.description')}>
      <section className="space-y-3">
        {(snapshot?.health ?? []).map((item) => (
          <div key={item.id} className="grid gap-3 rounded-xl border border-subtle bg-surface-raised p-4 md:grid-cols-[1fr_120px_180px] md:items-center">
            <div>
              <p className="font-medium text-foreground">{t(item.nameKey)}</p>
              <p className="text-xs text-muted-foreground">{t('admin.health.heartbeatRule')}</p>
            </div>
            <p className="text-sm text-muted-foreground">{item.latencyMs}ms</p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">{new Intl.DateTimeFormat(locale, { timeStyle: 'medium' }).format(new Date(item.lastHeartbeatAt))}</span>
              <AdminStatusBadge status={item.status} />
            </div>
          </div>
        ))}
      </section>
    </AdminPageShell>
  );
}
