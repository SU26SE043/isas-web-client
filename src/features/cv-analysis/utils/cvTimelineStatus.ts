import type { FlowStepStatus } from '@/components/ui/flow-stepper';

/**
 * The six timeline steps of the B2C CV analysis flow.
 *
 * `domain` comes first because `jobCategory` is a required input of both
 * /jd-requirements and /cv-analysis, so it has to be settled before the JD
 * step. `confirm` used to be fused into `analysis`: one screen was titled "AI
 * analysis" while it actually asked the user to review inputs and spend a
 * credit. Splitting them means the timeline says what is happening — reviewing
 * versus running.
 */
export type CvAnalysisStep = 'domain' | 'cv' | 'job' | 'confirm' | 'analysis' | 'report';

export const CV_TIMELINE_STEPS: readonly CvAnalysisStep[] = [
  'domain',
  'cv',
  'job',
  'confirm',
  'analysis',
  'report',
] as const;

/**
 * Single source of the stepper labels. Both the sidebar (`CvAnalysisStepper`)
 * and the page shell (`CvAnalysisFlowShell`) read this map; they used to keep
 * private copies that could drift apart.
 */
export const CV_TIMELINE_STEP_LABEL_KEYS: Record<CvAnalysisStep, string> = {
  domain: 'cv.step.domain',
  cv: 'cv.step.cv',
  job: 'cv.step.job',
  confirm: 'cv.step.confirm',
  analysis: 'cv.step.analysis',
  report: 'cv.step.report',
};

export type CvTimelineStatuses = Record<CvAnalysisStep, FlowStepStatus>;

export interface BuildCvTimelineInput {
  /** 0=domain … 5=report */
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
