import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  EMPLOYER_CAMPAIGNS_QUERY_KEY,
  employerCampaignDetailQueryKey,
} from './useEmployerCampaigns';
import { campaignManagementService } from '../services/campaignManagement.service';
import type { GenerateCampaignQuestionsParams } from '../types/campaign.api.types';

export function useGenerateCampaignQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: GenerateCampaignQuestionsParams) =>
      campaignManagementService.generateCampaignQuestions(params),
    onSuccess: (campaign) => {
      queryClient.setQueryData(employerCampaignDetailQueryKey(campaign.id), campaign);
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
    },
  });
}
