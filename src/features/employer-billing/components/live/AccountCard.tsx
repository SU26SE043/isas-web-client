import { AlertTriangle, Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/shared/languages';
import {
  PaymentAccountStatus,
  PaymentMode,
  type PaymentAccountResponse,
} from '../../types/employerPayment.types';
import { formatDateTime } from '../../utils/employerPayment';

export function AccountCard({ account }: { account: PaymentAccountResponse }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const isPostpaid = account.paymentMode === PaymentMode.Postpaid;
  const headlineValue = isPostpaid ? (account.periodUsage ?? 0) : account.remainingCredits;
  return (
    <section className="frame-satin rounded-2xl bg-surface-raised p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-label">
            {t(isPostpaid ? 'employerBilling.live.periodUsage' : 'employerBilling.live.creditAvailable')}
          </p>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-foreground">
            {headlineValue.toLocaleString(locale)}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-surface-overlay frame-satin-soft">
          <Coins className="size-5" aria-hidden />
        </div>
      </div>
      <Badge variant="outline" className="mt-5">
        {t(account.paymentMode === PaymentMode.Postpaid
          ? 'employerBilling.live.postpaid'
          : 'employerBilling.live.prepaid')}
      </Badge>
      <dl className="mt-5 grid gap-4 border-t border-satin pt-5 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted-foreground">{t('employerBilling.live.reserved')}</dt>
          <dd className="mt-1 font-medium text-foreground">{account.reservedCredits.toLocaleString(locale)}</dd>
        </div>
        {account.periodUsage != null ? (
          <div>
            <dt className="text-xs text-muted-foreground">{t('employerBilling.live.periodUsage')}</dt>
            <dd className="mt-1 font-medium text-foreground">{account.periodUsage.toLocaleString(locale)}</dd>
          </div>
        ) : null}
        {account.creditLimit != null ? (
          <div>
            <dt className="text-xs text-muted-foreground">{t('employerBilling.live.creditLimit')}</dt>
            <dd className="mt-1 font-medium text-foreground">{account.creditLimit.toLocaleString(locale)}</dd>
          </div>
        ) : null}
      </dl>
      {account.status === PaymentAccountStatus.Suspended ? (
        <p className="mt-5 flex gap-2 rounded-lg border border-warning/30 bg-warning-bg p-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t('employerBilling.live.walletSuspended')}
        </p>
      ) : null}
      <p className="mt-5 text-xs text-muted-foreground">
        {t('employerBilling.live.updatedAt').replace('{date}', formatDateTime(account.updatedAt, locale))}
      </p>
    </section>
  );
}

