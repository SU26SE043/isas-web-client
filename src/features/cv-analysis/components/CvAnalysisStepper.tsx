import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
export type CvAnalysisStep = 'upload' | 'job-description' | 'analysis' | 'report';

const STEP_ORDER: CvAnalysisStep[] = ['upload', 'job-description', 'analysis', 'report'];

const STEP_KEYS: Record<CvAnalysisStep, string> = {
  upload: 'cv.step.upload',
  'job-description': 'cv.step.jobDescription',
  analysis: 'cv.step.analysis',
  report: 'cv.step.report',
};

interface CvAnalysisStepperProps {
  currentStep: CvAnalysisStep;
  className?: string;
}

function stepIndex(step: CvAnalysisStep): number {
  return STEP_ORDER.indexOf(step);
}

export const CvAnalysisStepper: React.FC<CvAnalysisStepperProps> = ({ currentStep, className }) => {
  const { t } = useLanguage();
  const activeIndex = stepIndex(currentStep);

  return (
    <nav aria-label={t('cv.flowLabel')} className={cn('w-full', className)}>
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {STEP_ORDER.map((step, index) => {
          const isComplete = index < activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <li key={step} className="flex flex-1 items-center gap-3 sm:flex-col sm:gap-2 sm:text-center">
              <div className="flex items-center gap-3 sm:flex-col sm:gap-2">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                    isCurrent
                      ? 'border-foreground bg-foreground text-surface-base'
                      : isComplete
                        ? 'border-subtle bg-surface-elevated text-foreground'
                        : 'border-subtle bg-surface-overlay text-muted-foreground',
                  )}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div className="min-w-0 sm:px-1">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      isCurrent ? 'text-foreground' : 'text-muted-foreground',
                    )}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {t(STEP_KEYS[step])}
                  </p>
                  <p className="text-caption mt-0.5 hidden text-muted-foreground sm:block">
                    {t(`cv.stepDesc.${step}`)}
                  </p>
                </div>
              </div>
              {index < STEP_ORDER.length - 1 ? (
                <div
                  className={cn(
                    'hidden h-px flex-1 sm:block',
                    isComplete ? 'bg-foreground/30' : 'bg-surface-overlay',
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
