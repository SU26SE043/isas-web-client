import React from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { SectionPanel } from '@/components/ui/section-panel';
import { SelectionOption } from '@/components/ui/selection-option';
import { useLanguage } from '@/shared/languages';
import type { RoadmapMode } from '../../types/learning.types';
import { RoadmapWizardNav } from './RoadmapWizardNav';

interface RoadmapModeStepProps {
  selectedMode: RoadmapMode;
  selectedSessionCount: number;
  onSelect: (mode: RoadmapMode) => void;
  onBack: () => void;
  onNext: () => void;
  onBackToReports: () => void;
}

export const RoadmapModeStep: React.FC<RoadmapModeStepProps> = ({
  selectedMode,
  selectedSessionCount,
  onSelect,
  onBack,
  onNext,
  onBackToReports,
}) => {
  const { t } = useLanguage();
  const reinforceDisabled = selectedSessionCount < 2;

  return (
    <SectionPanel title={t('practice.roadmapWizard.mode.title')} description={t('practice.roadmapWizard.mode.description')}>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <SelectionOption
          title={t('practice.roadmapWizard.mode.levelUp')}
          description={t('practice.roadmapWizard.mode.levelUpDescription')}
          icon={<TrendingUp className="size-6" aria-hidden />}
          selected={selectedMode === 'LevelUp'}
          onClick={() => onSelect('LevelUp')}
          showChevron={false}
        />
        <div>
          <SelectionOption
            title={t('practice.roadmapWizard.mode.reinforce')}
            description={reinforceDisabled ? t('practice.roadmapWizard.mode.reinforceDisabled') : t('practice.roadmapWizard.mode.reinforceDescription')}
            icon={<RefreshCw className="size-6" aria-hidden />}
            selected={selectedMode === 'Reinforce'}
            onClick={() => onSelect('Reinforce')}
            disabled={reinforceDisabled}
            showChevron={false}
          />
          {reinforceDisabled ? (
            <button type="button" onClick={onBackToReports} className="mt-2 text-left text-xs text-info underline-offset-4 hover:underline">
              {t('practice.roadmapWizard.mode.backToReports')}
            </button>
          ) : null}
        </div>
      </div>
      <RoadmapWizardNav onBack={onBack} onNext={onNext} nextDisabled={!selectedMode} />
    </SectionPanel>
  );
};
