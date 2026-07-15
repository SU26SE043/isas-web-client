import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FlowStepStatus = 'complete' | 'current' | 'pending' | 'error';

export function resolveFlowStepStatus(
  index: number,
  currentIndex: number,
  failedIndexes?: readonly number[],
): FlowStepStatus {
  if (failedIndexes?.includes(index)) return 'error';
  if (index < currentIndex) return 'complete';
  if (index === currentIndex) return 'current';
  return 'pending';
}

export function flowStepMarkerClass(status: FlowStepStatus): string {
  switch (status) {
    case 'complete':
      return 'border-success bg-success-bg text-success';
    case 'error':
      return 'border-error bg-error-bg text-error';
    case 'current':
      return 'border-white bg-white text-black';
    default:
      return 'border-satin bg-transparent text-muted-foreground';
  }
}

export function flowStepLabelClass(status: FlowStepStatus): string {
  switch (status) {
    case 'complete':
      return 'text-success';
    case 'error':
      return 'text-error';
    case 'current':
      return 'text-foreground';
    default:
      return 'text-muted-foreground';
  }
}

export function flowStepConnectorClass(status: FlowStepStatus): string {
  switch (status) {
    case 'complete':
      return 'bg-success/40';
    case 'error':
      return 'bg-error/40';
    default:
      return 'bg-white/10';
  }
}

interface FlowStepMarkerProps {
  status: FlowStepStatus;
  stepNumber: number;
  className?: string;
}

/** Numbered circle / check / error for multi-step flow sidebars. */
export function FlowStepMarker({ status, stepNumber, className }: FlowStepMarkerProps) {
  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-[background-color,border-color,color] duration-200 ease-out',
        flowStepMarkerClass(status),
        className,
      )}
      aria-current={status === 'current' ? 'step' : undefined}
    >
      {status === 'complete' ? (
        <Check className="size-3.5" aria-hidden />
      ) : status === 'error' ? (
        <X className="size-3.5" aria-hidden />
      ) : (
        stepNumber
      )}
    </span>
  );
}

interface FlowStepConnectorProps {
  status: FlowStepStatus;
  className?: string;
}

export function FlowStepConnector({ status, className }: FlowStepConnectorProps) {
  return (
    <div
      className={cn('w-px flex-1', flowStepConnectorClass(status), className)}
      aria-hidden
    />
  );
}
