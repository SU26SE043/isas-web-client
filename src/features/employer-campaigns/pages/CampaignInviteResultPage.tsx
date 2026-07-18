import { CheckCircle2, CircleAlert, Mail, XCircle } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';

export type InviteResultState = {
  method?: 'cv' | 'email';
  invited?: Array<{ email: string; invitationId?: string; expiresAt?: string | null }>;
  failed?: Array<{ email: string; reason: string }>;
  /** Original textarea content for retry (email flow). */
  emailsDraft?: string;
  /** Client timestamp when the invite request succeeded (HTTP 200). */
  submittedAt?: string;
};

function formatDateTime(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function CampaignInviteResultPage() {
  const { id = '' } = useParams();
  const { t, language } = useLanguage();
  const location = useLocation();
  const state = (location.state as InviteResultState | null) ?? {};
  const invited = state.invited ?? [];
  const failed = state.failed ?? [];
  const hasPayload = Array.isArray(state.invited) || Array.isArray(state.failed);
  const isFullSuccess = hasPayload && invited.length > 0 && failed.length === 0;
  const hasFailures = failed.length > 0;
  const emailRetryPath = `/employer/campaigns/${id}/invite/email`;
  const inviteHomePath = `/employer/campaigns/${id}/invite`;
  const detailPath = `/employer/campaigns/${id}`;

  if (!hasPayload) {
    return (
      <div className="h-full overflow-y-auto bg-surface-base">
        <div className="page-container page-section mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
          <CircleAlert className="size-14 text-muted-foreground" aria-hidden />
          <div className="space-y-2">
            <h1 className="heading-primary text-2xl text-foreground">
              {t('employer.campaigns.inviteFlow.resultEmptyTitle')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('employer.campaigns.inviteFlow.resultEmptyDescription')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button render={<Link to={detailPath} />}>
              {t('employer.campaigns.inviteFlow.backToDetail')}
            </Button>
            <Button variant="outline" render={<Link to={inviteHomePath} />}>
              {t('employer.campaigns.inviteFlow.inviteMore')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-xl space-y-6">
        <header className="flex flex-col items-center gap-4 text-center">
          {isFullSuccess ? (
            <CheckCircle2 className="size-16 text-success" aria-hidden />
          ) : (
            <CircleAlert
              className={`size-16 ${invited.length > 0 ? 'text-warning' : 'text-error'}`}
              aria-hidden
            />
          )}
          <div className="space-y-2">
            <h1 className="heading-primary text-3xl text-foreground">
              {isFullSuccess
                ? t('employer.campaigns.inviteFlow.resultSuccessTitle')
                : invited.length > 0
                  ? t('employer.campaigns.inviteFlow.resultPartialTitle')
                  : t('employer.campaigns.inviteFlow.resultFailTitle')}
            </h1>
            <p className="body-text text-sm text-muted-foreground">
              {isFullSuccess
                ? t('employer.campaigns.inviteFlow.resultSuccessDescription')
                : t('employer.campaigns.inviteFlow.resultSummary')
                    .replace('{ok}', String(invited.length))
                    .replace('{fail}', String(failed.length))}
            </p>
            {isFullSuccess ? (
              <p className="text-sm font-medium text-foreground">
                {t('employer.campaigns.inviteFlow.resultSuccessCount').replace(
                  '{count}',
                  String(invited.length),
                )}
              </p>
            ) : null}
            {state.submittedAt ? (
              <p className="text-xs text-muted-foreground">
                {t('employer.campaigns.inviteFlow.resultSentAt').replace(
                  '{time}',
                  formatDateTime(state.submittedAt, language),
                )}
              </p>
            ) : null}
          </div>
        </header>

        {invited.length > 0 ? (
          <section className="space-y-3 rounded-md border border-success/30 bg-surface-raised p-4">
            <h2 className="text-sm font-semibold text-success">
              {t('employer.campaigns.inviteFlow.resultOk')}
            </h2>
            <ul className="space-y-2">
              {invited.map((item) => (
                <li
                  key={`${item.invitationId ?? item.email}`}
                  className="flex items-start gap-3 rounded-md border border-satin bg-surface-overlay px-3 py-2.5"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm text-foreground">{item.email}</p>
                    {item.expiresAt ? (
                      <p className="text-xs text-muted-foreground">
                        {t('employer.campaigns.inviteFlow.resultExpiresAt').replace(
                          '{time}',
                          formatDateTime(item.expiresAt, language),
                        )}
                      </p>
                    ) : null}
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 border-success/30 bg-success-bg text-success"
                  >
                    {t('employer.campaigns.inviteFlow.resultSentBadge')}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {hasFailures ? (
          <section className="space-y-3 rounded-md border border-error/30 bg-surface-raised p-4">
            <h2 className="text-sm font-semibold text-error">
              {t('employer.campaigns.inviteFlow.resultFail')}
            </h2>
            <ul className="space-y-2">
              {failed.map((item) => (
                <li
                  key={`${item.email}-${item.reason}`}
                  className="flex items-start gap-3 rounded-md border border-satin bg-surface-overlay px-3 py-2.5"
                >
                  <XCircle className="mt-0.5 size-4 shrink-0 text-error" aria-hidden />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm text-foreground">{item.email}</p>
                    <p className="text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {isFullSuccess ? (
          <p className="rounded-md border border-satin bg-surface-overlay px-4 py-3 text-center text-sm text-muted-foreground">
            {t('employer.campaigns.inviteFlow.resultInboxHint')}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-center gap-2">
          {isFullSuccess ? (
            <>
              <Button render={<Link to={detailPath} />}>
                {t('employer.campaigns.inviteFlow.backToDetail')}
              </Button>
              <Button
                variant="outline"
                render={
                  <Link to={state.method === 'cv' ? inviteHomePath : emailRetryPath} />
                }
              >
                {t('employer.campaigns.inviteFlow.inviteMore')}
              </Button>
            </>
          ) : (
            <>
              <Button
                render={
                  <Link
                    to={state.method === 'cv' ? inviteHomePath : emailRetryPath}
                    state={
                      state.method === 'email' && state.emailsDraft
                        ? { draftEmails: state.emailsDraft }
                        : undefined
                    }
                  />
                }
              >
                {t('employer.campaigns.inviteFlow.retry')}
              </Button>
              <Button variant="outline" render={<Link to={detailPath} />}>
                {t('employer.campaigns.inviteFlow.backToDetail')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
