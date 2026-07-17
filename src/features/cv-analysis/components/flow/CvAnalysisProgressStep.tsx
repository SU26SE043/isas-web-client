import React from 'react';
import { XCircle } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { CvAnalysisDomain } from '../../types/cvDomain.types';
import { AnalyzeButton } from './AnalyzeButton';
import { CvFlowSectionCard } from './CvFlowSectionCard';

interface CvAnalysisProgressStepProps {
  parseProgress: number;
  isAnalyzing: boolean;
  parseError?: string | null;
  fileName?: string;
  jdFileName?: string | null;
  domain?: CvAnalysisDomain | null;
  hasJd?: boolean;
  onAnalyze: () => void;
  onBack: () => void;
  onRetryUpload?: () => void;
}

export const CvAnalysisProgressStep: React.FC<CvAnalysisProgressStepProps> = ({
  parseProgress,
  isAnalyzing,
  parseError,
  fileName,
  jdFileName,
  domain,
  hasJd = false,
  onAnalyze,
  onBack,
  onRetryUpload,
}) => {
  const { t } = useLanguage();

  if (parseError) {
    return (
      <CvFlowSectionCard title={t('cv.step.analysis')} description={t('cv.stepDesc.analysis')}>
        <div className="flex flex-col items-center py-8 text-center" role="alert">
          <XCircle className="size-10 text-error" aria-hidden />
          <p className="mt-4 text-base font-semibold text-error">{t('cv.parseFailedTitle')}</p>
          <p className="body-text mt-2 max-w-md">{parseError}</p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <button type="button" className="btn-secondary rounded-xl" onClick={onBack}>
              {t('cv.back')}
            </button>
            {onRetryUpload ? (
              <button type="button" className="btn-secondary rounded-xl" onClick={onRetryUpload}>
                {t('cv.retryUpload')}
              </button>
            ) : null}
            <AnalyzeButton onClick={onAnalyze} />
          </div>
        </div>
      </CvFlowSectionCard>
    );
  }

  if (isAnalyzing) {
    return (
      <CvFlowSectionCard title={t('cv.step.analysis')} description={t('cv.stepDesc.analysis')}>
        <div className="flex flex-col items-center py-8 text-center" aria-live="polite">
          <div
            className="size-10 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground"
            aria-hidden
          />
          <p className="mt-4 text-base font-semibold text-foreground">{t('cv.parseProgress')}</p>
          <p className="body-text mt-2 max-w-md">{t('cv.parseProgressHint')}</p>
          <div className="mt-6 h-2 w-full max-w-md overflow-hidden rounded-full bg-surface-overlay">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-300"
              style={{ width: `${parseProgress}%` }}
              role="progressbar"
              aria-valuenow={parseProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('cv.parseProgress')}
            />
          </div>
          <p className="text-caption mt-2 text-muted-foreground">{parseProgress}%</p>
          <AnalyzeButton onClick={onAnalyze} loading className="mt-6" />
        </div>
      </CvFlowSectionCard>
    );
  }

  return (
    <CvFlowSectionCard title={t('cv.step.analysis')} description={t('cv.stepDesc.analysisReady')}>
      <div className="space-y-4 rounded-xl border border-satin bg-white/[0.04] px-4 py-4 text-sm text-muted-foreground">
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
        <p>
          {t('cv.jdTitle')}:{' '}
          <span className="font-medium text-foreground">
            {hasJd ? jdFileName || t('cv.jdUploaded') : t('cv.jdSkipped')}
          </span>
        </p>
      </div>

      <p className="body-text mt-6 max-w-xl">{t('cv.analyzeHint')}</p>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" className="btn-secondary rounded-xl" onClick={onBack}>
          {t('cv.back')}
        </button>
        <AnalyzeButton onClick={onAnalyze} disabled={isAnalyzing} />
      </div>
    </CvFlowSectionCard>
  );
};
