import type { FlowStepStatus } from '@/components/ui/flow-stepper';
import { isCampaignSlotsUiEnabled } from '@/shared/config';

/**
 * Campaign setup — collect candidates before the final deploy action.
 */
export const CAMPAIGN_WIZARD_STEPS = [
  {
    id: 'info',
    titleKey: 'employer.campaigns.wizard.steps.info',
    descKey: 'employer.campaigns.wizard.steps.infoDesc',
  },
  {
    id: 'jd',
    titleKey: 'employer.campaigns.wizard.steps.jd',
    descKey: 'employer.campaigns.wizard.steps.jdDesc',
  },
  {
    id: 'criteria',
    titleKey: 'employer.campaigns.wizard.steps.criteria',
    descKey: 'employer.campaigns.wizard.steps.criteriaDesc',
  },
  {
    id: 'questions',
    titleKey: 'employer.campaigns.wizard.steps.questions',
    descKey: 'employer.campaigns.wizard.steps.questionsDesc',
  },
  {
    id: 'settings',
    titleKey: 'employer.campaigns.wizard.steps.settings',
    descKey: 'employer.campaigns.wizard.steps.settingsDesc',
  },
  {
    id: 'slots',
    titleKey: 'employer.campaigns.wizard.steps.slots',
    descKey: 'employer.campaigns.wizard.steps.slotsDesc',
  },
  {
    id: 'invites',
    titleKey: 'employer.campaigns.wizard.steps.invites',
    descKey: 'employer.campaigns.wizard.steps.invitesDesc',
  },
  {
    id: 'review',
    titleKey: 'employer.campaigns.wizard.steps.review',
    descKey: 'employer.campaigns.wizard.steps.reviewDesc',
  },
] as const;

export type CampaignWizardStepId = (typeof CAMPAIGN_WIZARD_STEPS)[number]['id'];
export const CAMPAIGN_WIZARD_STEP_COUNT = CAMPAIGN_WIZARD_STEPS.length;
export type CampaignWizardStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const CAMPAIGN_WIZARD_STEP_KEYS = CAMPAIGN_WIZARD_STEPS.map((step) => step.titleKey);

/**
 * Bước bị ẩn khỏi giao diện (index nội bộ GIỮ NGUYÊN — mọi `step === n` trong wizard vẫn đúng).
 * Hiện chỉ có `slots` khi cờ tắt (xem `isCampaignSlotsUiEnabled`). Tính lúc gọi, không cache ở module,
 * để test mock được cờ theo từng file.
 */
export function isHiddenWizardStep(step: number): boolean {
  return !isCampaignSlotsUiEnabled() && CAMPAIGN_WIZARD_STEPS[step]?.id === 'slots';
}

/** Danh sách bước HIỂN THỊ kèm index nội bộ — stepper/bộ đếm vẽ từ đây, không từ `CAMPAIGN_WIZARD_STEPS`. */
export function visibleWizardSteps(): ReadonlyArray<{ step: (typeof CAMPAIGN_WIZARD_STEPS)[number]; index: number }> {
  return CAMPAIGN_WIZARD_STEPS.map((step, index) => ({ step, index })).filter(({ index }) => !isHiddenWizardStep(index));
}

/** "Bước {position}/{total}" theo danh sách hiển thị; bước ẩn (không nên tới được) trả vị trí của bước hiện kế trước. */
export function visibleWizardStepPosition(step: number): { position: number; total: number } {
  const visible = visibleWizardSteps();
  const pos = visible.findIndex((v) => v.index >= step);
  return { position: (pos === -1 ? visible.length : pos) + 1, total: visible.length };
}

/**
 * Bước hiển thị kế tiếp theo hướng `direction` (nhảy qua bước ẩn), kẹp trong [0, COUNT-1].
 * Không có bước nào phía đó ⇒ giữ nguyên `from`.
 */
export function nextVisibleWizardStep(from: number, direction: 1 | -1): number {
  let step = from + direction;
  while (step >= 0 && step < CAMPAIGN_WIZARD_STEP_COUNT && isHiddenWizardStep(step)) step += direction;
  return step < 0 || step >= CAMPAIGN_WIZARD_STEP_COUNT ? from : step;
}

/** Các bước ẩn nằm giữa `from` (không tính) và `to` (không tính) — để đánh dấu hoàn thành khi nhảy qua. */
export function hiddenWizardStepsBetween(from: number, to: number): number[] {
  const [lo, hi] = from < to ? [from, to] : [to, from];
  const out: number[] = [];
  for (let i = lo + 1; i < hi; i += 1) if (isHiddenWizardStep(i)) out.push(i);
  return out;
}

export function canNavigateToWizardStep(
  step: number,
  currentStep: number,
  completedSteps: readonly number[],
): boolean {
  return (
    step >= 0 &&
    step < CAMPAIGN_WIZARD_STEP_COUNT &&
    !isHiddenWizardStep(step) &&
    (step === currentStep || completedSteps.includes(step))
  );
}

/** Campaign domains shown in create wizard. */
export const CAMPAIGN_DOMAIN_OPTIONS = [
  'frontend',
  'backend',
  'business-analyst',
] as const;

export type CampaignDomainOption = (typeof CAMPAIGN_DOMAIN_OPTIONS)[number];

export type WizardStepUiStatus = Extract<
  FlowStepStatus,
  'pending' | 'current' | 'complete' | 'error'
>;
