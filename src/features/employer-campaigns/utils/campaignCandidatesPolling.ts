import type { CampaignCandidateListItem } from '../types/campaign.api.types';

export const CAMPAIGN_CANDIDATES_POLL_INTERVAL_MS = 5_000;

export function getCampaignCandidatesRefetchInterval(
  candidates: CampaignCandidateListItem[] | undefined,
): number | false {
  if (!candidates?.length) return false;

  const hasPendingScreening = candidates.some(
    (candidate) => {
      const status = candidate.status.toLowerCase();
      return status === 'analyzing' || status === 'filtered';
    },
  );

  return hasPendingScreening ? CAMPAIGN_CANDIDATES_POLL_INTERVAL_MS : false;
}
