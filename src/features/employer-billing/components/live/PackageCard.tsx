import { CalendarRange, Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { PaymentPackageType, type PackageResponse } from '../../types/employerPayment.types';
import { formatVnd } from '../../utils/employerPayment';

export function PackageCard({
  pkg,
  canManage,
  isCreating,
  onBuy,
}: {
  pkg: PackageResponse;
  canManage: boolean;
  isCreating: boolean;
  onBuy: () => void;
}) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const isOneTime = pkg.type === PaymentPackageType.OneTime;
  const unitPrice =
    pkg.interviewCredits && pkg.interviewCredits > 0
      ? Math.round(pkg.priceVnd / pkg.interviewCredits)
      : null;

  return (
    <article className="frame-satin flex min-h-72 flex-col rounded-2xl bg-surface-raised p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-surface-overlay frame-satin-soft">
          {isOneTime ? <Coins className="size-5" /> : <CalendarRange className="size-5" />}
        </div>
        <Badge variant="outline">
          {t(isOneTime ? 'employerBilling.packages.oneTimeBadge' : 'employerBilling.packages.subscriptionBadge')}
        </Badge>
      </div>
      <h2 className="mt-5 text-xl font-semibold text-foreground">{pkg.name}</h2>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {formatVnd(pkg.priceVnd, locale)}
      </p>
      <div className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
        {pkg.interviewCredits != null ? (
          <p>{t('employerBilling.packages.credits').replace('{count}', pkg.interviewCredits.toLocaleString(locale))}</p>
        ) : null}
        {pkg.durationDays != null ? (
          <p>{t('employerBilling.packages.duration').replace('{count}', String(pkg.durationDays))}</p>
        ) : null}
        {unitPrice != null ? (
          <p>{t('employerBilling.packages.unitPrice').replace('{price}', formatVnd(unitPrice, locale))}</p>
        ) : null}
      </div>
      <Button
        className="mt-6 w-full"
        disabled={!canManage || isCreating}
        loading={isCreating}
        onClick={onBuy}
        title={!canManage ? t('employerBilling.packages.adminOnly') : undefined}
      >
        {isCreating ? t('employerBilling.packages.creating') : t('employerBilling.packages.buy')}
      </Button>
    </article>
  );
}

