import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';
import { campaignManagementService } from '../services/campaignManagement.service';
import type { InviteResultState } from './CampaignInviteResultPage';

function parseEmails(raw: string) {
  const tokens = raw
    .split(/[\n,;]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const valid: string[] = [];
  const invalid: Array<{ value: string; reason: string }> = [];
  const seen = new Set<string>();
  for (const token of tokens) {
    if (seen.has(token)) {
      invalid.push({ value: token, reason: 'duplicate' });
      continue;
    }
    seen.add(token);
    if (!token.includes('@') || !token.includes('.')) {
      invalid.push({ value: token, reason: 'format' });
      continue;
    }
    valid.push(token);
  }
  return { valid, invalid };
}

function inviteErrorMessage(err: unknown, t: (key: string) => string): string {
  const status = campaignManagementService.getErrorStatus(err);
  if (status === 409) return t('employer.campaigns.inviteFlow.error.notActive');
  if (status === 404) return t('employer.campaigns.inviteFlow.error.notFound');
  if (status === 400) return t('employer.campaigns.inviteFlow.error.badRequest');
  return t('employer.campaigns.inviteFlow.inviteFailed');
}

export function CampaignInviteEmailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { campaign, invite } = useEmployerCampaign(id);
  const draftFromRetry =
    typeof (location.state as { draftEmails?: unknown } | null)?.draftEmails === 'string'
      ? (location.state as { draftEmails: string }).draftEmails
      : '';
  const [raw, setRaw] = useState(draftFromRetry);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => parseEmails(raw), [raw]);

  useEffect(() => {
    if (campaign && campaign.status !== 'active') {
      navigate(`/employer/campaigns/${id}/invite`, { replace: true });
    }
  }, [campaign, id, navigate]);

  const handleInvite = async () => {
    if (parsed.valid.length === 0) {
      setError(t('employer.campaigns.inviteFlow.noValidEmails'));
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await invite(id, parsed.valid);
      const resultState: InviteResultState = {
        method: 'email',
        invited: result.created.map((row) => ({
          email: row.email,
          invitationId: row.id,
          expiresAt: row.expiresAt,
        })),
        failed: result.rejected.map((row) => ({
          email: row.email,
          reason: row.reason,
        })),
        emailsDraft: raw,
        submittedAt: new Date().toISOString(),
      };
      navigate(`/employer/campaigns/${id}/invite/result`, {
        state: resultState,
        replace: true,
      });
      if (result.created.length > 0 && result.rejected.length === 0) {
        toast.success(t('employer.campaigns.inviteFlow.inviteSuccess'));
      } else if (result.created.length === 0) {
        toast.error(t('employer.campaigns.inviteFlow.inviteAllFailed'));
      }
    } catch (err) {
      setError(inviteErrorMessage(err, t));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-3xl space-y-6">
        <Link
          to={`/employer/campaigns/${id}/invite`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t('employer.campaigns.inviteFlow.backToMethod')}
        </Link>

        <header className="space-y-1">
          <h1 className="heading-primary text-3xl text-foreground">
            {t('employer.campaigns.inviteFlow.emailTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('employer.campaigns.inviteFlow.emailDesc')}
          </p>
        </header>

        {error ? (
          <p className="rounded-lg border border-error/40 bg-error-bg px-3 py-2 text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="invite-emails">{t('employer.campaigns.invite.emails')}</Label>
          <textarea
            id="invite-emails"
            rows={10}
            className="w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm"
            placeholder={t('employer.campaigns.selection.placeholder')}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {t('employer.campaigns.inviteFlow.emailSummary')
              .replace('{valid}', String(parsed.valid.length))
              .replace('{invalid}', String(parsed.invalid.length))}
          </p>
        </div>

        {parsed.invalid.length > 0 ? (
          <ul className="space-y-1 rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm text-muted-foreground">
            {parsed.invalid.map((item) => (
              <li key={`${item.value}-${item.reason}`}>
                {item.value} — {t(`employer.campaigns.inviteFlow.emailError.${item.reason}`)}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={isSubmitting || parsed.valid.length === 0}
            loading={isSubmitting}
            onClick={() => void handleInvite()}
          >
            {t('employer.campaigns.inviteFlow.sendEmails')}
          </Button>
          <Button variant="outline" render={<Link to={`/employer/campaigns/${id}/invite`} />}>
            {t('employer.campaigns.inviteFlow.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
