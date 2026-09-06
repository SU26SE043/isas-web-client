import { Activity } from 'lucide-react';
import { AdminMetricCard } from '../components/AdminMetricCard';
import { AdminPageShell } from '../components/AdminPageShell';
import { useLanguage } from '@/shared/languages';

export function AdminMonitoringPage() {
  const { t } = useLanguage();

  return (
    <AdminPageShell title={t('admin.monitoring.title')} description={t('admin.monitoring.description')}>
      <section className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard label={t('admin.monitoring.requests')} value="2.4M" hint={t('admin.monitoring.requestsHint')} status="healthy" icon={<Activity className="h-5 w-5" aria-hidden />} />
        <AdminMetricCard label={t('admin.monitoring.errorRate')} value="0.08%" hint={t('admin.monitoring.errorRateHint')} status="healthy" icon={<Activity className="h-5 w-5" aria-hidden />} />
        <AdminMetricCard label={t('admin.monitoring.queue')} value="42" hint={t('admin.monitoring.queueHint')} status="warning" icon={<Activity className="h-5 w-5" aria-hidden />} />
      </section>
      <div className="rounded-xl border border-subtle bg-surface-raised p-5">
        <p className="font-medium text-foreground">{t('admin.monitoring.heartbeat')}</p>
        <div className="mt-4 grid grid-cols-12 gap-1">
          {Array.from({ length: 36 }).map((_, index) => <span key={index} className="h-10 rounded bg-surface-overlay" />)}
        </div>
      </div>
    </AdminPageShell>
  );
}
