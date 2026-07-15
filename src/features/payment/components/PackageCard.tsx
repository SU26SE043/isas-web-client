import { useLanguage } from '@/shared/languages';
import type { TokenPackage } from '../types/payment.types';

interface PackageCardProps {
  item: TokenPackage;
  language: 'vi' | 'en';
  selected?: boolean;
  onSelect: (packageId: string) => void;
}

export function PackageCard({ item, language, selected = false, onSelect }: PackageCardProps) {
  const { t } = useLanguage();
  const title = language === 'vi' ? item.nameVi : item.name;
  const description = language === 'vi' ? item.descriptionVi : item.description;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={[
        'flex h-full w-full flex-col rounded-xl border p-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
        selected ? 'border-default bg-surface-elevated' : 'border-subtle bg-surface-raised hover:bg-surface-overlay',
      ].join(' ')}
    >
      {item.popular ? (
        <span className="mb-3 inline-flex w-fit rounded-full bg-surface-overlay px-2 py-0.5 text-xs font-semibold text-foreground">
          {t('payment.plans.popular')}
        </span>
      ) : null}
      <h3 className="heading-secondary text-lg text-foreground">{title}</h3>
      <p className="body-text mt-2 flex-1 text-sm text-muted-foreground">{description}</p>
      <p className="mt-4 text-3xl font-semibold text-foreground">${item.priceUsd}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('payment.plans.tokenCount').replace('{count}', item.tokens.toLocaleString())}
      </p>
    </button>
  );
}
