import type { FlowStepStatus } from '@/components/ui/flow-stepper';

/** Sidebar steps — Answer Requirement Configuration intentionally omitted. */
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
    id: 'candidates',
    titleKey: 'employer.campaigns.wizard.steps.candidates',
    descKey: 'employer.campaigns.wizard.steps.candidatesDesc',
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
] as const;

export type CampaignWizardStepId = (typeof CAMPAIGN_WIZARD_STEPS)[number]['id'];
export const CAMPAIGN_WIZARD_STEP_COUNT = CAMPAIGN_WIZARD_STEPS.length;
export type CampaignWizardStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Legacy key aliases kept for older references during migration. */
export const CAMPAIGN_WIZARD_STEP_KEYS = CAMPAIGN_WIZARD_STEPS.map((step) => step.titleKey);

export const CAMPAIGN_TARGET_LEVELS = [
  'Intern',
  'Fresher',
  'Junior',
  'Middle',
  'Senior',
  'Lead',
] as const;

export type CampaignTargetLevel = (typeof CAMPAIGN_TARGET_LEVELS)[number];

export const CAMPAIGN_DOMAIN_OPTIONS = [
  'frontend',
  'backend',
  'business-analyst',
  'qa',
  'data-engineering',
  'data-science',
  'devops',
  'mobile',
  'uiux',
  'product',
  'other',
] as const;

export type CampaignDomainOption = (typeof CAMPAIGN_DOMAIN_OPTIONS)[number];

export type WizardStepUiStatus = Extract<
  FlowStepStatus,
  'pending' | 'current' | 'complete' | 'error'
>;
