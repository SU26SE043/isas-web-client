import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignManagementService } from '../services/campaignManagement.service';
import { EMPLOYER_CAMPAIGNS_QUERY_KEY, employerCampaignDetailQueryKey } from './useEmployerCampaigns';

export const EMPLOYER_CAMPAIGN_INVITATIONS_QUERY_KEY = [
  'employer',
  'campaign',
  'invitations',
] as const;

export const DEFAULT_INVITATIONS_PAGE_SIZE = 20;

export function campaignInvitationsQueryKey(campaignId: string, pageSize = DEFAULT_INVITATIONS_PAGE_SIZE) {
  return [...EMPLOYER_CAMPAIGN_INVITATIONS_QUERY_KEY, campaignId, pageSize] as const;
}

export function useCampaignInvitations(
  campaignId: string | undefined,
  options?: { enabled?: boolean; pageSize?: number },
) {
  const pageSize = options?.pageSize ?? DEFAULT_INVITATIONS_PAGE_SIZE;
  return useInfiniteQuery({
    queryKey: campaignInvitationsQueryKey(campaignId ?? '', pageSize),
    queryFn: ({ pageParam }) =>
      campaignManagementService.getCampaignInvitations(campaignId!, {
        cursor: pageParam,
        limit: pageSize,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(campaignId) && (options?.enabled ?? true),
  });
}

export function useReissueCampaignInvitation(campaignId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => {
      if (!campaignId) throw new Error('CAMPAIGN_ID_REQUIRED');
      return campaignManagementService.reissueCampaignInvitation(campaignId, invitationId);
    },
    onSuccess: () => {
      if (!campaignId) return;
      void queryClient.invalidateQueries({
        queryKey: [...EMPLOYER_CAMPAIGN_INVITATIONS_QUERY_KEY, campaignId],
      });
      void queryClient.invalidateQueries({
        queryKey: employerCampaignDetailQueryKey(campaignId),
      });
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
    },
  });
}
