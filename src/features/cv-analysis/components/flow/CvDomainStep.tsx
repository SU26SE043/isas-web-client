import { CareerPositionSelector } from '@/components/patterns/flow-wizard/CareerPositionSelector';
import { FlowWizardNav } from '@/components/patterns/flow-wizard/FlowWizardNav';
import type { JobDomainId } from '@/shared/domain/jobDomains';
import { useLanguage } from '@/shared/languages';
import type { CvAnalysisDomain } from '../../types/cvDomain.types';
import { CvFlowSectionCard } from './CvFlowSectionCard';

interface CvDomainStepProps {
  domain: CvAnalysisDomain | null;
  onSelect: (domain: CvAnalysisDomain) => void;
  onNext: () => void;
}

export function CvDomainStep({ domain, onSelect, onNext }: CvDomainStepProps) {
  const { t } = useLanguage();

  return (
    <CvFlowSectionCard title={t('cv.step.domain')} className="min-h-[calc(100dvh-3rem)]">
      <div className="flex h-full flex-col">
        <CareerPositionSelector
          selectedId={domain}
          onSelect={(id: JobDomainId) => onSelect(id)}
          accent="indigo"
          ariaLabel={t('cv.domain.groupLabel')}
        />

        <div className="mt-auto pt-6">
          <FlowWizardNav
            backLabel={t('cv.back')}
            nextLabel={t('cv.next')}
            onNext={onNext}
            nextDisabled={!domain}
            backDisabled
          />
        </div>
      </div>
    </CvFlowSectionCard>
  );
}
