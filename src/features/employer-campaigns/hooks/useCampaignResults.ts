import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignManagementService } from '../services/campaignManagement.service';
import type {
  CampaignResultExportFormat,
  OverrideCampaignResultPayload,
} from '../types/campaign.api.types';

export const campaignResultKeys = {
  all: ['employer', 'campaign', 'results'] as const,
  list: (campaignId: string) => [...campaignResultKeys.all, campaignId] as const,
  transcript: (campaignId: string, sessionId: string) =>
    [...campaignResultKeys.all, campaignId, 'transcript', sessionId] as const,
};

/** @deprecated Prefer campaignResultKeys.list */
export const EMPLOYER_CAMPAIGN_RESULTS_QUERY_KEY = campaignResultKeys.all;

export function campaignResultsQueryKey(campaignId: string) {
  return campaignResultKeys.list(campaignId);
}

export function useCampaignResults(
  campaignId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: campaignResultKeys.list(campaignId ?? ''),
    queryFn: () => campaignManagementService.getCampaignResults(campaignId!),
    enabled: Boolean(campaignId) && (options?.enabled ?? true),
  });
}

export function useCampaignResultTranscript(
  campaignId: string | undefined,
  sessionId: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: campaignResultKeys.transcript(campaignId ?? '', sessionId ?? ''),
    queryFn: () =>
      campaignManagementService.getCampaignResultTranscript(campaignId!, sessionId!),
    enabled:
      Boolean(campaignId) &&
      Boolean(sessionId) &&
      (options?.enabled ?? true),
  });
}

export function useOverrideCampaignResult(campaignId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: OverrideCampaignResultPayload;
    }) => {
      if (!campaignId) throw new Error('CAMPAIGN_ID_REQUIRED');
      return campaignManagementService.overrideCampaignResult(campaignId, sessionId, payload);
    },
    onSuccess: () => {
      if (!campaignId) return;
      void queryClient.invalidateQueries({ queryKey: campaignResultKeys.list(campaignId) });
    },
  });
}

export function useExportCampaignResults(campaignId: string | undefined) {
  return useMutation({
    mutationFn: (format: CampaignResultExportFormat) => {
      if (!campaignId) throw new Error('CAMPAIGN_ID_REQUIRED');
      return campaignManagementService.exportCampaignResults(campaignId, format);
    },
  });
}
