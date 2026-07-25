import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { CandidateFilterBar } from './CandidateFilterBar';
import { CandidateRankingTable } from './CandidateRankingTable';
import { CandidateUploadSummary } from './CandidateUploadSummary';
import { CvScreeningModals } from './CvScreeningModals';
import { CvUploadZone } from './CvUploadZone';
import { toCandidateListItem, useCvScreeningPanelState } from './useCvScreeningPanelState';

interface CvScreeningPanelProps {
  campaignId: string;
  isActive: boolean;
}

export function CvScreeningPanel({ campaignId, isActive }: CvScreeningPanelProps) {
  const { t } = useLanguage();
  const state = useCvScreeningPanelState(campaignId, isActive);

  const handleAnalyze = async () => {
    if (!state.canAnalyze) return;
    state.setAnalyzeError(null);
    try {
      const result = await state.analyzeMutation.mutateAsync(
        state.validFiles.map((item) => item.file),
      );
      state.setPendingFiles([]);
      state.setUploadSummary(result);
      state.setView('ranking');
    } catch {
      state.setAnalyzeError(t('employer.campaigns.screening.errors.analyzeFailed'));
    }
  };

  const handleInviteConfirm = async () => {
    try {
      const result = await state.inviteMutation.mutateAsync({
        candidateIds: Array.from(state.selectedCandidateIds),
      });
      state.setInviteConfirmOpen(false);
      state.setInviteResult(result);
      state.setSelectedCandidateIds((prev) => {
        const next = new Set(prev);
        for (const item of result.invited) next.delete(item.candidateId);
        return next;
      });
    } catch {
      state.setAnalyzeError(t('employer.campaigns.screening.errors.inviteFailed'));
      state.setInviteConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {state.analyzeError ? (
        <Alert variant="error">
          <AlertDescription>{state.analyzeError}</AlertDescription>
        </Alert>
      ) : null}

      {state.candidatesQuery.isError ? (
        <Alert variant="error">
          <AlertDescription>
            {t('employer.campaigns.screening.errors.loadCandidatesFailed')}
          </AlertDescription>
        </Alert>
      ) : null}

      {state.view === 'upload' ? (
        <>
          <CvUploadZone
            files={state.pendingFiles}
            onFilesChange={state.setPendingFiles}
            onAnalyze={() => void handleAnalyze()}
            isAnalyzing={state.analyzeMutation.isPending}
            canAnalyze={state.canAnalyze}
            isActive={isActive}
          />
          {state.uploadSummary ? <CandidateUploadSummary summary={state.uploadSummary} /> : null}
          {state.uploadSummary ? (
            <Button type="button" variant="outline" onClick={() => state.setView('ranking')}>
              {t('employer.campaigns.screening.upload.goRanking')}
            </Button>
          ) : null}
        </>
      ) : (
        <>
          {state.uploadSummary ? <CandidateUploadSummary summary={state.uploadSummary} /> : null}
          <Button type="button" variant="outline" onClick={() => state.setView('upload')}>
            {t('employer.campaigns.screening.ranking.uploadMore')}
          </Button>
          <CandidateFilterBar
            filters={state.filters}
            onChange={state.setFilters}
            onClear={() => state.setFilters(state.DEFAULT_FILTERS)}
          />
          <CandidateRankingTable
            candidates={state.candidates}
            selectedIds={state.selectedCandidateIds}
            onToggle={state.toggleSelection}
            onToggleAll={(ids) => state.setSelectedCandidateIds(new Set(ids))}
            onViewDetail={state.setDetailCandidateId}
            onViewCv={state.setViewingCvCandidate}
            onEdit={state.openEdit}
            hasActiveFilters={state.hasActiveFilters}
            onClearFilters={() => state.setFilters(state.DEFAULT_FILTERS)}
          />
          {state.selectedCandidateIds.size > 0 ? (
            <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-satin bg-surface-elevated px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {t('employer.campaigns.screening.ranking.selected').replace(
                  '{count}',
                  String(state.selectedCandidateIds.size),
                )}
              </p>
              <Button
                type="button"
                disabled={!isActive || state.inviteMutation.isPending}
                onClick={() => state.setInviteConfirmOpen(true)}
              >
                {t('employer.campaigns.screening.invitation.send')}
              </Button>
            </div>
          ) : null}
        </>
      )}

      <CvScreeningModals
        campaignId={campaignId}
        detailCandidateId={state.detailCandidateId}
        detail={state.detailQuery.data}
        detailLoading={state.detailQuery.isLoading}
        detailError={state.detailQuery.isError}
        isDetailSelected={
          state.detailCandidateId
            ? state.selectedCandidateIds.has(state.detailCandidateId)
            : false
        }
        canSelectDetail={state.canSelectDetail}
        onCloseDetail={() => state.setDetailCandidateId(null)}
        onToggleDetailSelect={() => {
          if (state.detailCandidateId) state.toggleSelection(state.detailCandidateId);
        }}
        onViewCvFromDetail={() => {
          if (state.detailForActions) {
            state.setViewingCvCandidate(toCandidateListItem(state.detailForActions));
          }
        }}
        onEditFromDetail={() => {
          if (state.detailForActions) state.openEdit(toCandidateListItem(state.detailForActions));
        }}
        editingCandidate={state.editingCandidate}
        onCloseEdit={() => state.setEditingCandidate(null)}
        viewingCvCandidate={state.viewingCvCandidate}
        onCloseCv={() => state.setViewingCvCandidate(null)}
        inviteConfirmOpen={state.inviteConfirmOpen}
        inviteCount={state.selectedCandidateIds.size}
        inviteConfirming={state.inviteMutation.isPending}
        onCancelInvite={() => state.setInviteConfirmOpen(false)}
        onConfirmInvite={() => void handleInviteConfirm()}
        inviteResult={state.inviteResult}
        onCloseInviteResult={() => state.setInviteResult(null)}
        onRetryInviteFailed={() => {
          if (!state.inviteResult) return;
          state.setInviteResult(null);
          state.setSelectedCandidateIds(
            new Set(state.inviteResult.failed.map((item) => item.candidateId)),
          );
          state.setInviteConfirmOpen(true);
        }}
      />
    </div>
  );
}
