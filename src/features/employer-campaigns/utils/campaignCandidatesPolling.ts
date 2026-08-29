import type { CampaignCandidateListItem } from '../types/campaign.api.types';

export const CAMPAIGN_CANDIDATES_POLL_INTERVAL_MS = 5_000;

export function getCampaignCandidatesRefetchInterval(
  candidates: CampaignCandidateListItem[] | undefined,
): number | false {
  if (!candidates?.length) return false;

  const hasPendingScreening = candidates.some(
    (candidate) => candidate.status === 'Analyzing' || candidate.status === 'Filtered',
  );

  return hasPendingScreening ? CAMPAIGN_CANDIDATES_POLL_INTERVAL_MS : false;
}
