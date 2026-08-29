import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { useCampaignInvitationStore } from '../../stores/campaignInvitationStore';
import { CandidateFilterBar } from './CandidateFilterBar';
import { CandidateRankingTable } from './CandidateRankingTable';
import { CandidateUploadSummary } from './CandidateUploadSummary';
import { CvScreeningModals } from './CvScreeningModals';
import { CvUploadZone } from './CvUploadZone';
import { JobNeedsRescueEditor } from './JobNeedsRescueEditor';
import { toCandidateListItem, useCvScreeningPanelState } from './useCvScreeningPanelState';

interface CvScreeningPanelProps {
  campaignId: string;
  isActive: boolean;
  hasJobNeeds: boolean;
}

export function CvScreeningPanel({ campaignId, isActive, hasJobNeeds }: CvScreeningPanelProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const setInvitationCandidates = useCampaignInvitationStore(
    (store) => store.setSelectedCandidates,
  );
  const state = useCvScreeningPanelState(campaignId, isActive, hasJobNeeds);

  const handleAnalyze = async () => {
    if (!state.canAnalyze) return;
    state.setAnalyzeError(null);
    try {
      const result = await state.analyzeMutation.mutateAsync(
        state.validFiles.map((item) => item.file),
      );
      state.setPendingFiles([]);
      state.setUploadSummary(result);
      await state.candidatesQuery.refetch();
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
      {!hasJobNeeds ? (
        <JobNeedsRescueEditor campaignId={campaignId} />
      ) : null}
      {!hasJobNeeds ? (
        <Alert variant="warning">
          <AlertDescription>{t('employer.campaigns.screening.errors.jobNeedsRequired')}</AlertDescription>
        </Alert>
      ) : null}

      <CvUploadZone
        files={state.pendingFiles}
        onFilesChange={state.setPendingFiles}
        onAnalyze={() => void handleAnalyze()}
        isAnalyzing={state.analyzeMutation.isPending}
        canAnalyze={state.canAnalyze}
        isActive={isActive}
      />
      {state.uploadSummary ? <CandidateUploadSummary summary={state.uploadSummary} /> : null}

      <section className="space-y-4 border-t border-satin pt-5">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-foreground">
              {t('employer.campaigns.screening.ranking.title')}
            </h3>
            {!state.candidatesQuery.isLoading && !state.candidatesQuery.isError ? (
              <span className="text-sm text-muted-foreground">
                {t('employer.campaigns.screening.ranking.count').replace(
                  '{count}',
                  String(state.candidates.length),
                )}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('employer.campaigns.screening.ranking.description')}
          </p>
        </div>

        {state.candidatesQuery.isLoading ? (
          <div className="space-y-2" aria-busy="true">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : state.candidatesQuery.isError ? (
          <Alert variant="error">
            <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
              <span>
                {t('employer.campaigns.screening.errors.loadCandidatesDescription')}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void state.candidatesQuery.refetch()}
              >
                {t('employer.campaigns.screening.errors.retry')}
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
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
            onChooseFiles={() =>
              document.getElementById('campaign-cv-upload')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              })
            }
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
                    navigate(`/employer/campaigns/${campaignId}/invitations?tab=invite`);
                  }}
                >
                  {t('employer.campaigns.screening.invitation.continue')}
                </Button>
              </div>
            </div>
          ) : null}
          </>
        )}
      </section>

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
        onRescreenFromDetail={() => {
          if (state.detailCandidateId) {
            void state.rescreenMutation.mutateAsync(state.detailCandidateId);
          }
        }}
        isRescreening={state.rescreenMutation.isPending}
        editingCandidate={state.editingCandidate}
        onCloseEdit={() => state.setEditingCandidate(null)}
        viewingCvCandidate={state.viewingCvCandidate}
        onCloseCv={() => state.setViewingCvCandidate(null)}
      />
    </div>
  );
}
