import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignIntegrationsService } from '../services/campaignIntegrations.service';
import type { CreateCampaignApiKeyRequest } from '../services/campaignIntegrations.types';

export const CAMPAIGN_API_KEYS_QUERY_KEY = ['employer', 'campaign', 'api-keys'] as const;

export function useCampaignApiKeys(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CAMPAIGN_API_KEYS_QUERY_KEY,
    queryFn: campaignIntegrationsService.listApiKeys,
    enabled: options?.enabled ?? true,
  });
}

export function useCreateCampaignApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignApiKeyRequest) => campaignIntegrationsService.createApiKey(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CAMPAIGN_API_KEYS_QUERY_KEY }),
  });
}

export function useRevokeCampaignApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => campaignIntegrationsService.revokeApiKey(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CAMPAIGN_API_KEYS_QUERY_KEY }),
  });
}
