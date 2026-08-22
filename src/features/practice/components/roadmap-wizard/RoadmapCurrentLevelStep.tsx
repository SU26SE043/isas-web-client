import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import { ROADMAP_TARGET_LEVELS, type RoadmapTargetLevel } from '../../mocks/practiceSetup.fixtures';
import { RoadmapWizardNav } from './RoadmapWizardNav';

interface Props { value: RoadmapTargetLevel; source: 'cv' | 'default' | 'manual'; onChange: (value: RoadmapTargetLevel) => void; onBack: () => void; onNext: () => void; }
export function RoadmapCurrentLevelStep({ value, source, onChange, onBack, onNext }: Props) {
  const { t } = useLanguage();
  return <SectionPanel title={t('practice.roadmapWizard.currentLevel.title')} description={t('practice.roadmapWizard.currentLevel.description')}>
    <label className="mt-5 block space-y-2 text-sm"><span className="font-medium text-foreground">{t('practice.roadmapWizard.currentLevel.label')}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as RoadmapTargetLevel)} className="h-10 w-full rounded-xl border border-satin bg-surface-overlay px-3 text-foreground">
        {ROADMAP_TARGET_LEVELS.map((level) => <option key={level} value={level}>{t(`practice.roadmapWizard.level.${level}`)}</option>)}
      </select>
    </label>
    <p className="mt-3 text-caption text-muted-foreground">{source === 'cv' ? t('practice.roadmapWizard.currentLevel.fromCv') : t('practice.roadmapWizard.currentLevel.default')}</p>
    <RoadmapWizardNav onBack={onBack} onNext={onNext} />
  </SectionPanel>;
}
