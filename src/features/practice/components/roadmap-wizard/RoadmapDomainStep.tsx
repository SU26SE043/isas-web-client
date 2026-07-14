import React from 'react';
import { Layers } from 'lucide-react';
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
}

export const RoadmapDomainStep: React.FC<RoadmapDomainStepProps> = ({
  domains,
  selectedId,
  isLoading,
  onSelect,
  onNext,
}) => {
  const { language, t } = useLanguage();

  return (
    <SectionPanel
      icon={<Layers className="size-4" aria-hidden />}
      title={t('practice.roadmapWizard.domain.title')}
      description={t('practice.roadmapWizard.domain.description')}
      isLoading={isLoading}
      footer={<RoadmapWizardNav nextDisabled={!selectedId} onNext={onNext} backDisabled />}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {domains.map((domain) => {
          const label = language === 'vi' ? domain.nameVi : domain.name;
          const description = language === 'vi' ? domain.descriptionVi : domain.description;
          return (
            <SelectionOption
              key={domain.id}
              title={label}
              description={description}
              selected={domain.id === selectedId}
              onClick={() => onSelect(domain.id)}
            />
          );
        })}
      </div>
    </SectionPanel>
  );
};
