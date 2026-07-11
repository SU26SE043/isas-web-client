import React from 'react';
import { useLanguage } from '@/shared/languages';
import { CvFlowSectionCard } from './CvFlowSectionCard';

interface CvJobDescriptionStepProps {
  jobDescription: string;
  fileName?: string;
  onJobDescriptionChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const CvJobDescriptionStep: React.FC<CvJobDescriptionStepProps> = ({
  jobDescription,
  fileName,
  onJobDescriptionChange,
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();

  return (
    <CvFlowSectionCard title={t('cv.step.jobDescription')} description={t('cv.stepDesc.job-description')}>
      {fileName ? (
        <p className="mb-4 rounded-lg border border-subtle bg-surface-overlay px-3 py-2 text-sm text-muted-foreground">
          {t('cv.attachedFile')}: <span className="font-medium text-foreground">{fileName}</span>
        </p>
      ) : null}

      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{t('cv.jdTitle')}</span>
        <span className="text-caption rounded-md border border-subtle bg-surface-overlay px-2 py-1">
          {t('cv.optional')}
        </span>
      </div>

      <textarea
        className="min-h-[200px] w-full resize-y rounded-lg border border-subtle bg-surface-base px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
        placeholder={t('cv.jdPlaceholder')}
        value={jobDescription}
        onChange={(event) => onJobDescriptionChange(event.target.value)}
      />

      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li>{t('cv.tipJd')}</li>
        <li>{t('cv.tipKeywords')}</li>
      </ul>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" className="btn-secondary" onClick={onBack}>
          {t('cv.back')}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {t('cv.next')}
        </button>
      </div>
    </CvFlowSectionCard>
  );
};
