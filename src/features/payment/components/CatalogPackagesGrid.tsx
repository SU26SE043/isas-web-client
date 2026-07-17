import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { paymentService } from '../services/payment.service';
import { usePurchasePackage } from '../hooks/usePurchasePackage';
import { CatalogPackageCard } from './CatalogPackageCard';

export interface CatalogPackagesGridProps {
  /** Marketing `/pricing` shows Enterprise; credits page hides it. */
  showEnterpriseCard?: boolean;
  /** Called when guest clicks buy (marketing opens auth modal). */
  onRequireAuth?: () => void;
}

/** Shared package catalog grid for `/pricing` and `/candidate/credits`. */
export function CatalogPackagesGrid({
  showEnterpriseCard = false,
  onRequireAuth,
}: CatalogPackagesGridProps) {
  const { t, language } = useLanguage();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { purchasePackage, activePackageId, error, clearError } = usePurchasePackage();
  const locale = language === 'vi' ? 'vi' : 'en';

  const { data: packages = [], isLoading, isError, error: loadError, refetch, isFetching } = useQuery({
    queryKey: ['payment', 'catalog-packages'],
    queryFn: () => paymentService.listCatalogPackages(),
  });

  const popularId = useMemo(() => {
    if (packages.length === 0) return null;
    return (
      [...packages].sort((a, b) => (b.interviewCredits ?? 0) - (a.interviewCredits ?? 0))[0]?.id ??
      null
    );
  }, [packages]);

  const handlePackageClick = (packageId: string) => {
    clearError();
    if (!isAuthenticated) {
      onRequireAuth?.();
      return;
    }
    void purchasePackage(packageId);
  };

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
          {loadError instanceof Error ? loadError.message : t('pricing.loadError')}
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

  if (packages.length === 0) {
    return (
      <p className="rounded-xl border border-subtle bg-surface-raised px-4 py-8 text-center text-sm text-muted-foreground">
        {t('payment.plans.empty')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="mx-auto max-w-lg rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-center text-sm text-error">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {packages.map((pkg) => {
          const popular = pkg.id === popularId && packages.length > 1;
          return (
            <CatalogPackageCard
              key={pkg.id}
              pkg={pkg}
              popular={popular}
              isBuying={activePackageId === pkg.id}
              locale={locale}
              ctaLabel={isAuthenticated ? t('pricing.buyPackage') : t('pricing.cta')}
              onBuy={handlePackageClick}
            />
          );
        })}

        {showEnterpriseCard ? (
          <article className="relative flex flex-col rounded-xl border border-subtle bg-surface-raised p-6">
            <h3 className="heading-secondary mb-2 text-lg">{t('pricing.enterprise.name')}</h3>
            <p className="body-text mb-4 text-sm">{t('pricing.enterprise.description')}</p>
            <div className="mb-6">
              <span className="text-3xl font-bold text-foreground">{t('pricing.enterprise.price')}</span>
            </div>
            <ul className="mb-8 flex-grow space-y-3">
              {(
                [
                  'pricing.enterprise.feature1',
                  'pricing.enterprise.feature2',
                  'pricing.enterprise.feature3',
                ] as const
              ).map((key) => (
                <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-foreground" />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
            <Link to="/enterprise" className="btn-secondary w-full text-center">
              {t('pricing.ctaContact')}
            </Link>
          </article>
        ) : null}
      </div>
    </div>
  );
}
