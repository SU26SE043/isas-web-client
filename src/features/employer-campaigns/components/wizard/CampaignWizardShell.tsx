import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import {
  FlowStepMarker,
  flowStepConnectorClass,
  flowStepLabelClass,
  resolveFlowStepStatus,
} from '@/components/ui/flow-stepper';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { AutosaveStatus } from '../../types/campaignWizard.types';
import { CAMPAIGN_WIZARD_STEPS, canNavigateToWizardStep } from './campaignWizard.steps';
import type { CampaignWizardStepId } from './campaignWizard.steps';

/**
 * Nhãn ngắn dành riêng cho thanh bước. Cột chỉ rộng 220px ở `lg`, nhãn dài xuống 2 dòng
 * làm khoảng cách giữa các mục lởm chởm. Khoá gốc `steps.settings` vẫn giữ nguyên vì nó
 * còn là tiêu đề panel của chính bước đó (`CampaignSettingsStep`), nơi cần mô tả đầy đủ.
 */
const STEPPER_TITLE_KEYS: Partial<Record<CampaignWizardStepId, string>> = {
  settings: 'employer.campaigns.wizard.steps.settingsShort',
};

function stepperTitleKey(step: (typeof CAMPAIGN_WIZARD_STEPS)[number]): string {
  return STEPPER_TITLE_KEYS[step.id] ?? step.titleKey;
}

interface CampaignWizardShellProps {
  currentStep: number;
  errorSteps?: readonly number[];
  campaignName?: string;
  /** @deprecated Không còn hiển thị — thanh bước đã chỉ rõ vị trí. Giữ để caller cũ không vỡ kiểu. */
  isEditing?: boolean;
  autosaveStatus?: AutosaveStatus;
  lastSavedAt?: string;
  onStepChange?: (step: number) => void;
  completedSteps?: readonly number[];
  children: React.ReactNode;
}

export function autosaveLabel(
  t: (key: string) => string,
  status: AutosaveStatus | undefined,
  lastSavedAt?: string,
): string {
  if (status === 'saving') return t('employer.campaigns.wizard.autosave.saving');
  if (status === 'saved' && lastSavedAt) {
    const time = new Date(lastSavedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return t('employer.campaigns.wizard.autosave.savedAt').replace('{time}', time);
  }
  if (status === 'saved') return t('employer.campaigns.wizard.autosave.saved');
  return t('employer.campaigns.wizard.autosave.dirty');
}

export function CampaignWizardShell({
  currentStep,
  errorSteps = [],
  campaignName,
  isEditing = false,
  autosaveStatus = 'idle',
  lastSavedAt,
  onStepChange,
  completedSteps = [],
  children,
}: CampaignWizardShellProps) {
  const { t } = useLanguage();
  const flowTitle = campaignName?.trim()
    ? `${t('employer.campaigns.wizard.createTitle')}: ${campaignName}`
    : isEditing
      ? t('employer.campaigns.wizard.editTitle')
      : t('employer.campaigns.wizard.createTitle');

  return (
    <div className="surface-page flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <header className="sticky top-0 z-20 border-b border-satin bg-surface-elevated/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-medium text-foreground sm:text-base">{flowTitle}</p>
              <span className="rounded-lg border border-satin bg-surface-overlay px-2 py-0.5 text-xs text-muted-foreground">
                {t('employer.campaigns.status.draft')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {autosaveLabel(t, autosaveStatus, lastSavedAt)}
              {/* Bộ đếm bước chỉ hiện dưới `sm`: ở đó thanh bước dọc bị ẩn, còn bản ngang thay
                  thế lại cuộn ngang nên không nhìn ra tổng số bước. Từ `sm` trở lên thanh bước
                  đã nói rõ đang ở đâu nên nhắc lại là thừa. */}
              <span className="sm:hidden">
                {' · '}
                {t('employer.campaigns.wizard.stepCounter')
                  .replace('{current}', String(currentStep + 1))
                  .replace('{total}', String(CAMPAIGN_WIZARD_STEPS.length))}
              </span>
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

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-5 sm:px-8 lg:flex-row lg:items-start lg:gap-10 lg:px-10 lg:py-8">
        <nav
          aria-label={t('employer.campaigns.wizard.stepperLabel')}
          className="hidden shrink-0 sm:block lg:sticky lg:top-24 lg:w-[220px] lg:self-start"
        >
          <ol className="flex flex-col">
            {CAMPAIGN_WIZARD_STEPS.map((step, index) => {
              const status = resolveFlowStepStatus(index, currentStep, errorSteps);
              const isLast = index === CAMPAIGN_WIZARD_STEPS.length - 1;
              const canNavigate = Boolean(onStepChange) && canNavigateToWizardStep(index, currentStep, completedSteps);
              return (
                <li key={step.id} className="w-full">
                  <button
                    type="button"
                    disabled={!canNavigate}
                    aria-current={index === currentStep ? 'step' : undefined}
                    onClick={() => onStepChange?.(index)}
                    className="group flex w-full items-start gap-3 text-left disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <span className="flex flex-col items-center">
                      <FlowStepMarker
                        status={status}
                        stepNumber={index + 1}
                        className={status === 'current' ? 'border-info bg-info/10 text-info shadow-none' : undefined}
                      />
                      {!isLast ? <span aria-hidden className={cn('mt-1 min-h-8 w-px', flowStepConnectorClass(status === 'complete' ? 'complete' : status === 'error' ? 'error' : 'pending'))} /> : null}
                    </span>
                    <span className={cn('min-w-0 pt-1.5', !isLast && 'pb-6')}>
                      <span className={cn('block text-sm font-medium leading-snug group-hover:text-foreground', flowStepLabelClass(status))}>
                        {t(stepperTitleKey(step))}
                      </span>
                    </span>
                  </button>
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
              const canNavigate = Boolean(onStepChange) && canNavigateToWizardStep(index, currentStep, completedSteps);
              return (
                <li key={step.id} className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={!canNavigate}
                    aria-current={index === currentStep ? 'step' : undefined}
                    onClick={() => onStepChange?.(index)}
                    className="group flex min-h-11 items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <FlowStepMarker status={status} stepNumber={index + 1} />
                    <span className={cn('max-w-[7rem] truncate text-xs font-medium group-hover:text-foreground', flowStepLabelClass(status))}>
                      {t(stepperTitleKey(step))}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="flex flex-col animate-in fade-in duration-300">{children}</div>
        </div>
      </div>
    </div>
  );
}

