import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  overrideHistory: (campaignId: string, sessionId: string) =>
    [...campaignResultKeys.all, campaignId, 'override-history', sessionId] as const,
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

export function useCampaignResultOverrideHistory(
  campaignId: string | undefined,
  sessionId: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: campaignResultKeys.overrideHistory(campaignId ?? '', sessionId ?? ''),
    queryFn: () => campaignManagementService.getCampaignResultOverrideHistory(campaignId!, sessionId!),
    enabled: Boolean(campaignId) && Boolean(sessionId) && (options?.enabled ?? true),
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
    onSuccess: (_, variables) => {
      if (!campaignId) return;
      void queryClient.invalidateQueries({ queryKey: campaignResultKeys.list(campaignId) });
      void queryClient.invalidateQueries({
        queryKey: campaignResultKeys.overrideHistory(campaignId, variables.sessionId),
      });
    },
  });
}

export type AnswerAudioState = 'idle' | 'loading' | 'ready' | 'error';

export function useAnswerAudio(
  campaignId: string | undefined,
  sessionId: string | undefined,
  answerId: string | null,
) {
  const [state, setState] = useState<AnswerAudioState>('idle');
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);
  const load = useCallback(async () => {
    if (!campaignId || !sessionId || !answerId || state === 'loading' || objectUrl) return;
    setState('loading');
    try {
      const blob = await campaignManagementService.getCampaignResultAnswerAudio(campaignId, sessionId, answerId);
      const nextUrl = URL.createObjectURL(blob);
      urlRef.current = nextUrl;
      setObjectUrl(nextUrl);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [answerId, campaignId, objectUrl, sessionId, state]);
  return { state, objectUrl, load };
}

export function useExportCampaignResults(campaignId: string | undefined) {
  return useMutation({
    mutationFn: (format: CampaignResultExportFormat) => {
      if (!campaignId) throw new Error('CAMPAIGN_ID_REQUIRED');
      return campaignManagementService.exportCampaignResults(campaignId, format);
    },
  });
}
