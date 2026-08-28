export type ReviewPriority = 'identity' | 'behavior' | 'environment';

function normalizedFlagType(type: string) {
  return type.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const REVIEW_PRIORITY_BY_FLAG: Record<string, ReviewPriority> = {
  facemismatch: 'identity',
  multiplefaces: 'identity',
  multivoice: 'identity',
  noface: 'behavior',
  tabswitch: 'behavior',
  paste: 'behavior',
  focuslost: 'behavior',
  focusswitch: 'behavior',
  fullexit: 'behavior',
  fullscreenexit: 'behavior',
  camerablocked: 'environment',
  monitoringgap: 'environment',
  identityunverified: 'environment',
};

export function getReviewPriority(type: string): ReviewPriority {
  return REVIEW_PRIORITY_BY_FLAG[normalizedFlagType(type)] ?? 'environment';
}

export const REVIEW_PRIORITY_CLASS: Record<ReviewPriority, string> = {
  identity: 'border-error/35 bg-error/10 text-error',
  behavior: 'border-warning/35 bg-warning/10 text-warning',
  environment: 'border-satin bg-surface-overlay text-muted-foreground',
};
