import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { FlowStepStatus } from '@/components/ui/flow-stepper';
import { cn } from '@/lib/utils';
import { FlowWizardSidebar } from './FlowWizardSidebar';
import type { FlowWizardAccent } from './flowWizardAccent';

export interface FlowWizardShellProps {
  accent: FlowWizardAccent;
  currentStep: number;
  steps: readonly string[];
  stepperAriaLabel: string;
  stepOfLabel: string;
  children: ReactNode;
  pageTitle?: string;
  backLink?: { to: string; label: string };
  onStepClick?: (index: number) => void;
  resolveStatus?: (index: number, currentStep: number) => FlowStepStatus;
  failedIndexes?: readonly number[];
  className?: string;
}

export function FlowWizardShell({
  accent,
  currentStep,
  steps,
  stepperAriaLabel,
  stepOfLabel,
  children,
  pageTitle,
  backLink,
  onStepClick,
  resolveStatus,
  failedIndexes,
  className,
}: FlowWizardShellProps) {
  const srTitle = stepOfLabel
    .replace('{current}', String(currentStep + 1))
    .replace('{total}', String(steps.length));

  return (
    <div
      className={cn(
        'flex min-h-dvh justify-center overflow-y-auto px-6 py-6 sm:px-8 lg:px-12 lg:py-8',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
        <div className="shrink-0 lg:sticky lg:top-8 lg:w-[240px] lg:self-start">
          {backLink ? (
            <Link
              to={backLink.to}
              className="mb-4 inline-block text-sm font-medium text-text-secondary transition hover:text-text-primary"
            >
              {backLink.label}
            </Link>
          ) : null}

          {pageTitle ? (
            <h1 className="mb-6 text-[1.75rem] font-bold leading-tight tracking-tight text-text-primary sm:text-[2rem]">
              {pageTitle}
            </h1>
          ) : null}

          <nav aria-label={stepperAriaLabel}>
            <h2 className="sr-only">
              {srTitle}: {steps[currentStep]}
            </h2>
            <FlowWizardSidebar
              accent={accent}
              steps={steps}
              currentStep={currentStep}
              ariaLabel={stepperAriaLabel}
              onStepClick={onStepClick}
              resolveStatus={resolveStatus}
              failedIndexes={failedIndexes}
            />
          </nav>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div
            key={currentStep}
            className="flex min-h-0 flex-1 flex-col motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
