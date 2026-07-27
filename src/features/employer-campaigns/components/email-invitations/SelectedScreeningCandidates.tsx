import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { SelectedInvitationCandidate } from '../../stores/campaignInvitationStore';

interface SelectedScreeningCandidatesProps {
  candidates: SelectedInvitationCandidate[];
  disabled: boolean;
  onRemove: (email: string) => void;
}

export function SelectedScreeningCandidates({
  candidates,
  disabled,
  onRemove,
}: SelectedScreeningCandidatesProps) {
  const { t } = useLanguage();
  if (candidates.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          {t('employer.campaigns.invitationDraft.screeningSource')}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('employer.campaigns.invitationDraft.screeningSourceDescription')}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {candidates.map((candidate) => (
          <article
            key={candidate.email}
            className="flex items-start gap-3 rounded-xl border border-satin bg-surface-overlay p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {candidate.fullName || candidate.email}
              </p>
              <p className="truncate text-xs text-muted-foreground">{candidate.email}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-foreground/[0.06] px-2 py-1 text-foreground">
                  {t('employer.campaigns.invitationDraft.sourceCv')}
                </span>
                {candidate.matchScore != null ? (
                  <span className="rounded-full bg-success/10 px-2 py-1 text-success">
                    {candidate.matchScore}% {t('employer.campaigns.invitationDraft.match')}
                  </span>
                ) : null}
              </div>
            </div>
            <Button
              type="button"
              size="icon-sm"
              variant="destructive"
              disabled={disabled}
              aria-label={t('employer.campaigns.emailInvitations.list.remove')}
              onClick={() => onRemove(candidate.email)}
            >
              <Trash2 aria-hidden />
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
