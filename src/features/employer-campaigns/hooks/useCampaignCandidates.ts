import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignManagementService } from '../services/campaignManagement.service';
import type {
  CandidateListQuery,
  InviteCampaignCandidatesRequest,
  UpdateCampaignCandidatePayload,
} from '../types/campaign.api.types';
import { getCampaignCandidatesRefetchInterval } from '../utils/campaignCandidatesPolling';

export {
  campaignResultKeys,
  campaignResultsQueryKey,
  EMPLOYER_CAMPAIGN_RESULTS_QUERY_KEY,
  useCampaignResults,
} from './useCampaignResults';

export const EMPLOYER_CAMPAIGN_CANDIDATES_QUERY_KEY = ['employer', 'campaign', 'candidates'] as const;
export const EMPLOYER_CAMPAIGN_CANDIDATE_DETAIL_QUERY_KEY = [
  'employer',
  'campaign',
  'candidate',
] as const;

export function campaignCandidatesQueryKey(campaignId: string, query?: CandidateListQuery) {
  return [...EMPLOYER_CAMPAIGN_CANDIDATES_QUERY_KEY, campaignId, query ?? {}] as const;
}

export function campaignCandidateDetailQueryKey(campaignId: string, candidateId: string) {
  return [...EMPLOYER_CAMPAIGN_CANDIDATE_DETAIL_QUERY_KEY, campaignId, candidateId] as const;
}

function invalidateCampaignCandidates(
  queryClient: ReturnType<typeof useQueryClient>,
  campaignId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: [...EMPLOYER_CAMPAIGN_CANDIDATES_QUERY_KEY, campaignId],
  });
  void queryClient.invalidateQueries({
    queryKey: [...EMPLOYER_CAMPAIGN_CANDIDATE_DETAIL_QUERY_KEY, campaignId],
  });
}

export function useCampaignCandidates(
  campaignId: string | undefined,
  query?: CandidateListQuery,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: campaignCandidatesQueryKey(campaignId ?? '', query),
    queryFn: () => campaignManagementService.getCampaignCandidates(campaignId!, query),
    enabled: Boolean(campaignId) && (options?.enabled ?? true),
    refetchInterval: (query) => getCampaignCandidatesRefetchInterval(query.state.data),
    refetchIntervalInBackground: false,
  });
}

export function useCampaignCandidateDetail(
  campaignId: string | undefined,
  candidateId: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: campaignCandidateDetailQueryKey(campaignId ?? '', candidateId ?? ''),
    queryFn: () =>
      campaignManagementService.getCampaignCandidateDetail(campaignId!, candidateId!),
    enabled: Boolean(campaignId) && Boolean(candidateId) && (options?.enabled ?? true),
  });
}

export function useAnalyzeCandidateCvs(campaignId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => {
      if (!campaignId) throw new Error('CAMPAIGN_ID_REQUIRED');
      return campaignManagementService.analyzeCandidateCvs(campaignId, files);
    },
    onSuccess: () => {
      if (!campaignId) return;
      invalidateCampaignCandidates(queryClient, campaignId);
    },
  });
}

export function useInviteCampaignCandidates(campaignId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteCampaignCandidatesRequest) => {
      if (!campaignId) throw new Error('CAMPAIGN_ID_REQUIRED');
      return campaignManagementService.inviteCampaignCandidates(campaignId, payload);
    },
    onSuccess: () => {
      if (!campaignId) return;
      invalidateCampaignCandidates(queryClient, campaignId);
    },
  });
}

export function useUpdateCampaignCandidate(campaignId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      candidateId,
      payload,
    }: {
      candidateId: string;
      payload: UpdateCampaignCandidatePayload;
    }) => {
      if (!campaignId) throw new Error('CAMPAIGN_ID_REQUIRED');
      return campaignManagementService.updateCampaignCandidate(campaignId, candidateId, payload);
    },
    onSuccess: (_data, variables) => {
      if (!campaignId) return;
      invalidateCampaignCandidates(queryClient, campaignId);
      void queryClient.invalidateQueries({
        queryKey: campaignCandidateDetailQueryKey(campaignId, variables.candidateId),
      });
    },
  });
}

export function useRescreenCampaignCandidate(campaignId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (candidateId: string) => {
      if (!campaignId) throw new Error('CAMPAIGN_ID_REQUIRED');
      return campaignManagementService.rescreenCampaignCandidate(campaignId, candidateId);
    },
    onSuccess: (_data, candidateId) => {
      if (!campaignId) return;
      invalidateCampaignCandidates(queryClient, campaignId);
      void queryClient.invalidateQueries({
        queryKey: campaignCandidateDetailQueryKey(campaignId, candidateId),
      });
    },
  });
}
