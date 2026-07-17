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
    descKey: 'practice.roadmapWizard.stepDesc.domain',
  },
  {
    id: 'reports',
    titleKey: 'practice.roadmapWizard.steps.reports',
    descKey: 'practice.roadmapWizard.stepDesc.reports',
  },
  {
    id: 'level',
    titleKey: 'practice.roadmapWizard.steps.level',
    descKey: 'practice.roadmapWizard.stepDesc.level',
  },
  {
    id: 'confirm',
    titleKey: 'practice.roadmapWizard.steps.confirm',
    descKey: 'practice.roadmapWizard.stepDesc.confirm',
  },
] as const;

/** Title keys in step order — kept for any external lookups. */
export const ROADMAP_WIZARD_STEP_KEYS = ROADMAP_WIZARD_STEPS.map((step) => step.titleKey);

interface RoadmapWizardShellProps {
  currentStep: number;
  /** Extra heading shown on the first step only. */
  introTitle?: string;
  introDescription?: string;
  children: React.ReactNode;
}

export const RoadmapWizardShell: React.FC<RoadmapWizardShellProps> = ({
  currentStep,
  introTitle,
  introDescription,
  children,
}) => {
  const { t } = useLanguage();
  const showIntro = currentStep === 0 && Boolean(introTitle);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] justify-center overflow-y-auto bg-surface-base px-6 py-6 sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
        <nav
          aria-label={t('practice.roadmapWizard.stepperLabel')}
          className="hidden shrink-0 sm:block lg:sticky lg:top-8 lg:w-[280px] lg:self-start"
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
                  <div className={cn('min-w-0 pt-1.5', !isLast && 'pb-6')}>
                    <span className={cn('block text-sm font-medium leading-snug', flowStepLabelClass(status))}>
                      {t(step.titleKey)}
                    </span>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {t(step.descKey)}
                    </p>
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
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              {t('practice.flow.backToDashboard')}
            </Link>

            {showIntro ? (
              <>
                <h2 className="heading-primary mt-4 text-3xl text-foreground sm:text-4xl">{introTitle}</h2>
                {introDescription ? (
                  <p className="body-text mt-2 max-w-3xl">{introDescription}</p>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
};
