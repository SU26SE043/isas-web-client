import { FlowWizardNav } from '@/components/patterns/flow-wizard/FlowWizardNav';
import { useLanguage } from '@/shared/languages';

interface PracticeWizardNavProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  isLoading?: boolean;
}

export function PracticeWizardNav({
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
  backDisabled = false,
  isLoading = false,
}: PracticeWizardNavProps) {
  const { t } = useLanguage();

  return (
    <FlowWizardNav
      backLabel={t('practice.wizard.back')}
      nextLabel={nextLabel ?? t('practice.wizard.next')}
      loadingLabel={t('practice.wizard.loading')}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={nextDisabled}
      backDisabled={backDisabled}
      isLoading={isLoading}
    />
  );
}
