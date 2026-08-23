import { useLanguage } from '@/shared/languages';
import type { CvAnalysisResult } from '@/features/cv-analysis/types/cvAnalysis.types';
import type { LearningRoadmapCard } from '../../types/learningPath.types';

export function RoadmapConfirmSources({
  cvAnalyses,
  cvAnalysisId,
  onCvAnalysisChange,
  completedRoadmaps,
  priorRoadmapId,
  onPriorRoadmapChange,
  isSubmitting,
}: {
  cvAnalyses: CvAnalysisResult[];
  cvAnalysisId?: string;
  onCvAnalysisChange: (value: string | undefined) => void;
  completedRoadmaps: LearningRoadmapCard[];
  priorRoadmapId?: string;
  onPriorRoadmapChange: (value: string | undefined) => void;
  isSubmitting: boolean;
}) {
  const { language, t } = useLanguage();
  return <>
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle py-2">
      <dt className="text-muted-foreground">{t('practice.roadmapWizard.confirm.cvAnalysis')}</dt>
      {cvAnalyses.length > 0 ? <dd><label className="sr-only" htmlFor="roadmap-confirm-analysis">{t('practice.roadmapWizard.confirm.cvAnalysis')}</label><select id="roadmap-confirm-analysis" aria-label={t('practice.roadmapWizard.confirm.cvAnalysis')} value={cvAnalysisId ?? ''} onChange={(event) => onCvAnalysisChange(event.target.value || undefined)} disabled={isSubmitting} className="min-w-0 max-w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-right font-medium text-foreground"><option value="">{t('practice.roadmapWizard.confirm.notSelected')}</option>{cvAnalyses.map((analysis) => <option key={analysis.id} value={analysis.id}>{analysis.jobCategory} · {new Date(analysis.createdAt).toLocaleDateString()}</option>)}</select></dd> : <dd className="max-w-[70%] text-right font-medium text-muted-foreground">{t('practice.roadmapWizard.confirm.cvAnalysisNone')}</dd>}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle py-2">
      <dt className="text-muted-foreground">{t('practice.roadmapWizard.confirm.priorRoadmap')}</dt>
      {completedRoadmaps.length > 0 ? <dd><label className="sr-only" htmlFor="roadmap-confirm-prior">{t('practice.roadmapWizard.confirm.priorRoadmap')}</label><select id="roadmap-confirm-prior" aria-label={t('practice.roadmapWizard.confirm.priorRoadmap')} value={priorRoadmapId ?? ''} onChange={(event) => onPriorRoadmapChange(event.target.value || undefined)} disabled={isSubmitting} className="min-w-0 max-w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-right font-medium text-foreground"><option value="">{t('practice.roadmapWizard.confirm.notSelected')}</option>{completedRoadmaps.map((roadmap) => <option key={roadmap.id} value={roadmap.id}>{language === 'vi' ? roadmap.nameVi : roadmap.name}</option>)}</select></dd> : <dd className="max-w-[70%] text-right font-medium text-muted-foreground">{t('practice.roadmapWizard.confirm.priorRoadmapNone')}</dd>}
    </div>
  </>;
}
