import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { useMarketingAuthModal } from '@/layouts/MarketingAuthModalProvider';
import { paymentService } from '@/features/payment/services/payment.service';
import type { PackageResponse } from '@/features/payment/types/payment.types';

function formatVnd(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(amount);
}

function isOneTimePackage(pkg: PackageResponse): boolean {
  return pkg.type === 1 || pkg.type === '1' || String(pkg.type).toLowerCase() === 'onetime';
}

export const PricingTable: React.FC = () => {
  const { t, language } = useLanguage();
  const { openAuthModal } = useMarketingAuthModal();
  const locale = language === 'vi' ? 'vi' : 'en';

  const { data: packages = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['payment', 'catalog-packages'],
    queryFn: () => paymentService.listCatalogPackages(),
  });

  const popularId = useMemo(() => {
    if (packages.length === 0) return null;
    return [...packages].sort(
      (a, b) => (b.interviewCredits ?? 0) - (a.interviewCredits ?? 0),
    )[0]?.id ?? null;
  }, [packages]);

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <span>{t('pricing.loading')}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl border border-error/30 bg-error-bg px-6 py-8 text-center">
        <p className="text-sm text-error">
          {error instanceof Error ? error.message : t('pricing.loadError')}
        </p>
        <button
          type="button"
          className="btn-secondary"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          {t('pricing.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {packages.map((pkg) => {
        const popular = pkg.id === popularId && packages.length > 1;
        const credits = pkg.interviewCredits ?? 0;
        const oneTime = isOneTimePackage(pkg);

        return (
          <article
            key={pkg.id}
            className={`relative flex flex-col rounded-xl border bg-surface-raised p-6 ${
              popular ? 'border-default shadow-md' : 'border-subtle'
            }`}
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
              <span className="text-3xl font-bold text-foreground">
                {formatVnd(pkg.priceVnd, locale)}
              </span>
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
                <span>
                  {t('pricing.feature.credits').replace('{credits}', String(credits))}
                </span>
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
              onClick={() => openAuthModal('signup')}
              className={`w-full text-center ${popular ? 'btn-primary' : 'btn-secondary'}`}
            >
              {t('pricing.cta')}
            </button>
          </article>
        );
      })}

      <article className="relative flex flex-col rounded-xl border border-subtle bg-surface-raised p-6">
        <h3 className="heading-secondary mb-2 text-lg">{t('pricing.enterprise.name')}</h3>
        <p className="body-text mb-4 text-sm">{t('pricing.enterprise.description')}</p>
        <div className="mb-6">
          <span className="text-3xl font-bold text-foreground">{t('pricing.enterprise.price')}</span>
        </div>
        <ul className="mb-8 flex-grow space-y-3">
          {(['pricing.enterprise.feature1', 'pricing.enterprise.feature2', 'pricing.enterprise.feature3'] as const).map(
            (key) => (
              <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-foreground" />
                <span>{t(key)}</span>
              </li>
            ),
          )}
        </ul>
        <Link to="/enterprise" className="btn-secondary w-full text-center">
          {t('pricing.ctaContact')}
        </Link>
      </article>
    </div>
  );
};
