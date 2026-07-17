import React from 'react';
import {
  FlowStepConnector,
  FlowStepMarker,
  flowStepLabelClass,
  type FlowStepStatus,
} from '@/components/ui/flow-stepper';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import {
  buildCvTimelineStatuses,
  CV_TIMELINE_STEPS,
  type CvTimelineStatuses,
} from '../utils/cvTimelineStatus';

export type CvAnalysisStep = 'domain' | 'upload' | 'job-description' | 'analysis' | 'report';

const STEP_KEYS: Record<CvAnalysisStep, string> = {
  domain: 'cv.step.domain',
  upload: 'cv.step.upload',
  'job-description': 'cv.step.jobDescription',
  analysis: 'cv.step.analysis',
  report: 'cv.step.report',
};

interface CvAnalysisStepperProps {
  currentStep: CvAnalysisStep;
  /** Explicit per-step statuses from live API/validation (preferred). */
  statuses?: CvTimelineStatuses;
  /** Fallback when statuses omitted — marks a single failed step. */
  failedStep?: CvAnalysisStep;
  className?: string;
}

function connectorStatus(status: FlowStepStatus): FlowStepStatus {
  if (status === 'complete') return 'complete';
  if (status === 'error') return 'error';
  if (status === 'processing' || status === 'current') return 'processing';
  return 'pending';
}

export const CvAnalysisStepper: React.FC<CvAnalysisStepperProps> = ({
  currentStep,
  statuses: statusesProp,
  failedStep,
  className,
}) => {
  const { t } = useLanguage();
  const activeIndex = CV_TIMELINE_STEPS.indexOf(currentStep);
  const statuses =
    statusesProp ??
    buildCvTimelineStatuses({
      activeIndex,
      failedStep: failedStep ?? null,
      isProcessing: false,
    });

  return (
    <nav aria-label={t('cv.flowLabel')} className={cn('w-full', className)}>
      <ol className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
        {CV_TIMELINE_STEPS.map((step, index) => {
          const status = statuses[step];
          const isLast = index === CV_TIMELINE_STEPS.length - 1;

          return (
            <li key={step} className="flex shrink-0 items-stretch gap-3 lg:w-full">
              <div className="flex flex-col items-center">
                <FlowStepMarker
                  status={status}
                  stepNumber={index + 1}
                  className={
                    status === 'current'
                      ? 'border-info bg-info-bg text-info'
                      : undefined
                  }
                />
                {!isLast ? (
                  <FlowStepConnector
                    status={connectorStatus(status)}
                    className="mt-1 hidden min-h-6 lg:block"
                  />
                ) : null}
              </div>

              <div className={cn('min-w-0 pt-1.5', !isLast && 'lg:pb-6')}>
                <p
                  className={cn(
                    'text-sm font-medium leading-snug',
                    flowStepLabelClass(status === 'current' ? 'processing' : status),
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
