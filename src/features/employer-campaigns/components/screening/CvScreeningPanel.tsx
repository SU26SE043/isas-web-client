import { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import {
  useAnalyzeCandidateCvs,
  useCampaignCandidateDetail,
  useCampaignCandidates,
  useInviteCampaignCandidates,
} from '../../hooks/useCampaignCandidates';
import type {
  CandidateListQuery,
  CandidateUploadResponse,
  InviteCampaignCandidatesResponse,
} from '../../types/campaign.api.types';
import { CandidateDetailDrawer } from './CandidateDetailDrawer';
import { CandidateFilterBar } from './CandidateFilterBar';
import { CandidateRankingTable } from './CandidateRankingTable';
import { CandidateUploadSummary } from './CandidateUploadSummary';
import { CvUploadZone } from './CvUploadZone';
import { InviteConfirmModal } from './InviteConfirmModal';
import { InviteResultModal } from './InviteResultModal';
import { canSelectCandidate, type PendingCvFile } from './screeningUtils';

interface CvScreeningPanelProps {
  campaignId: string;
  isActive: boolean;
}

const DEFAULT_FILTERS: CandidateListQuery = { sort: 'score' };

export function CvScreeningPanel({ campaignId, isActive }: CvScreeningPanelProps) {
  const { t } = useLanguage();
  const [pendingFiles, setPendingFiles] = useState<PendingCvFile[]>([]);
  const [view, setView] = useState<'upload' | 'ranking'>('upload');
  const [uploadSummary, setUploadSummary] = useState<CandidateUploadResponse | null>(null);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());
  const [detailCandidateId, setDetailCandidateId] = useState<string | null>(null);
  const [inviteConfirmOpen, setInviteConfirmOpen] = useState(false);
  const [inviteResult, setInviteResult] = useState<InviteCampaignCandidatesResponse | null>(null);
  const [filters, setFilters] = useState<CandidateListQuery>(DEFAULT_FILTERS);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const analyzeMutation = useAnalyzeCandidateCvs(campaignId);
  const inviteMutation = useInviteCampaignCandidates(campaignId);
  const candidatesQuery = useCampaignCandidates(campaignId, filters, {
    enabled: view === 'ranking',
  });
  const detailQuery = useCampaignCandidateDetail(campaignId, detailCandidateId, {
    enabled: Boolean(detailCandidateId),
  });

  const validFiles = pendingFiles.filter((item) => !item.errorKey);
  const allValid = pendingFiles.length > 0 && validFiles.length === pendingFiles.length;
  const canAnalyze = isActive && allValid && !analyzeMutation.isPending;

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

  useEffect(() => {
    if (!candidatesQuery.data) return;
    const alive = new Set(candidatesQuery.data.map((item) => item.id));
    setSelectedCandidateIds((prev) => {
      const next = new Set([...prev].filter((id) => alive.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [candidatesQuery.data]);

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setAnalyzeError(null);
    try {
      const result = await analyzeMutation.mutateAsync(validFiles.map((item) => item.file));
      setPendingFiles([]);
      setUploadSummary(result);
      setView('ranking');
    } catch {
      setAnalyzeError(t('employer.campaigns.screening.errors.analyzeFailed'));
    }
  };

  const handleInviteConfirm = async () => {
    const candidateIds = Array.from(selectedCandidateIds);
    try {
      const result = await inviteMutation.mutateAsync({ candidateIds });
      setInviteConfirmOpen(false);
      setInviteResult(result);
      setSelectedCandidateIds((prev) => {
        const next = new Set(prev);
        for (const item of result.invited) {
          next.delete(item.candidateId);
        }
        return next;
      });
    } catch {
      setAnalyzeError(t('employer.campaigns.screening.errors.inviteFailed'));
      setInviteConfirmOpen(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedCandidateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllSelection = (ids: string[]) => {
    setSelectedCandidateIds(new Set(ids));
  };

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="space-y-4">
      {analyzeError ? (
        <Alert variant="error">
          <AlertDescription>{analyzeError}</AlertDescription>
        </Alert>
      ) : null}

      {candidatesQuery.isError ? (
        <Alert variant="error">
          <AlertDescription>{t('employer.campaigns.screening.errors.loadCandidatesFailed')}</AlertDescription>
        </Alert>
      ) : null}

      {view === 'upload' ? (
        <>
          <CvUploadZone
            files={pendingFiles}
            onFilesChange={setPendingFiles}
            onAnalyze={() => void handleAnalyze()}
            isAnalyzing={analyzeMutation.isPending}
            canAnalyze={canAnalyze}
            isActive={isActive}
          />
          {uploadSummary ? <CandidateUploadSummary summary={uploadSummary} /> : null}
          {uploadSummary ? (
            <Button type="button" variant="outline" onClick={() => setView('ranking')}>
              {t('employer.campaigns.screening.upload.goRanking')}
            </Button>
          ) : null}
        </>
      ) : (
        <>
          {uploadSummary ? <CandidateUploadSummary summary={uploadSummary} /> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setView('upload')}>
              {t('employer.campaigns.screening.ranking.uploadMore')}
            </Button>
          </div>

          <CandidateFilterBar
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
          />

          <CandidateRankingTable
            candidates={candidates}
            selectedIds={selectedCandidateIds}
            onToggle={toggleSelection}
            onToggleAll={toggleAllSelection}
            onViewDetail={setDetailCandidateId}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />

          {selectedCandidateIds.size > 0 ? (
            <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-satin bg-surface-elevated px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {t('employer.campaigns.screening.ranking.selected').replace(
                  '{count}',
                  String(selectedCandidateIds.size),
                )}
              </p>
              <Button
                type="button"
                disabled={!isActive || inviteMutation.isPending}
                onClick={() => setInviteConfirmOpen(true)}
              >
                {t('employer.campaigns.screening.invitation.send')}
              </Button>
            </div>
          ) : null}
        </>
      )}

      <CandidateDetailDrawer
        open={Boolean(detailCandidateId)}
        onClose={() => setDetailCandidateId(null)}
        detail={detailQuery.data}
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        isSelected={detailCandidateId ? selectedCandidateIds.has(detailCandidateId) : false}
        canSelect={detailCandidate ? canSelectCandidate(detailCandidate) : false}
        onToggleSelect={() => {
          if (detailCandidateId) toggleSelection(detailCandidateId);
        }}
      />

      <InviteConfirmModal
        open={inviteConfirmOpen}
        count={selectedCandidateIds.size}
        isConfirming={inviteMutation.isPending}
        onCancel={() => setInviteConfirmOpen(false)}
        onConfirm={() => void handleInviteConfirm()}
      />

      <InviteResultModal
        open={Boolean(inviteResult)}
        result={inviteResult}
        onClose={() => setInviteResult(null)}
        onRetryFailed={() => {
          if (!inviteResult) return;
          setInviteResult(null);
          setSelectedCandidateIds(new Set(inviteResult.failed.map((item) => item.candidateId)));
          setInviteConfirmOpen(true);
        }}
      />
    </div>
  );
}
