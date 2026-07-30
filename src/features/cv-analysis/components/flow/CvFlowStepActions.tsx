import { FlowWizardNav } from '@/components/patterns/flow-wizard/FlowWizardNav';
import { useLanguage } from '@/shared/languages';

interface CvFlowStepActionsProps {
  canNext: boolean;
  isBusy?: boolean;
  onBack?: () => void;
  onNext: () => void;
}

export function CvFlowStepActions({
  canNext,
  isBusy = false,
  onBack,
  onNext,
}: CvFlowStepActionsProps) {
  const { t } = useLanguage();

  return (
    <FlowWizardNav
      backLabel={t('cv.back')}
      nextLabel={t('cv.next')}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!canNext}
      backDisabled={!onBack}
      isLoading={isBusy}
    />
  );
}
