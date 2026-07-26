import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { useCampaignInvitationStore } from '../../stores/campaignInvitationStore';
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
  const navigate = useNavigate();
  const setInvitationCandidates = useCampaignInvitationStore(
    (store) => store.setSelectedCandidates,
  );
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
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => state.setSelectedCandidateIds(new Set())}
                >
                  {t('employer.campaigns.screening.ranking.clearSelection')}
                </Button>
                <Button
                  type="button"
                  disabled={!isActive}
                  onClick={() => {
                    const candidates = state.candidates
                      .filter((candidate) => state.selectedCandidateIds.has(candidate.id))
                      .filter(
                        (candidate): candidate is typeof candidate & { email: string } =>
                          Boolean(candidate.email),
                      )
                      .map((candidate) => ({
                        id: candidate.id,
                        fullName: candidate.fullName ?? undefined,
                        email: candidate.email,
                        matchScore: candidate.overallMatchScore ?? undefined,
                        source: 'cv-screening' as const,
                      }));
                    setInvitationCandidates(campaignId, candidates);
                    navigate(`/employer/campaigns/${campaignId}/invitations/new`);
                  }}
                >
                  {t('employer.campaigns.screening.invitation.continue')}
                </Button>
              </div>
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
      />
    </div>
  );
}
