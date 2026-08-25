import { SelectionOption } from '@/components/ui/selection-option';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { PracticeDomain } from '../../types/practiceSetup.types';
import { RoadmapWizardNav } from './RoadmapWizardNav';

interface RoadmapDomainStepProps {
  domains: PracticeDomain[];
  selectedId: string;
  isLoading: boolean;
  onSelect: (domainId: string) => void;
  onNext: () => void;
  reportCounts?: Record<string, number>;
}

export function RoadmapDomainStep({
  domains,
  selectedId,
  isLoading,
  onSelect,
  onNext,
  reportCounts = {},
}: RoadmapDomainStepProps) {
  const { language, t } = useLanguage();
  const getDomainTitle = (domain: PracticeDomain) => {
    const title = language === 'vi' ? domain.nameVi : domain.name;
    return language === 'en' ? title.replace(/ Developer$/, '') : title;
  };

  return (
    <SectionPanel
      title={t('practice.roadmapWizard.domain.title')}
      description={t('practice.roadmapWizard.domain.description')}
      isLoading={isLoading}
      footer={<RoadmapWizardNav nextDisabled={!selectedId} onNext={onNext} backDisabled />}
    >
      <div className="grid grid-cols-1 gap-4">
        {domains.map((domain) => (
          <SelectionOption
            key={domain.id}
            title={getDomainTitle(domain)}
            description={language === 'vi' ? domain.descriptionVi : domain.description}
            meta={t('practice.roadmapWizard.reports.countBadge').replace('{count}', String(reportCounts[domain.id] ?? 0))}
            selected={domain.id === selectedId}
            onClick={() => onSelect(domain.id)}
          />
        ))}
      </div>
    </SectionPanel>
  );
}
