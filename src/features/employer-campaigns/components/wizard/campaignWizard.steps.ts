import type { FlowStepStatus } from '@/components/ui/flow-stepper';

/**
 * Flow 1 — Create & publish campaign (4 wizard steps in current UI).
 * Candidate invitation is Flow 2, after campaign is Active.
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
] as const;

export type CampaignWizardStepId = (typeof CAMPAIGN_WIZARD_STEPS)[number]['id'];
export const CAMPAIGN_WIZARD_STEP_COUNT = CAMPAIGN_WIZARD_STEPS.length;
export type CampaignWizardStepIndex = 0 | 1 | 2 | 3;

export const CAMPAIGN_WIZARD_STEP_KEYS = CAMPAIGN_WIZARD_STEPS.map((step) => step.titleKey);

export const CAMPAIGN_TARGET_LEVELS = [
  'Fresher',
  'Junior',
  'Middle',
  'Senior',
] as const;

export type CampaignTargetLevel = (typeof CAMPAIGN_TARGET_LEVELS)[number];

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
