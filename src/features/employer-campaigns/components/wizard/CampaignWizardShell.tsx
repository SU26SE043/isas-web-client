import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import {
  FlowStepConnector,
  FlowStepMarker,
  flowStepLabelClass,
  resolveFlowStepStatus,
  type FlowStepStatus,
} from '@/components/ui/flow-stepper';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { AutosaveStatus } from '../../types/campaignWizard.types';
import { CAMPAIGN_WIZARD_STEPS } from './campaignWizard.steps';

interface CampaignWizardShellProps {
  currentStep: number;
  errorSteps?: readonly number[];
  campaignName?: string;
  progressPercent?: number;
  isEditing?: boolean;
  autosaveStatus?: AutosaveStatus;
  lastSavedAt?: string;
  children: React.ReactNode;
}

function statusLabelKey(status: FlowStepStatus): string {
  if (status === 'complete') return 'employer.campaigns.wizard.status.completed';
  if (status === 'current') return 'employer.campaigns.wizard.status.active';
  if (status === 'error') return 'employer.campaigns.wizard.status.error';
  return 'employer.campaigns.wizard.status.pending';
}

function autosaveLabel(
  t: (key: string) => string,
  status: AutosaveStatus | undefined,
  lastSavedAt?: string,
  isEditing?: boolean,
): string {
  if (status === 'saving') return t('employer.campaigns.wizard.autosave.saving');
  if (status === 'failed') return t('employer.campaigns.wizard.autosave.failed');
  if (status === 'saved' && lastSavedAt) {
    const time = new Date(lastSavedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return t('employer.campaigns.wizard.autosave.savedAt').replace('{time}', time);
  }
  if (status === 'dirty') {
    return isEditing
      ? t('employer.campaigns.wizard.autosave.dirty')
      : t('employer.campaigns.wizard.autosave.localOnly');
  }
  return isEditing
    ? t('employer.campaigns.wizard.autosave.idle')
    : t('employer.campaigns.wizard.autosave.localOnly');
}

export function CampaignWizardShell({
  currentStep,
  errorSteps = [],
  campaignName,
  progressPercent = 0,
  isEditing = false,
  autosaveStatus = 'idle',
  lastSavedAt,
  children,
}: CampaignWizardShellProps) {
  const { t } = useLanguage();
  const flowTitle = campaignName?.trim()
    ? `${t('employer.campaigns.wizard.createTitle')}: ${campaignName}`
    : isEditing
      ? t('employer.campaigns.wizard.editTitle')
      : t('employer.campaigns.wizard.createTitle');

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-[radial-gradient(circle_at_78%_8%,rgba(37,99,235,0.16),transparent_28%),radial-gradient(circle_at_14%_92%,rgba(124,58,237,0.12),transparent_24%)] bg-surface-base">
      <header className="sticky top-0 z-20 border-b border-satin bg-surface-elevated/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-medium text-foreground sm:text-base">{flowTitle}</p>
              <span className="rounded-md border border-satin bg-surface-overlay px-2 py-0.5 text-xs text-muted-foreground">
                {t('employer.campaigns.status.draft')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {autosaveLabel(t, autosaveStatus, lastSavedAt, isEditing)}
              {' · '}
              {t('employer.campaigns.wizard.progress')
                .replace('{percent}', String(Math.round(progressPercent)))
                .replace('{current}', String(currentStep + 1))
                .replace('{total}', String(CAMPAIGN_WIZARD_STEPS.length))}
            </p>
          </div>
          <Link
            to="/employer/campaigns"
            className="btn-ghost inline-flex size-9 items-center justify-center"
            aria-label={t('employer.campaigns.wizard.close')}
          >
            <X className="size-4" aria-hidden />
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-5 sm:px-8 lg:flex-row lg:items-stretch lg:gap-10 lg:px-10 lg:py-8">
        <nav
          aria-label={t('employer.campaigns.wizard.stepperLabel')}
          className="hidden shrink-0 sm:block lg:sticky lg:top-24 lg:w-[220px] lg:self-start"
        >
          <ol className="flex flex-col">
            {CAMPAIGN_WIZARD_STEPS.map((step, index) => {
              const status = resolveFlowStepStatus(index, currentStep, errorSteps);
              const isLast = index === CAMPAIGN_WIZARD_STEPS.length - 1;
              return (
                <li key={step.id} className="flex w-full items-stretch gap-3">
                  <div className="flex flex-col items-center">
                    <FlowStepMarker
                      status={status}
                      stepNumber={index + 1}
                      className={status === 'current' ? 'border-info bg-info/10 text-info shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_0_24px_-8px_rgba(59,130,246,0.95)]' : undefined}
                    />
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
