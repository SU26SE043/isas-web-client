import React from 'react';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { LearningRoadmapCard } from '../../types/learningPath.types';
import { RoadmapWizardNav } from './RoadmapWizardNav';

export function RoadmapPriorStep({ roadmaps, value, onChange, onBack, onNext }: { roadmaps: LearningRoadmapCard[]; value?: string; onChange: (value?: string) => void; onBack: () => void; onNext: () => void }) {
  const { language, t } = useLanguage();
  return <SectionPanel title={t('practice.roadmapWizard.prior.title')} description={t('practice.roadmapWizard.prior.description')}>
    <label className="mt-5 block space-y-2 text-sm"><span className="font-medium text-foreground">{t('practice.roadmapWizard.prior.label')}</span>
      <select value={value ?? ''} onChange={(event) => onChange(event.target.value || undefined)} className="h-10 w-full rounded-xl border border-satin bg-surface-overlay px-3 text-foreground">
        <option value="">{t('practice.roadmapWizard.cv.skip')}</option>
        {roadmaps.map((roadmap) => <option key={roadmap.id} value={roadmap.id}>{language === 'vi' ? roadmap.nameVi : roadmap.name}</option>)}
      </select>
    </label><RoadmapWizardNav onBack={onBack} onNext={onNext} />
  </SectionPanel>;
}
