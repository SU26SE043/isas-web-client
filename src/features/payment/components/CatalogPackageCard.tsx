import { Check } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { PackageResponse } from '../types/payment.types';
import { formatVnd } from '../utils/paymentFormat';

function isOneTimePackage(pkg: PackageResponse): boolean {
  return pkg.type === 1 || pkg.type === '1' || String(pkg.type).toLowerCase() === 'onetime';
}

export interface CatalogPackageCardProps {
  pkg: PackageResponse;
  popular?: boolean;
  isBuying?: boolean;
  ctaLabel: string;
  onBuy: (packageId: string) => void;
  locale: string;
}

/** Shared package card template for `/pricing` and `/candidate/credits`. */
export function CatalogPackageCard({
  pkg,
  popular = false,
  isBuying = false,
  ctaLabel,
  onBuy,
  locale,
}: CatalogPackageCardProps) {
  const { t } = useLanguage();
  const credits = pkg.interviewCredits ?? 0;
  const oneTime = isOneTimePackage(pkg);

  return (
    <article
      className={cn(
        'relative flex flex-col rounded-xl border bg-surface-raised p-6',
        popular ? 'border-default shadow-md' : 'border-subtle',
      )}
    >
      {popular ? (
        <span className="text-label absolute -top-3 left-6 rounded-full bg-surface-elevated px-3 py-1 text-xs">
          {t('pricing.popular')}
        </span>
      ) : null}

      <h3 className="heading-secondary mb-2 text-lg">{pkg.name}</h3>
      <p className="body-text mb-4 text-sm">
        {t('pricing.packageDescription').replace('{credits}', String(credits))}
      </p>

      <div className="mb-6">
        <span className="text-3xl font-bold text-foreground">{formatVnd(pkg.priceVnd, locale)}</span>
        <p className="mt-1 text-sm text-muted-foreground">
          VND
          {oneTime ? ` (${t('pricing.oneTime')})` : null}
          {pkg.durationDays != null
            ? ` · ${t('pricing.durationDays').replace('{days}', String(pkg.durationDays))}`
            : null}
        </p>
      </div>

      <ul className="mb-8 flex-grow space-y-3">
        <li className="flex items-start gap-2 text-sm text-muted-foreground">
          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-foreground" />
          <span>{t('pricing.feature.credits').replace('{credits}', String(credits))}</span>
        </li>
        <li className="flex items-start gap-2 text-sm text-muted-foreground">
          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-foreground" />
          <span>{t('pricing.feature.cvAnalysis')}</span>
        </li>
        <li className="flex items-start gap-2 text-sm text-muted-foreground">
          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-foreground" />
          <span>{t('pricing.feature.practice')}</span>
        </li>
      </ul>

      <button
        type="button"
        disabled={isBuying}
        onClick={() => onBuy(pkg.id)}
        className={cn(
          'w-full text-center disabled:opacity-60',
          popular ? 'btn-primary' : 'btn-secondary',
        )}
      >
        {isBuying ? t('payment.checkout.redirecting') : ctaLabel}
      </button>
    </article>
  );
}
