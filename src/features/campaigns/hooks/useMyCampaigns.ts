import { useQuery } from '@tanstack/react-query';
import { campaignCandidateService } from '../services/campaignCandidate.service';

export const MY_CAMPAIGNS_QUERY_KEY = ['campaign-candidate', 'my-campaigns'] as const;

export function useMyCampaigns() {
  return useQuery({
    queryKey: MY_CAMPAIGNS_QUERY_KEY,
    queryFn: () => campaignCandidateService.getMyCampaigns(),
  });
}
