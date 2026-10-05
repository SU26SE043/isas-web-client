import { BriefcaseBusiness } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PracticeSeniority } from '../../types/b2cPracticeSession.types';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardOptionCard } from './PracticeWizardOptionCard';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

const SENIORITIES: PracticeSeniority[] = ['Fresher', 'Junior', 'Middle', 'Senior'];

interface PracticeSeniorityStepProps {
  /** null = chưa chọn. Không tiền chọn mức nào — xem `usePracticeSetupFlow`. */
  value: PracticeSeniority | null;
  disabled?: boolean;
  onSelect: (value: PracticeSeniority) => void;
  onBack: () => void;
  onNext: () => void;
}

export function PracticeSeniorityStep({
  value,
  disabled,
  onSelect,
  onBack,
  onNext,
}: PracticeSeniorityStepProps) {
  const { t } = useLanguage();

  return (
    <PracticeWizardStepCard
      icon={<BriefcaseBusiness className="size-4" aria-hidden />}
      title={t('practice.wizard.level.title')}
      description={t('practice.wizard.level.description')}
      footer={<PracticeWizardNav onBack={onBack} onNext={onNext} nextDisabled={!value || disabled} />}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {SENIORITIES.map((seniority) => (
          <PracticeWizardOptionCard
            key={seniority}
            title={t(`practice.wizard.level.${seniority.toLowerCase()}`)}
            description={t(`practice.wizard.level.${seniority.toLowerCase()}.desc`)}
            selected={value === seniority}
            disabled={disabled}
            showChevron={false}
            onClick={() => onSelect(seniority)}
          />
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{t('practice.wizard.level.footerHint')}</p>
    </PracticeWizardStepCard>
  );
}
