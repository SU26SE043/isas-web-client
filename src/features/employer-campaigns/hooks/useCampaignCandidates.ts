import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignManagementService } from '../services/campaignManagement.service';
import type {
  CandidateListQuery,
  InviteCampaignCandidatesRequest,
} from '../types/campaign.api.types';

export const EMPLOYER_CAMPAIGN_CANDIDATES_QUERY_KEY = ['employer', 'campaign', 'candidates'] as const;
export const EMPLOYER_CAMPAIGN_CANDIDATE_DETAIL_QUERY_KEY = [
  'employer',
  'campaign',
  'candidate',
] as const;
export const EMPLOYER_CAMPAIGN_RESULTS_QUERY_KEY = ['employer', 'campaign', 'results'] as const;

export function campaignCandidatesQueryKey(campaignId: string, query?: CandidateListQuery) {
  return [...EMPLOYER_CAMPAIGN_CANDIDATES_QUERY_KEY, campaignId, query ?? {}] as const;
}

export function campaignCandidateDetailQueryKey(campaignId: string, candidateId: string) {
  return [...EMPLOYER_CAMPAIGN_CANDIDATE_DETAIL_QUERY_KEY, campaignId, candidateId] as const;
}

export function campaignResultsQueryKey(campaignId: string) {
  return [...EMPLOYER_CAMPAIGN_RESULTS_QUERY_KEY, campaignId] as const;
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
    enabled:
      Boolean(campaignId) &&
      Boolean(candidateId) &&
      (options?.enabled ?? true),
  });
}

export function useCampaignResults(
  campaignId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: campaignResultsQueryKey(campaignId ?? ''),
    queryFn: () => campaignManagementService.getCampaignResults(campaignId!),
    enabled: Boolean(campaignId) && (options?.enabled ?? true),
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
      void queryClient.invalidateQueries({
        queryKey: [...EMPLOYER_CAMPAIGN_CANDIDATES_QUERY_KEY, campaignId],
      });
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
      void queryClient.invalidateQueries({
        queryKey: [...EMPLOYER_CAMPAIGN_CANDIDATES_QUERY_KEY, campaignId],
      });
    },
  });
}
