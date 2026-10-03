import type { CampaignUnscoredFlaggedResult } from '../types/campaign.api.types';

export function getUnscoredFlaggedStatusKeys(item: CampaignUnscoredFlaggedResult): {
  label: string;
  detail?: string;
} {
  if (item.isLatestAttempt === false) {
    return { label: 'employer.campaigns.results.unscoredFlagged.previousAttempt' };
  }

  if (item.interviewStatus === 'InProgress') {
    return { label: 'employer.campaigns.results.unscoredFlagged.inProgress' };
  }

  if (item.interviewStatus === 'Abandoned') {
    switch (item.abandonReason) {
      case 'generation_failed':
        return {
          label: 'employer.campaigns.results.unscoredFlagged.generationFailed',
          detail: 'employer.campaigns.results.unscoredFlagged.notCandidateFault',
        };
      case 'no_scored_answer':
        return { label: 'employer.campaigns.results.unscoredFlagged.noScoredAnswer' };
      case 'expired_no_answer':
        return { label: 'employer.campaigns.results.unscoredFlagged.expiredNoAnswer' };
      default:
        return { label: 'employer.campaigns.results.unscoredFlagged.abandoned' };
    }
  }

  return { label: 'employer.campaigns.results.unscoredFlagged.noScore' };
}
