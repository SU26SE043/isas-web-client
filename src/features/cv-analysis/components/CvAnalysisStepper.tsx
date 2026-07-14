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
      <ol className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
        {STEP_ORDER.map((step, index) => {
          const isComplete = index < activeIndex;
          const isCurrent = index === activeIndex;
          const isLast = index === STEP_ORDER.length - 1;

          return (
            <li key={step} className="flex shrink-0 items-stretch gap-3 lg:w-full">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-[background-color,border-color,color] duration-200 ease-out',
                    isCurrent
                      ? 'border-white bg-white text-black'
                      : isComplete
                        ? 'border-white/30 bg-white/10 text-foreground'
                        : 'border-white/15 bg-transparent text-muted-foreground',
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-hidden
                >
                  {index + 1}
                </span>
                {!isLast ? (
                  <div
                    className={cn(
                      'mt-1 hidden w-px flex-1 min-h-6 lg:block',
                      isComplete ? 'bg-white/25' : 'bg-white/10',
                    )}
                    aria-hidden
                  />
                ) : null}
              </div>

              <div className={cn('min-w-0 pt-1.5', !isLast && 'lg:pb-6')}>
                <p
                  className={cn(
                    'text-sm font-medium leading-snug',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {t(STEP_KEYS[step])}
                </p>
                <p className="mt-1 hidden text-xs leading-relaxed text-muted-foreground lg:block">
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
