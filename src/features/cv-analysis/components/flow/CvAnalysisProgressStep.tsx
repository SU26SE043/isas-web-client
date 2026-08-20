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
  /** How many requirements the report will be matched against (0 = none). */
  requirementCount?: number;
  onAnalyze: () => void;
  onBack: () => void;
  onRetryUpload?: () => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <dt className="shrink-0 text-sm text-muted-foreground sm:w-40">{label}</dt>
      <dd className="min-w-0 break-words text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

/**
 * Steps 3 and 4. Step 3 is the read-only confirmation that spends a credit;
 * step 4 is the running analysis. They used to share one screen labelled "AI
 * analysis" that in fact asked the user to review and edit requirements — the
 * editing now lives in step 2, where the JD it belongs to is on screen.
 */
export const CvAnalysisProgressStep: React.FC<CvAnalysisProgressStepProps> = ({
  parseProgress,
  isAnalyzing,
  parseError,
  fileName,
  jdFileName,
  domain,
  hasJd = false,
  requirementCount = 0,
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

  const requirementLine =
    requirementCount > 0
      ? t('cv.confirm.requirementCount').replace('{count}', String(requirementCount))
      : t('cv.confirm.requirementNone');

  return (
    <CvFlowSectionCard title={t('cv.step.confirm')} description={t('cv.stepDesc.confirm')}>
      <dl className="space-y-3 rounded-xl border border-satin bg-white/[0.04] px-4 py-4">
        {domain ? (
          <SummaryRow label={t('cv.selectedDomain')} value={t(`cv.domain.${domain}.title`)} />
        ) : null}
        {fileName ? <SummaryRow label={t('cv.attachedFile')} value={fileName} /> : null}
        <SummaryRow
          label={t('cv.jdTitle')}
          value={hasJd ? jdFileName || t('cv.jdUploaded') : t('cv.jdSkipped')}
        />
        <SummaryRow label={t('cv.confirm.requirementLabel')} value={requirementLine} />
      </dl>

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
