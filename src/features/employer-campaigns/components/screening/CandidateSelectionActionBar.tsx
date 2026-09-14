import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { useInviteCampaignCandidates } from '../../hooks/useCampaignCandidates';
import { getCampaignInvitationError, getCampaignInvitationErrorKey } from '../../utils/campaignInvitationError';

interface CandidateSelectionActionBarProps {
  campaignId: string;
  candidates: CampaignCandidateListItem[];
  selectedIds: Set<string>;
  isActive: boolean;
  onClear: () => void;
  onAddCandidates?: (candidates: CampaignCandidateListItem[]) => void;
  onRefetch: () => Promise<unknown>;
}

export function CandidateSelectionActionBar({
  campaignId,
  candidates,
  selectedIds,
  isActive,
  onClear,
  onAddCandidates,
  onRefetch,
}: CandidateSelectionActionBarProps) {
  const { t } = useLanguage();
  const inviteMutation = useInviteCampaignCandidates(campaignId);
  if (selectedIds.size === 0) return null;

  const selectedCandidates = candidates.filter((candidate) => selectedIds.has(candidate.id));

  const invite = async () => {
    if (!isActive || inviteMutation.isPending || selectedCandidates.length === 0) return;
    try {
      const result = await inviteMutation.mutateAsync({
        candidateIds: selectedCandidates.map((candidate) => candidate.id),
      });
      const summary = t('employer.campaigns.screening.invitation.resultSummary')
        .replace('{{invited}}', String(result.invited.length))
        .replace('{{failed}}', String(result.failed.length));
      const reasons = result.failed.map((failure) => {
        const candidate = selectedCandidates.find((item) => item.id === failure.candidateId);
        return t('employer.campaigns.screening.invitation.failedReason')
          .replace('{{candidate}}', candidate?.fullName ?? candidate?.email ?? failure.candidateId)
          .replace('{{reason}}', failure.reason);
      });
      const message = reasons.length ? `${summary}\n${reasons.join('\n')}` : summary;
      if (result.failed.length) toast.error(message);
      else toast.success(message);
      onClear();
      await onRefetch();
    } catch (error) {
      toast.error(getCampaignInvitationError(error, t(getCampaignInvitationErrorKey(error))));
    }
  };

  return (
    <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-satin bg-surface-elevated px-4 py-3">
      <p className="text-sm text-muted-foreground">
        {t('employer.campaigns.screening.ranking.selected').replace('{count}', String(selectedIds.size))}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onClear}>
          {t('employer.campaigns.screening.ranking.clearSelection')}
        </Button>
        <Button
          type="button"
          disabled={(!isActive && !onAddCandidates) || inviteMutation.isPending}
          loading={inviteMutation.isPending}
          onClick={() => {
            if (onAddCandidates) {
              onAddCandidates(selectedCandidates);
              return;
            }
            void invite();
          }}
        >
          {t(onAddCandidates
            ? 'employer.campaigns.screening.invitation.addToList'
            : 'employer.campaigns.screening.invitation.inviteSelected').replace(
              '{{count}}',
              String(selectedIds.size),
            )}
        </Button>
      </div>
      {!isActive && !onAddCandidates ? (
        <p className="basis-full text-xs text-warning">
          {t('employer.campaigns.screening.invitation.draftDisabled')}
        </p>
      ) : null}
    </div>
  );
}
