import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EMPLOYER_CAMPAIGNS_QUERY_KEY, employerCampaignDetailQueryKey } from './useEmployerCampaigns';
import { campaignManagementService } from '../services/campaignManagement.service';
import type { CreateCampaignInvitationsRequest } from '../types/campaign.api.types';

export function useCreateCampaignInvitations(campaignId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCampaignInvitationsRequest) => {
      if (!campaignId) throw new Error('CAMPAIGN_ID_REQUIRED');
      return campaignManagementService.createCampaignInvitations(campaignId, payload);
    },
    onSuccess: () => {
      if (!campaignId) return;
      void queryClient.invalidateQueries({ queryKey: employerCampaignDetailQueryKey(campaignId) });
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
    },
  });
}
