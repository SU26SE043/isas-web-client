import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { CvAnalysisDomain } from '../../types/cvDomain.types';
import { CvFlowSectionCard } from './CvFlowSectionCard';

interface CvJobDescriptionStepProps {
  jobDescription: string;
  fileName?: string;
  domain?: CvAnalysisDomain | null;
  onJobDescriptionChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const CvJobDescriptionStep: React.FC<CvJobDescriptionStepProps> = ({
  jobDescription,
  fileName,
  domain,
  onJobDescriptionChange,
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();

  return (
    <CvFlowSectionCard title={t('cv.step.jobDescription')} description={t('cv.stepDesc.job-description')}>
      {fileName || domain ? (
        <div className="mb-4 space-y-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-muted-foreground">
          {domain ? (
            <p>
              {t('cv.selectedDomain')}:{' '}
              <span className="font-medium text-foreground">{t(`cv.domain.${domain}.title`)}</span>
            </p>
          ) : null}
          {fileName ? (
            <p>
              {t('cv.attachedFile')}: <span className="font-medium text-foreground">{fileName}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{t('cv.jdTitle')}</span>
        <span className="text-caption rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1">
          {t('cv.optional')}
        </span>
      </div>

      <textarea
        className="min-h-[220px] w-full resize-y rounded-2xl border border-white/10 bg-black/25 px-4 py-3.5 text-sm text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-200 ease-out focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
        placeholder={t('cv.jdPlaceholder')}
        value={jobDescription}
        onChange={(event) => onJobDescriptionChange(event.target.value)}
      />

      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li>{t('cv.tipJd')}</li>
        <li>{t('cv.tipKeywords')}</li>
      </ul>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" className="btn-secondary rounded-xl" onClick={onBack}>
          {t('cv.back')}
        </button>
        <button type="button" className="btn-primary rounded-xl" onClick={onNext}>
          {t('cv.next')}
        </button>
      </div>
    </CvFlowSectionCard>
  );
};
