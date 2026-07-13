import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PracticeDomain } from '../../types/practiceSetup.types';
import { PracticeWizardNav } from './PracticeWizardNav';

interface PracticeDomainStepProps {
  domains: PracticeDomain[];
  selectedId: string;
  isLoading: boolean;
  onSelect: (domainId: string) => void;
  onNext: () => void;
}

export const PracticeDomainStep: React.FC<PracticeDomainStepProps> = ({
  domains,
  selectedId,
  isLoading,
  onSelect,
  onNext,
}) => {
  const { language, t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-subtle bg-surface-raised">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('practice.wizard.domain.title')}</h2>
      <p className="body-text mt-1 text-sm">{t('practice.wizard.domain.description')}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {domains.map((domain) => {
          const isSelected = domain.id === selectedId;
          const label = language === 'vi' ? domain.nameVi : domain.name;
          const description = language === 'vi' ? domain.descriptionVi : domain.description;
          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => onSelect(domain.id)}
              className={[
                'rounded-xl border p-4 text-left transition',
                isSelected
                  ? 'border-default bg-surface-elevated'
                  : 'border-subtle bg-surface-overlay hover:border-default',
              ].join(' ')}
              aria-pressed={isSelected}
            >
              <p className="font-medium text-foreground">{label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </button>
          );
        })}
      </div>

      <PracticeWizardNav nextDisabled={!selectedId} onNext={onNext} backDisabled />
    </section>
  );
};
