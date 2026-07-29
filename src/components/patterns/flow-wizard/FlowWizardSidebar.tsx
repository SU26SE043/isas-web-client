import {
  FlowStepConnector,
  FlowStepMarker,
  flowStepLabelClass,
  resolveFlowStepStatus,
  type FlowStepStatus,
} from '@/components/ui/flow-stepper';
import { cn } from '@/lib/utils';
import { FLOW_WIZARD_ACCENT, type FlowWizardAccent } from './flowWizardAccent';

export interface FlowWizardSidebarProps {
  accent: FlowWizardAccent;
  steps: readonly string[];
  currentStep: number;
  ariaLabel: string;
  failedIndexes?: readonly number[];
  resolveStatus?: (index: number, currentStep: number) => FlowStepStatus;
  onStepClick?: (index: number) => void;
  className?: string;
}

function connectorStatus(status: FlowStepStatus): FlowStepStatus {
  if (status === 'complete') return 'complete';
  if (status === 'error') return 'error';
  if (status === 'processing' || status === 'current') return 'processing';
  return 'pending';
}

export function FlowWizardSidebar({
  accent,
  steps,
  currentStep,
  ariaLabel,
  failedIndexes,
  resolveStatus,
  onStepClick,
  className,
}: FlowWizardSidebarProps) {
  const accentTokens = FLOW_WIZARD_ACCENT[accent];

  return (
    <nav aria-label={ariaLabel} className={cn('w-full', className)}>
      <ol className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
        {steps.map((label, index) => {
          const status =
            resolveStatus?.(index, currentStep) ??
            resolveFlowStepStatus(index, currentStep, failedIndexes);
          const isLast = index === steps.length - 1;
          const isActive = status === 'current' || status === 'processing';
          const isComplete = status === 'complete';
          const canClick = Boolean(onStepClick) && index <= currentStep;

          return (
            <li key={`${label}-${index}`} className="flex shrink-0 items-stretch gap-3 lg:w-full">
              <div className="flex flex-col items-center">
                <FlowStepMarker
                  status={status}
                  stepNumber={index + 1}
                  className={cn(
                    'transition-[background-color,border-color,color,box-shadow] duration-200 ease-out',
                    isActive ? accentTokens.markerActive : undefined,
                    isComplete ? 'border-success bg-success-bg text-success' : undefined,
                  )}
                />
                {!isLast ? (
                  <FlowStepConnector
                    status={connectorStatus(status)}
                    className={cn(
                      'mt-1 hidden min-h-6 transition-colors duration-200 ease-out lg:block',
                      isComplete ? accentTokens.connectorComplete : undefined,
                    )}
                  />
                ) : null}
              </div>

              <div className={cn('min-w-0 pt-1.5', !isLast && 'lg:pb-6')}>
                {canClick ? (
                  <button
                    type="button"
                    onClick={() => onStepClick?.(index)}
                    className={cn(
                      'block text-left text-sm font-semibold leading-snug transition-colors duration-200 ease-out lg:text-base',
                      isActive
                        ? accentTokens.labelActive
                        : flowStepLabelClass(isComplete ? 'complete' : status),
                      'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {label}
                  </button>
                ) : (
                  <span
                    className={cn(
                      'block text-sm font-semibold leading-snug transition-colors duration-200 ease-out lg:text-base',
                      isActive
                        ? accentTokens.labelActive
                        : flowStepLabelClass(isComplete ? 'complete' : status),
                    )}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {label}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
