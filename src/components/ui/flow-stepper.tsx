import { Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FlowStepStatus = 'complete' | 'current' | 'processing' | 'pending' | 'error';

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
    case 'processing':
      return 'border-info bg-info-bg text-info';
    case 'current':
      return 'border-foreground bg-foreground text-background';
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
    case 'processing':
      return 'text-info';
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
    case 'processing':
      return 'bg-info/40';
    default:
      return 'bg-border';
  }
}

interface FlowStepMarkerProps {
  status: FlowStepStatus;
  stepNumber: number;
  className?: string;
}

/** Numbered circle / check / spinner / error for multi-step flow sidebars. */
export function FlowStepMarker({ status, stepNumber, className }: FlowStepMarkerProps) {
  const isActive = status === 'current' || status === 'processing';
  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-[background-color,border-color,color] duration-200 ease-out',
        flowStepMarkerClass(status),
        className,
      )}
      aria-current={isActive ? 'step' : undefined}
    >
      {status === 'complete' ? (
        <Check className="size-3.5" aria-hidden />
      ) : status === 'error' ? (
        <X className="size-3.5" aria-hidden />
      ) : status === 'processing' ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
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
