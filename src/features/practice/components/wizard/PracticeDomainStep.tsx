import React from 'react';
import {
  Database,
  Layers,
  Monitor,
  Server,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PracticeDomain } from '../../types/practiceSetup.types';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardOptionCard } from './PracticeWizardOptionCard';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  frontend: <Monitor className="size-5" aria-hidden />,
  backend: <Server className="size-5" aria-hidden />,
  fullstack: <Layers className="size-5" aria-hidden />,
  mobile: <Smartphone className="size-5" aria-hidden />,
  data: <Database className="size-5" aria-hidden />,
  qa: <ShieldCheck className="size-5" aria-hidden />,
};

interface PracticeDomainStepProps {
  domains: PracticeDomain[];
  selectedId: string;
  isLoading: boolean;
  onSelect: (domainId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PracticeDomainStep: React.FC<PracticeDomainStepProps> = ({
  domains,
  selectedId,
  isLoading,
  onSelect,
  onNext,
  onBack,
}) => {
  const { language, t } = useLanguage();

  return (
    <PracticeWizardStepCard
      icon={<Layers className="size-4" aria-hidden />}
      title={t('practice.wizard.domain.title')}
      description={t('practice.wizard.domain.description')}
      isLoading={isLoading}
      footer={<PracticeWizardNav nextDisabled={!selectedId} onNext={onNext} onBack={onBack} />}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {domains.map((domain) => {
          const label = language === 'vi' ? domain.nameVi : domain.name;
          const description = language === 'vi' ? domain.descriptionVi : domain.description;
          return (
            <PracticeWizardOptionCard
              key={domain.id}
              title={label}
              description={description}
              icon={DOMAIN_ICONS[domain.id] ?? <Layers className="size-5" aria-hidden />}
              selected={domain.id === selectedId}
              onClick={() => onSelect(domain.id)}
            />
          );
        })}
      </div>
    </PracticeWizardStepCard>
  );
};
