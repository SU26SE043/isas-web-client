import React from 'react';
import { Link } from 'react-router-dom';
import {
  FlowStepConnector,
  FlowStepMarker,
  flowStepLabelClass,
  resolveFlowStepStatus,
  type FlowStepStatus,
} from '@/components/ui/flow-stepper';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import { CAMPAIGN_WIZARD_STEP_KEYS } from './campaignWizard.steps';

interface CampaignWizardShellProps {
  currentStep: number;
  isEditing?: boolean;
  children: React.ReactNode;
}

function statusLabelKey(status: FlowStepStatus): string {
  if (status === 'complete') return 'employer.campaigns.wizard.status.completed';
  if (status === 'current') return 'employer.campaigns.wizard.status.current';
  return 'employer.campaigns.wizard.status.upcoming';
}

export function CampaignWizardShell({
  currentStep,
  isEditing = false,
  children,
}: CampaignWizardShellProps) {
  const { t } = useLanguage();
  const showIntro = currentStep === 0;

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] justify-center overflow-y-auto bg-surface-base px-6 py-6 sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
        <nav
          aria-label={t('employer.campaigns.wizard.stepperLabel')}
          className="hidden shrink-0 sm:block lg:sticky lg:top-8 lg:w-[260px] lg:self-start"
        >
          <h1 className="sr-only">
            {t('employer.campaigns.wizard.stepOf')
              .replace('{current}', String(currentStep + 1))
              .replace('{total}', String(CAMPAIGN_WIZARD_STEP_KEYS.length))}
            {': '}
            {t(CAMPAIGN_WIZARD_STEP_KEYS[currentStep])}
          </h1>

          <ol className="flex flex-col">
            {CAMPAIGN_WIZARD_STEP_KEYS.map((key, index) => {
              const status = resolveFlowStepStatus(index, currentStep);
              const isLast = index === CAMPAIGN_WIZARD_STEP_KEYS.length - 1;
              return (
                <li key={key} className="flex w-full items-stretch gap-3">
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
                      {t(key)}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {t(statusLabelKey(status))}
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
              to="/employer/campaigns"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              {t('employer.campaigns.wizard.backToList')}
            </Link>

            {showIntro ? (
              <>
                <h2 className="heading-primary mt-4 text-3xl text-foreground sm:text-4xl">
                  {isEditing
                    ? t('employer.campaigns.wizard.editTitle')
                    : t('employer.campaigns.wizard.createTitle')}
                </h2>
                <p className="body-text mt-2 max-w-3xl">{t('employer.campaigns.wizard.subtitle')}</p>
              </>
            ) : null}
          </div>

          {/* Mobile horizontal stepper */}
          <ol
            aria-label={t('employer.campaigns.wizard.stepperLabel')}
            className="flex gap-2 overflow-x-auto pb-1 sm:hidden"
          >
            {CAMPAIGN_WIZARD_STEP_KEYS.map((key, index) => {
              const status = resolveFlowStepStatus(index, currentStep);
              return (
                <li key={key} className="flex shrink-0 items-center gap-2">
                  <FlowStepMarker status={status} stepNumber={index + 1} />
                  <span className={cn('max-w-[7rem] truncate text-xs font-medium', flowStepLabelClass(status))}>
                    {t(key)}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
}
