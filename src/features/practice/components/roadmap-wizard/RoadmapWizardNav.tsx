import { FlowWizardNav } from '@/components/patterns/flow-wizard/FlowWizardNav';
import { useLanguage } from '@/shared/languages';

interface RoadmapWizardNavProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  isLoading?: boolean;
}

export function RoadmapWizardNav({
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
  backDisabled = false,
  isLoading = false,
}: RoadmapWizardNavProps) {
  const { t } = useLanguage();

  return (
    <FlowWizardNav
      backLabel={t('practice.roadmapWizard.back')}
      nextLabel={nextLabel ?? t('practice.roadmapWizard.next')}
      loadingLabel={t('practice.roadmapWizard.loading')}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={nextDisabled}
      backDisabled={backDisabled}
      isLoading={isLoading}
    />
  );
}
