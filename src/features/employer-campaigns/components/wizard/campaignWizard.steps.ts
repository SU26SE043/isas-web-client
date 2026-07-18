import type { FlowStepStatus } from '@/components/ui/flow-stepper';

/**
 * EMP-CAM wizard — 10 discrete screens.
 * Answer Requirement Configuration is intentionally omitted.
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
    id: 'inviteMethod',
    titleKey: 'employer.campaigns.wizard.steps.inviteMethod',
    descKey: 'employer.campaigns.wizard.steps.inviteMethodDesc',
  },
  {
    id: 'ranking',
    titleKey: 'employer.campaigns.wizard.steps.ranking',
    descKey: 'employer.campaigns.wizard.steps.rankingDesc',
  },
  {
    id: 'magicLink',
    titleKey: 'employer.campaigns.wizard.steps.magicLink',
    descKey: 'employer.campaigns.wizard.steps.magicLinkDesc',
  },
  {
    id: 'email',
    titleKey: 'employer.campaigns.wizard.steps.email',
    descKey: 'employer.campaigns.wizard.steps.emailDesc',
  },
  {
    id: 'review',
    titleKey: 'employer.campaigns.wizard.steps.review',
    descKey: 'employer.campaigns.wizard.steps.reviewDesc',
  },
  {
    id: 'publish',
    titleKey: 'employer.campaigns.wizard.steps.publish',
    descKey: 'employer.campaigns.wizard.steps.publishDesc',
  },
] as const;

export type CampaignWizardStepId = (typeof CAMPAIGN_WIZARD_STEPS)[number]['id'];
export const CAMPAIGN_WIZARD_STEP_COUNT = CAMPAIGN_WIZARD_STEPS.length;
export type CampaignWizardStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const CAMPAIGN_WIZARD_STEP_KEYS = CAMPAIGN_WIZARD_STEPS.map((step) => step.titleKey);

export const CAMPAIGN_TARGET_LEVELS = [
  'Fresher',
  'Junior',
  'Middle',
  'Senior',
] as const;

export type CampaignTargetLevel = (typeof CAMPAIGN_TARGET_LEVELS)[number];

/** Employer campaign domains: FE · BE · BA only. */
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
