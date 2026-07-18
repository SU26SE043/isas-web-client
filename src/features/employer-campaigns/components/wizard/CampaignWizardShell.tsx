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
import { CAMPAIGN_WIZARD_STEPS } from './campaignWizard.steps';

interface CampaignWizardShellProps {
  currentStep: number;
  errorSteps?: readonly number[];
  campaignName?: string;
  progressPercent?: number;
  isEditing?: boolean;
  children: React.ReactNode;
}

function statusLabelKey(status: FlowStepStatus): string {
  if (status === 'complete') return 'employer.campaigns.wizard.status.completed';
  if (status === 'current') return 'employer.campaigns.wizard.status.active';
  if (status === 'error') return 'employer.campaigns.wizard.status.error';
  return 'employer.campaigns.wizard.status.pending';
}

export function CampaignWizardShell({
  currentStep,
  errorSteps = [],
  campaignName,
  progressPercent = 0,
  isEditing = false,
  children,
}: CampaignWizardShellProps) {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] justify-center overflow-y-auto bg-surface-base px-4 py-6 sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
        <nav
          aria-label={t('employer.campaigns.wizard.stepperLabel')}
          className="hidden shrink-0 sm:block lg:sticky lg:top-8 lg:w-[280px] lg:self-start"
        >
          <ol className="flex flex-col">
            {CAMPAIGN_WIZARD_STEPS.map((step, index) => {
              const status = resolveFlowStepStatus(index, currentStep, errorSteps);
              const isLast = index === CAMPAIGN_WIZARD_STEPS.length - 1;
              return (
                <li key={step.id} className="flex w-full items-stretch gap-3">
                  <div className="flex flex-col items-center">
                    <FlowStepMarker status={status} stepNumber={index + 1} />
                    {!isLast ? (
                      <FlowStepConnector
                        status={
                          status === 'complete' ? 'complete' : status === 'error' ? 'error' : 'pending'
                        }
                        className="mt-1 min-h-8"
                      />
                    ) : null}
                  </div>
                  <div className={cn('min-w-0 pt-1.5', !isLast && 'pb-6')}>
                    <span className={cn('block text-sm font-medium leading-snug', flowStepLabelClass(status))}>
                      {t(step.titleKey)}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{t(step.descKey)}</span>
                    <span className="mt-1 block text-[11px] uppercase tracking-wide text-muted-foreground">
                      {t(statusLabelKey(status))}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <header className="flex flex-col gap-3 border-b border-satin pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <Link
                to="/employer/campaigns"
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {t('employer.campaigns.wizard.backToList')}
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="heading-primary text-2xl text-foreground sm:text-3xl">
                  {campaignName?.trim()
                    ? campaignName
                    : isEditing
                      ? t('employer.campaigns.wizard.editTitle')
                      : t('employer.campaigns.wizard.createTitle')}
                </h1>
                <span className="rounded-md border border-satin bg-surface-overlay px-2 py-0.5 text-xs text-muted-foreground">
                  {t('employer.campaigns.status.draft')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('employer.campaigns.wizard.progress')
                  .replace('{percent}', String(Math.round(progressPercent)))
                  .replace('{current}', String(currentStep + 1))
                  .replace('{total}', String(CAMPAIGN_WIZARD_STEPS.length))}
              </p>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-surface-overlay sm:max-w-xs"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressPercent)}
            >
              <div
                className="h-full rounded-full bg-foreground/80 transition-[width] duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </header>

          <ol
            aria-label={t('employer.campaigns.wizard.stepperLabel')}
            className="flex gap-2 overflow-x-auto pb-1 sm:hidden"
          >
            {CAMPAIGN_WIZARD_STEPS.map((step, index) => {
              const status = resolveFlowStepStatus(index, currentStep, errorSteps);
              return (
                <li key={step.id} className="flex shrink-0 items-center gap-2">
                  <FlowStepMarker status={status} stepNumber={index + 1} />
                  <span className={cn('max-w-[7rem] truncate text-xs font-medium', flowStepLabelClass(status))}>
                    {t(step.titleKey)}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="flex min-h-0 flex-1 flex-col animate-in fade-in duration-300">{children}</div>
        </div>
      </div>
    </div>
  );
}
