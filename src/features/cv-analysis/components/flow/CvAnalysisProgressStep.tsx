import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { CvFlowSectionCard } from './CvFlowSectionCard';

interface CvAnalysisProgressStepProps {
  parseProgress: number;
  parseError?: string | null;
  onRetry?: () => void;
}

export const CvAnalysisProgressStep: React.FC<CvAnalysisProgressStepProps> = ({
  parseProgress,
  parseError,
  onRetry,
}) => {
  const { t } = useLanguage();

  if (parseError) {
    return (
      <CvFlowSectionCard title={t('cv.step.analysis')} description={t('cv.stepDesc.analysis')}>
        <div className="flex flex-col items-center py-8 text-center" role="alert">
          <AlertTriangle className="size-10 text-warning" aria-hidden />
          <p className="mt-4 text-base font-semibold text-foreground">{t('cv.parseFailedTitle')}</p>
          <p className="body-text mt-2 max-w-md">{parseError}</p>
          {onRetry ? (
            <button type="button" className="btn-primary mt-6" onClick={onRetry}>
              {t('cv.retryUpload')}
            </button>
          ) : null}
        </div>
      </CvFlowSectionCard>
    );
  }

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
      </div>
    </CvFlowSectionCard>
  );
};
