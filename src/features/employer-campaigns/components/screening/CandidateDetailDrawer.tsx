import { Eye, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/shared/languages';
import type { CampaignCandidateDetail } from '../../types/campaign.api.types';
import { canEditCandidate } from '../../utils/campaignCandidateActions';

interface CandidateDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  detail: CampaignCandidateDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  canSelect: boolean;
  onViewCv: () => void;
  onEdit: () => void;
}

export function CandidateDetailDrawer({
  open,
  onClose,
  detail,
  isLoading,
  isError,
  isSelected,
  onToggleSelect,
  canSelect,
  onViewCv,
  onEdit,
}: CandidateDetailDrawerProps) {
  const { t } = useLanguage();
  const canEdit = detail ? canEditCandidate(detail) : false;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.screening.detail.title')}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-8" label={t('employer.campaigns.screening.upload.analyzing')} />
          </div>
        ) : null}

        {isError ? (
          <Alert variant="error">
            <AlertDescription>
              {t('employer.campaigns.screening.errors.candidateNotFound')}
            </AlertDescription>
          </Alert>
        ) : null}

        {detail && !isLoading ? (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info
                label={t('employer.campaigns.screening.ranking.candidate')}
                value={detail.fullName ?? '—'}
              />
              <Info
                label={t('employer.campaigns.screening.edit.email')}
                value={detail.email ?? '—'}
              />
              <Info label={t('employer.campaigns.screening.ranking.status')} value={detail.status} />
              <Info
                label={t('employer.campaigns.screening.ranking.matchScore')}
                value={
                  detail.overallMatchScore != null ? `${detail.overallMatchScore}%` : '—'
                }
              />
              <Info
                label={t('employer.campaigns.screening.detail.experience')}
                value={
                  detail.yearsExperience != null ? String(detail.yearsExperience) : '—'
                }
              />
            </div>

            <section>
              <h4 className="text-sm font-medium text-foreground">
                {t('employer.campaigns.screening.detail.summary')}
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {detail.summary?.trim() || t('employer.campaigns.screening.detail.summaryEmpty')}
              </p>
            </section>

            {detail.rejectReason ? (
              <Alert variant="warning">
                <AlertDescription>
                  <span className="font-medium">
                    {t('employer.campaigns.screening.detail.rejectReason')}
                  </span>
                  <span className="mt-1 block">{detail.rejectReason}</span>
                </AlertDescription>
              </Alert>
            ) : null}

            {detail.criterionScores.length > 0 ? (
              <section className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">
                  {t('employer.campaigns.screening.detail.criterionScores')}
                </h4>
                {detail.criterionScores.map((score) => (
                  <div
                    key={score.criterionId}
                    className="rounded-lg border border-satin bg-surface-overlay px-3 py-2"
                  >
                    <p className="text-sm font-medium text-foreground">{score.criterionName}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('employer.campaigns.screening.detail.match')}: {score.matchScore} /{' '}
                      {t('employer.campaigns.screening.detail.max')}: {score.maxScore}
                    </p>
                    {score.reasoning ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('employer.campaigns.screening.detail.reasoning')}: {score.reasoning}
                      </p>
                    ) : null}
                  </div>
                ))}
              </section>
            ) : null}
          </div>
        ) : null}

        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={!detail} onClick={onViewCv}>
              <Eye className="size-4" aria-hidden />
              {t('employer.campaigns.screening.actions.viewCv')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!detail || !canEdit}
              title={
                detail && !canEdit
                  ? t('employer.campaigns.screening.edit.invitedDisabled')
                  : undefined
              }
              onClick={onEdit}
            >
              <Pencil className="size-4" aria-hidden />
              {t('employer.campaigns.screening.actions.edit')}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {canSelect ? (
              <Button type="button" variant="outline" onClick={onToggleSelect}>
                {isSelected
                  ? t('employer.campaigns.screening.ranking.clearSelection')
                  : t('employer.campaigns.screening.detail.selectShortlist')}
              </Button>
            ) : null}
            <Button type="button" onClick={onClose}>
              {t('employer.campaigns.screening.detail.close')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-satin bg-surface-overlay px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
