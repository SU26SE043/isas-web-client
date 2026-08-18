import type { FlowStepStatus } from '@/components/ui/flow-stepper';
import type { CvAnalysisStep } from '../components/CvAnalysisStepper';

export const CV_TIMELINE_STEPS: readonly CvAnalysisStep[] = [
  'domain',
  'upload',
  'job-description',
  'analysis',
  'report',
] as const;

export type CvTimelineStatuses = Record<CvAnalysisStep, FlowStepStatus>;

export interface BuildCvTimelineInput {
  /** 0=domain … 4=report */
  activeIndex: number;
  failedStep?: CvAnalysisStep | null;
  /** True while an API call for the active step is in flight. */
  isProcessing?: boolean;
}

/**
 * Build real-time timeline statuses.
 * - Completed steps before the active/failed one stay green.
 * - At most one Processing step.
 * - Failed step is red; all later steps reset to Pending.
 */
export function buildCvTimelineStatuses({
  activeIndex,
  failedStep = null,
  isProcessing = false,
}: BuildCvTimelineInput): CvTimelineStatuses {
  const failedIndex = failedStep ? CV_TIMELINE_STEPS.indexOf(failedStep) : -1;
  const statuses = {} as CvTimelineStatuses;

  CV_TIMELINE_STEPS.forEach((step, index) => {
    if (failedIndex >= 0) {
      if (index < failedIndex) {
        statuses[step] = 'complete';
      } else if (index === failedIndex) {
        statuses[step] = 'error';
      } else {
        statuses[step] = 'pending';
      }
      return;
    }

    if (index < activeIndex) {
      statuses[step] = 'complete';
    } else if (index === activeIndex) {
      statuses[step] = isProcessing ? 'processing' : 'current';
    } else {
      statuses[step] = 'pending';
    }
  });

  return statuses;
}
