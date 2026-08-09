import { useInfiniteQuery } from '@tanstack/react-query';
import { campaignCandidateService } from '../services/campaignCandidate.service';

export const MY_CAMPAIGNS_QUERY_KEY = ['campaign-candidate', 'my-campaigns'] as const;

export function useMyCampaigns() {
  return useInfiniteQuery({
    queryKey: MY_CAMPAIGNS_QUERY_KEY,
    queryFn: ({ pageParam }) =>
      campaignCandidateService.getMyCampaigns({ cursor: pageParam, limit: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
