export const CAMPAIGN_WIZARD_STEP_KEYS = [
  'employer.campaigns.wizard.steps.basic',
  'employer.campaigns.wizard.steps.jobDescription',
  'employer.campaigns.wizard.steps.interview',
  'employer.campaigns.wizard.steps.criteria',
  'employer.campaigns.wizard.steps.settings',
  'employer.campaigns.wizard.steps.review',
] as const;

export const CAMPAIGN_WIZARD_STEP_COUNT = CAMPAIGN_WIZARD_STEP_KEYS.length;

export type CampaignWizardStepIndex = 0 | 1 | 2 | 3 | 4 | 5;

export const CAMPAIGN_WIZARD_BASIC_FIELDS = [
  'title',
  'company',
  'location',
  'mode',
  'summary',
] as const;

export const CAMPAIGN_WIZARD_JD_FIELDS = ['jobDescription'] as const;

export const CAMPAIGN_WIZARD_SETTINGS_FIELDS = [
  'capacity',
  'deadline',
  'locale',
  'welcomeMessage',
  'completionMessage',
] as const;
