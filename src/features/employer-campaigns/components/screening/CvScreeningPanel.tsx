import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { CandidateFilterBar } from './CandidateFilterBar';
import { CandidateRankingTable } from './CandidateRankingTable';
import { CandidateAnalysisProgress } from './CandidateAnalysisProgress';
import { CandidateSelectionActionBar } from './CandidateSelectionActionBar';
import { CvScreeningModals } from './CvScreeningModals';
import { CvUploadZone } from './CvUploadZone';
import { toCandidateListItem, useCvScreeningPanelState } from './useCvScreeningPanelState';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';

interface CvScreeningPanelProps {
  campaignId: string;
  isActive: boolean;
  allowDraftScreening?: boolean;
  hideInvitationAction?: boolean;
  onAddCandidates?: (candidates: CampaignCandidateListItem[]) => void;
}

export function hasScoredCandidate(candidates: Pick<CampaignCandidateListItem, 'overallMatchScore'>[]): boolean {
  return candidates.some((candidate) => candidate.overallMatchScore != null);
}

export function CvScreeningPanel({ campaignId, isActive, allowDraftScreening = false, hideInvitationAction = false, onAddCandidates }: CvScreeningPanelProps) {
  const { t } = useLanguage();
  const screeningEnabled = isActive || allowDraftScreening;
  const state = useCvScreeningPanelState(campaignId, screeningEnabled);

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
      <CvUploadZone
        files={state.pendingFiles}
        onFilesChange={state.setPendingFiles}
        onAnalyze={() => void handleAnalyze()}
        isAnalyzing={state.analyzeMutation.isPending}
        canAnalyze={state.canAnalyze}
        isActive={screeningEnabled}
      />
      {state.uploadSummary ? (
        <CandidateAnalysisProgress
          candidates={state.candidates}
          trackedCandidateIds={new Set(state.uploadSummary.candidates.map((candidate) => candidate.id))}
        />
      ) : null}

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
          {state.hasActiveFilters ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {t('employer.campaigns.screening.ranking.filteredRankNote')}
            </p>
          ) : null}
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
            onUpdateEmail={async (candidateId, email) => {
              await state.updateCandidateMutation.mutateAsync({ candidateId, payload: { email: email.trim() } });
            }}
            updatingCandidateId={state.updateCandidateMutation.isPending ? state.updateCandidateMutation.variables?.candidateId : null}
            allowIneligibleSelection={allowDraftScreening}
            onRescreen={(candidateId) => void state.rescreenMutation.mutateAsync(candidateId)}
            rescreeningCandidateId={state.rescreenMutation.isPending ? state.rescreenMutation.variables : null}
            allowMissingEmailSelection={!onAddCandidates}
          />
          {!hideInvitationAction || onAddCandidates ? (
            <CandidateSelectionActionBar
              campaignId={campaignId}
              candidates={state.candidates}
              selectedIds={state.selectedCandidateIds}
              isActive={isActive}
              onClear={() => state.setSelectedCandidateIds(new Set())}
              onAddCandidates={onAddCandidates}
              onRefetch={state.candidatesQuery.refetch}
            />
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
