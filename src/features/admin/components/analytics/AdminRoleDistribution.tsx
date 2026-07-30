import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import type { AdminAnalyticsRoleTotal } from '../../types/adminAnalytics.types';

export function AdminRoleDistribution({ items }: { items: AdminAnalyticsRoleTotal[] }) {
  const { t } = useLanguage();
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="frame-satin bg-surface-raised">
      <CardHeader>
        <CardTitle>{t('admin.analytics.byRole')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('admin.analytics.empty')}</p>
        ) : null}
        {items.map((item) => {
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const roleKey = `admin.userRole.${item.role}`;
          const translatedRole = t(roleKey);
          return (
            <div key={item.role} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">
                  {translatedRole === roleKey ? item.role : translatedRole}
                </span>
                <span className="text-muted-foreground">{item.count} · {percentage}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-overlay">
                <div
                  className="h-full rounded-full bg-foreground"
                  style={{ width: `${percentage}%` }}
                  aria-hidden
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
