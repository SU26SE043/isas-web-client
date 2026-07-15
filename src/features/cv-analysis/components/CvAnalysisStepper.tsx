import React from 'react';
import {
  FlowStepConnector,
  FlowStepMarker,
  flowStepLabelClass,
  resolveFlowStepStatus,
} from '@/components/ui/flow-stepper';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';

export type CvAnalysisStep = 'domain' | 'upload' | 'job-description' | 'analysis' | 'report';

const STEP_ORDER: CvAnalysisStep[] = ['domain', 'upload', 'job-description', 'analysis', 'report'];

const STEP_KEYS: Record<CvAnalysisStep, string> = {
  domain: 'cv.step.domain',
  upload: 'cv.step.upload',
  'job-description': 'cv.step.jobDescription',
  analysis: 'cv.step.analysis',
  report: 'cv.step.report',
};

interface CvAnalysisStepperProps {
  currentStep: CvAnalysisStep;
  /** Optional failed step (e.g. analysis error) — shows semantic red. */
  failedStep?: CvAnalysisStep;
  className?: string;
}

function stepIndex(step: CvAnalysisStep): number {
  return STEP_ORDER.indexOf(step);
}

export const CvAnalysisStepper: React.FC<CvAnalysisStepperProps> = ({
  currentStep,
  failedStep,
  className,
}) => {
  const { t } = useLanguage();
  const activeIndex = stepIndex(currentStep);
  const failedIndexes =
    failedStep != null ? [stepIndex(failedStep)].filter((index) => index >= 0) : undefined;

  return (
    <nav aria-label={t('cv.flowLabel')} className={cn('w-full', className)}>
      <ol className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
        {STEP_ORDER.map((step, index) => {
          const status = resolveFlowStepStatus(index, activeIndex, failedIndexes);
          const isLast = index === STEP_ORDER.length - 1;

          return (
            <li key={step} className="flex shrink-0 items-stretch gap-3 lg:w-full">
              <div className="flex flex-col items-center">
                <FlowStepMarker status={status} stepNumber={index + 1} />
                {!isLast ? (
                  <FlowStepConnector
                    status={status === 'complete' ? 'complete' : status === 'error' ? 'error' : 'pending'}
                    className="mt-1 hidden min-h-6 lg:block"
                  />
                ) : null}
              </div>

              <div className={cn('min-w-0 pt-1.5', !isLast && 'lg:pb-6')}>
                <p className={cn('text-sm font-medium leading-snug', flowStepLabelClass(status))}>
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
