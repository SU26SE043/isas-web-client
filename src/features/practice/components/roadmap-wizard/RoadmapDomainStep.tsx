import React from 'react';
import { Briefcase, Code2, Layers, Server } from 'lucide-react';
import { SelectionOption } from '@/components/ui/selection-option';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { JobDomainId } from '@/shared/domain/jobDomains';
import { isJobDomainId } from '@/shared/domain/jobDomains';
import type { PracticeDomain } from '../../types/practiceSetup.types';
import { RoadmapWizardNav } from './RoadmapWizardNav';

const DOMAIN_ICONS: Record<JobDomainId, React.ReactNode> = {
  frontend: <Code2 className="size-5" aria-hidden />,
  backend: <Server className="size-5" aria-hidden />,
  'business-analyst': <Briefcase className="size-5" aria-hidden />,
};

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
      title={t('practice.roadmapWizard.domain.title')}
      description={t('practice.roadmapWizard.domain.description')}
      isLoading={isLoading}
      footer={<RoadmapWizardNav nextDisabled={!selectedId} onNext={onNext} backDisabled />}
    >
      <div
        className="grid gap-3 sm:grid-cols-1"
        role="radiogroup"
        aria-label={t('practice.roadmapWizard.domain.groupLabel')}
      >
        {domains.map((domain) => {
          const label = language === 'vi' ? domain.nameVi : domain.name;
          const description = language === 'vi' ? domain.descriptionVi : domain.description;
          const icon =
            isJobDomainId(domain.id) && DOMAIN_ICONS[domain.id]
              ? DOMAIN_ICONS[domain.id]
              : <Layers className="size-5" aria-hidden />;

          return (
            <SelectionOption
              key={domain.id}
              icon={icon}
              title={label}
              description={description}
              selected={domain.id === selectedId}
              onClick={() => onSelect(domain.id)}
              className="w-full"
            />
          );
        })}
      </div>
    </SectionPanel>
  );
};
