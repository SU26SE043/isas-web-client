import { Activity, Database, ShieldCheck, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { AdminMetricCard } from '../components/AdminMetricCard';
import { AdminPageShell } from '../components/AdminPageShell';
import { AdminStatusBadge } from '../components/AdminStatusBadge';
import { useAdminPlatform } from '../hooks/useAdminPlatform';

const icons = [Users, ShieldCheck, Database, Activity];

export function AdminDashboardPage() {
  const { t } = useLanguage();
  const { snapshot, isLoading } = useAdminPlatform();

  return (
    <AdminPageShell eyebrow="SCR-ADM-069" title={t('admin.dashboard.title')} description={t('admin.dashboard.description')}>
      {isLoading || !snapshot ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{icons.map((Icon) => <Skeleton key={Icon.name} className="h-40" />)}</div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {snapshot.metrics.map((metric, index) => {
              const Icon = icons[index] ?? Activity;
              return <AdminMetricCard key={metric.id} label={t(metric.labelKey)} value={metric.value} hint={t(metric.hintKey)} status={metric.status} icon={<Icon className="h-5 w-5" aria-hidden />} />;
            })}
          </section>
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border border-subtle bg-surface-raised">
              <CardHeader><CardTitle>{t('admin.dashboard.health')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {snapshot.health.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-subtle bg-surface-overlay p-3">
                    <div>
                      <p className="font-medium text-foreground">{t(item.nameKey)}</p>
                      <p className="text-xs text-muted-foreground">{item.latencyMs}ms</p>
                    </div>
                    <AdminStatusBadge status={item.status} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border border-subtle bg-surface-raised">
              <CardHeader><CardTitle>{t('admin.dashboard.audit')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {snapshot.auditLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="rounded-lg border border-subtle bg-surface-overlay p-3">
                    <p className="font-medium text-foreground">{t(log.actionKey)}</p>
                    <p className="text-xs text-muted-foreground">{log.actor} · {log.hash}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </AdminPageShell>
  );
}
