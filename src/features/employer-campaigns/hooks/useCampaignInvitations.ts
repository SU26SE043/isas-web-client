import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignManagementService } from '../services/campaignManagement.service';
import { EMPLOYER_CAMPAIGNS_QUERY_KEY, employerCampaignDetailQueryKey } from './useEmployerCampaigns';

export const EMPLOYER_CAMPAIGN_INVITATIONS_QUERY_KEY = [
  'employer',
  'campaign',
  'invitations',
] as const;

export const DEFAULT_INVITATIONS_PAGE_SIZE = 20;

export function campaignInvitationsQueryKey(campaignId: string) {
  return [...EMPLOYER_CAMPAIGN_INVITATIONS_QUERY_KEY, campaignId] as const;
}

export function useCampaignInvitations(
  campaignId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: campaignInvitationsQueryKey(campaignId ?? ''),
    queryFn: ({ pageParam }) =>
      campaignManagementService.getCampaignInvitations(campaignId!, {
        cursor: pageParam,
        limit: DEFAULT_INVITATIONS_PAGE_SIZE,
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
        queryKey: campaignInvitationsQueryKey(campaignId),
      });
      void queryClient.invalidateQueries({
        queryKey: employerCampaignDetailQueryKey(campaignId),
      });
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
    },
  });
}
