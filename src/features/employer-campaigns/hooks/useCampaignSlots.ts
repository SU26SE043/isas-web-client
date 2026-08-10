import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignManagementService } from '../services/campaignManagement.service';
import type { CampaignSlotRequest } from '../types/campaign.api.types';

export const CAMPAIGN_SLOTS_QUERY_KEY = ['employer', 'campaign', 'slots'] as const;

export function campaignSlotsQueryKey(campaignId: string) {
  return [...CAMPAIGN_SLOTS_QUERY_KEY, campaignId] as const;
}

export function useCampaignSlots(campaignId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: campaignSlotsQueryKey(campaignId ?? ''),
    queryFn: () => campaignManagementService.getCampaignSlots(campaignId!),
    enabled: Boolean(campaignId) && enabled,
    retry: 1,
  });
}

export function useCampaignSlotMutations(campaignId: string) {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: campaignSlotsQueryKey(campaignId) });

  const create = useMutation({
    mutationFn: (payload: CampaignSlotRequest) =>
      campaignManagementService.createCampaignSlot(campaignId, payload),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({ slotId, payload }: { slotId: string; payload: CampaignSlotRequest }) =>
      campaignManagementService.updateCampaignSlot(campaignId, slotId, payload),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (slotId: string) => campaignManagementService.deleteCampaignSlot(campaignId, slotId),
    onSuccess: refresh,
  });

  return { create, update, remove };
}
