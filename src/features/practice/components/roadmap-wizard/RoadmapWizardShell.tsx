import React from 'react';
import { Link } from 'react-router-dom';
import {
  FlowStepConnector,
  FlowStepMarker,
  flowStepLabelClass,
  resolveFlowStepStatus,
} from '@/components/ui/flow-stepper';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';

const ROADMAP_WIZARD_STEPS = [
  {
    id: 'domain',
    titleKey: 'practice.roadmapWizard.steps.domain',
  },
  {
    id: 'reports',
    titleKey: 'practice.roadmapWizard.steps.reports',
  },
  {
    id: 'level',
    titleKey: 'practice.roadmapWizard.steps.level',
  },
  {
    id: 'confirm',
    titleKey: 'practice.roadmapWizard.steps.confirm',
  },
] as const;

/** Title keys in step order — kept for any external lookups. */
export const ROADMAP_WIZARD_STEP_KEYS = ROADMAP_WIZARD_STEPS.map((step) => step.titleKey);

interface RoadmapWizardShellProps {
  currentStep: number;
  /** Extra heading shown on the first step only. */
  introTitle?: string;
  children: React.ReactNode;
}

export const RoadmapWizardShell: React.FC<RoadmapWizardShellProps> = ({
  currentStep,
  introTitle,
  children,
}) => {
  const { t } = useLanguage();
  const showIntro = currentStep === 0 && Boolean(introTitle);

  return (
    <div className="flex min-h-dvh justify-center overflow-y-auto bg-transparent px-6 py-6 sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
        <nav
          aria-label={t('practice.roadmapWizard.stepperLabel')}
          className="hidden shrink-0 sm:block lg:sticky lg:top-8 lg:w-[240px] lg:self-start"
        >
          <h1 className="sr-only">
            {t('practice.roadmapWizard.stepOf')
              .replace('{current}', String(currentStep + 1))
              .replace('{total}', String(ROADMAP_WIZARD_STEPS.length))}
            {': '}
            {t(ROADMAP_WIZARD_STEPS[currentStep]!.titleKey)}
          </h1>

          <ol className="flex flex-col">
            {ROADMAP_WIZARD_STEPS.map((step, index) => {
              const status = resolveFlowStepStatus(index, currentStep);
              const isLast = index === ROADMAP_WIZARD_STEPS.length - 1;
              return (
                <li key={step.id} className="flex w-full items-stretch gap-3">
                  <div className="flex flex-col items-center">
                    <FlowStepMarker status={status} stepNumber={index + 1} />
                    {!isLast ? (
                      <FlowStepConnector
                        status={status === 'complete' ? 'complete' : 'pending'}
                        className="mt-1 min-h-8"
                      />
                    ) : null}
                  </div>
                  <div className={cn('min-w-0 pt-1.5', !isLast && 'pb-8')}>
                    <span className={cn('block text-base font-semibold leading-snug', flowStepLabelClass(status))}>
                      {t(step.titleKey)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="shrink-0">
            <Link
              to="/candidate/dashboard"
              className="text-sm font-medium text-text-secondary transition hover:text-text-primary"
            >
              {t('practice.flow.backToDashboard')}
            </Link>

            {showIntro ? (
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                {introTitle}
              </h2>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
};
