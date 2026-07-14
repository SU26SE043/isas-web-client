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
      <ol className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-0">
        {STEP_ORDER.map((step, index) => {
          const isComplete = index < activeIndex;
          const isCurrent = index === activeIndex;
          const isLast = index === STEP_ORDER.length - 1;

          return (
            <li key={step} className="flex flex-1 gap-3 sm:flex-col sm:gap-3">
              <div className="flex items-center sm:w-full">
                <span
                  className={cn(
                    'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-[background-color,border-color,box-shadow,color] duration-200 ease-out',
                    isCurrent
                      ? 'border-white/80 bg-white text-black shadow-[0_0_0_4px_rgb(255_255_255/0.08)]'
                      : isComplete
                        ? 'border-white/25 bg-white/10 text-foreground'
                        : 'border-white/10 bg-surface-overlay text-muted-foreground',
                  )}
                  aria-hidden
                >
                  {index + 1}
                </span>
                {!isLast ? (
                  <div
                    className={cn(
                      'mx-3 hidden h-px flex-1 sm:block',
                      isComplete ? 'bg-white/30' : 'bg-white/10',
                    )}
                    aria-hidden
                  />
                ) : null}
              </div>

              <div className="min-w-0 pr-2">
                <p
                  className={cn(
                    'text-sm font-semibold tracking-tight',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground',
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {t(STEP_KEYS[step])}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t(`cv.stepDesc.${step}`)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
