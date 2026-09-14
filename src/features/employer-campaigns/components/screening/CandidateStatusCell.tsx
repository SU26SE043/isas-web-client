import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { candidateScreeningStatusLabelKey } from '../../utils/candidateScreeningStatus';

interface CandidateStatusCellProps {
  candidate: CampaignCandidateListItem;
  onRescreen?: (candidateId: string) => void;
  rescreeningCandidateId?: string | null;
}

export function CandidateStatusCell({ candidate, onRescreen, rescreeningCandidateId }: CandidateStatusCellProps) {
  const { t } = useLanguage();
  return (
    <div className="text-foreground">
      <div>{t(candidateScreeningStatusLabelKey(candidate.status))}</div>
      {candidate.status.toLowerCase() === 'analysisfailed' ? (
        <>
          {candidate.rejectReason ? <p className="mt-1 text-xs text-error">{candidate.rejectReason}</p> : null}
          {onRescreen ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2"
              loading={rescreeningCandidateId === candidate.id}
              disabled={rescreeningCandidateId === candidate.id}
              onClick={() => onRescreen(candidate.id)}
            >
              {t('employer.campaigns.screening.actions.rescreen')}
            </Button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
