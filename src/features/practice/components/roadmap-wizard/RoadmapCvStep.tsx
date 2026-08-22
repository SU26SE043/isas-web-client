import React from 'react';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CvAnalysisResult, UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import { RoadmapWizardNav } from './RoadmapWizardNav';

interface Props {
  files: UploadedCvFile[];
  analyses: CvAnalysisResult[];
  cvId?: string;
  analysisId?: string;
  onCvChange: (value: string | undefined) => void;
  onAnalysisChange: (value: string | undefined) => void;
  onBack: () => void;
  onNext: () => void;
}

export function RoadmapCvStep({ files, analyses, cvId, analysisId, onCvChange, onAnalysisChange, onBack, onNext }: Props) {
  const { t } = useLanguage();
  return (
    <SectionPanel icon={<FileText className="size-4" aria-hidden />} title={t('practice.roadmapWizard.cv.title')} description={t('practice.roadmapWizard.cv.description')}>
      <div className="mt-5 space-y-4">
        <label className="block space-y-2 text-sm">
          <span className="font-medium text-foreground">{t('practice.roadmapWizard.cv.file')}</span>
          <select value={cvId ?? ''} onChange={(event) => onCvChange(event.target.value || undefined)} className="h-10 w-full rounded-xl border border-satin bg-surface-overlay px-3 text-foreground">
            <option value="">{t('practice.roadmapWizard.cv.skip')}</option>
            {files.map((file) => <option key={file.id} value={file.id}>{file.fileName}</option>)}
          </select>
        </label>
        <label className="block space-y-2 text-sm">
          <span className="font-medium text-foreground">{t('practice.roadmapWizard.cv.analysis')}</span>
          <select value={analysisId ?? ''} onChange={(event) => onAnalysisChange(event.target.value || undefined)} className="h-10 w-full rounded-xl border border-satin bg-surface-overlay px-3 text-foreground">
            <option value="">{t('practice.roadmapWizard.cv.skip')}</option>
            {analyses.map((analysis) => <option key={analysis.id} value={analysis.id}>{analysis.jobCategory} · {new Date(analysis.createdAt).toLocaleDateString()}</option>)}
          </select>
        </label>
        <Link className="btn-ghost inline-flex text-sm" to="/candidate/cv/analysis">{t('practice.roadmapWizard.cv.newAnalysis')}</Link>
      </div>
      <RoadmapWizardNav onBack={onBack} onNext={onNext} />
    </SectionPanel>
  );
}
