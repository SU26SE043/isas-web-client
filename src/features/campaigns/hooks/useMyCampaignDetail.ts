import { useQuery } from '@tanstack/react-query';
import { campaignCandidateService } from '../services/campaignCandidate.service';

export function myCampaignDetailQueryKey(campaignId: string) {
  return ['campaign-candidate', 'my-campaign', campaignId] as const;
}

export function useMyCampaignDetail(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignId
      ? myCampaignDetailQueryKey(campaignId)
      : ['campaign-candidate', 'my-campaign', 'none'],
    queryFn: () => campaignCandidateService.getMyCampaignById(campaignId ?? ''),
    enabled: Boolean(campaignId?.trim()),
  });
}
