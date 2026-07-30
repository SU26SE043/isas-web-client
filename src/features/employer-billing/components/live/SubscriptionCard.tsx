import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { SubscriptionResponse } from '../../types/employerPayment.types';
import { formatDateTime } from '../../utils/employerPayment';

function daysUntil(value: string | null): number | null {
  if (!value) return null;
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000));
}

export function SubscriptionCard({
  subscription,
  canManage,
}: {
  subscription: SubscriptionResponse;
  canManage: boolean;
}) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const daysLeft = daysUntil(subscription.expiresAt);

  return (
    <section className="frame-satin rounded-2xl bg-surface-raised p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-label">{t('employerBilling.live.subscription')}</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            {t(subscription.active ? 'employerBilling.live.active' : 'employerBilling.live.noSubscription')}
          </h2>
        </div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-surface-overlay frame-satin-soft">
          {subscription.active ? <CheckCircle2 className="size-5 text-success" /> : <CalendarDays className="size-5" />}
        </div>
      </div>
      {subscription.active ? (
        <>
          <Badge variant="outline" className="mt-5 border-success/30 bg-success-bg text-success">
            {t('employerBilling.live.active')}
          </Badge>
          <dl className="mt-5 grid gap-4 border-t border-satin pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">{t('employerBilling.live.startedAt')}</dt>
              <dd className="mt-1 text-foreground">{formatDateTime(subscription.startedAt, locale)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t('employerBilling.live.expiresAt')}</dt>
              <dd className="mt-1 text-foreground">{formatDateTime(subscription.expiresAt, locale)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-muted-foreground">
            {t('employerBilling.live.subscriptionBenefit')}
          </p>
          {daysLeft != null ? (
            <p className={daysLeft < 7 ? 'mt-3 text-sm text-warning' : 'mt-3 text-sm text-muted-foreground'}>
              {daysLeft < 7 ? `${t('employerBilling.live.expiringSoon')} ` : ''}
              {t('employerBilling.live.daysLeft').replace('{count}', String(daysLeft))}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted-foreground">{t('employerBilling.live.noSubscriptionHint')}</p>
          {canManage ? (
            <Button className="mt-5" render={<Link to="/employer/billing/packages" />} nativeButton={false}>
              {t('employerBilling.live.viewSubscriptions')}
            </Button>
          ) : null}
        </>
      )}
    </section>
  );
}

