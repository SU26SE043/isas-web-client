import { useEffect, useMemo, useState } from 'react';
import {
  useAnalyzeCandidateCvs,
  useCampaignCandidateDetail,
  useCampaignCandidates,
} from '../../hooks/useCampaignCandidates';
import type {
  CampaignCandidateListItem,
  CandidateListQuery,
  CandidateUploadResponse,
} from '../../types/campaign.api.types';
import { canEditCandidate } from '../../utils/campaignCandidateActions';
import { canSelectCandidate, type PendingCvFile } from './screeningUtils';

const DEFAULT_FILTERS: CandidateListQuery = { sort: 'score' };

export function toCandidateListItem(item: {
  id: string;
  fullName?: string | null;
  email?: string | null;
  status: string;
  overallMatchScore?: number | null;
  skills?: string[] | null;
}): CampaignCandidateListItem {
  return {
    id: item.id,
    fullName: item.fullName,
    email: item.email,
    status: item.status,
    overallMatchScore: item.overallMatchScore,
    skills: item.skills,
  };
}

export function useCvScreeningPanelState(campaignId: string, isActive: boolean) {
  const [pendingFiles, setPendingFiles] = useState<PendingCvFile[]>([]);
  const [uploadSummary, setUploadSummary] = useState<CandidateUploadResponse | null>(null);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());
  const [detailCandidateId, setDetailCandidateId] = useState<string | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<CampaignCandidateListItem | null>(null);
  const [viewingCvCandidate, setViewingCvCandidate] =
    useState<CampaignCandidateListItem | null>(null);
  const [filters, setFilters] = useState<CandidateListQuery>(DEFAULT_FILTERS);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const analyzeMutation = useAnalyzeCandidateCvs(campaignId);
  const candidatesQuery = useCampaignCandidates(campaignId, filters);
  const detailQuery = useCampaignCandidateDetail(campaignId, detailCandidateId, {
    enabled: Boolean(detailCandidateId),
  });

  const validFiles = pendingFiles.filter((item) => !item.errorKey);
  const canAnalyze =
    isActive &&
    pendingFiles.length > 0 &&
    validFiles.length === pendingFiles.length &&
    !analyzeMutation.isPending;

  const hasActiveFilters = useMemo(
    () =>
      Boolean(filters.status?.trim()) ||
      filters.minScore != null ||
      Boolean(filters.skill?.trim()) ||
      (filters.sort != null && filters.sort !== 'score'),
    [filters],
  );

  const candidates = candidatesQuery.data ?? [];
  const detailCandidate = candidates.find((item) => item.id === detailCandidateId);
  const detailForActions = detailQuery.data ?? detailCandidate ?? null;

  useEffect(() => {
    setSelectedCandidateIds(new Set());
    setDetailCandidateId(null);
    setEditingCandidate(null);
    setViewingCvCandidate(null);
    setPendingFiles([]);
    setUploadSummary(null);
    setAnalyzeError(null);
  }, [campaignId]);

  useEffect(() => {
    if (!candidatesQuery.data) return;
    const alive = new Set(candidatesQuery.data.map((item) => item.id));
    setSelectedCandidateIds((prev) => {
      const next = new Set([...prev].filter((id) => alive.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [candidatesQuery.data]);

  const openEdit = (candidate: CampaignCandidateListItem) => {
    if (!canEditCandidate(candidate)) return;
    setEditingCandidate(candidate);
  };

  const toggleSelection = (id: string) => {
    setSelectedCandidateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return {
    DEFAULT_FILTERS,
    pendingFiles,
    setPendingFiles,
    uploadSummary,
    setUploadSummary,
    selectedCandidateIds,
    setSelectedCandidateIds,
    detailCandidateId,
    setDetailCandidateId,
    editingCandidate,
    setEditingCandidate,
    viewingCvCandidate,
    setViewingCvCandidate,
    filters,
    setFilters,
    analyzeError,
    setAnalyzeError,
    analyzeMutation,
    candidatesQuery,
    detailQuery,
    validFiles,
    canAnalyze,
    hasActiveFilters,
    candidates,
    detailCandidate,
    detailForActions,
    openEdit,
    toggleSelection,
    canSelectDetail: detailCandidate ? canSelectCandidate(detailCandidate) : false,
  };
}
