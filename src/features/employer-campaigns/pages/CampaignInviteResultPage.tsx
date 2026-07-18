import { Link, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';

type ResultState = {
  method?: 'cv' | 'email';
  invited?: Array<{ email: string; invitationId?: string }>;
  failed?: Array<{ email: string; reason: string }>;
};

export function CampaignInviteResultPage() {
  const { id = '' } = useParams();
  const { t } = useLanguage();
  const location = useLocation();
  const state = (location.state as ResultState | null) ?? {};
  const invited = state.invited ?? [];
  const failed = state.failed ?? [];

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="heading-primary text-3xl text-foreground">
            {t('employer.campaigns.inviteFlow.resultTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('employer.campaigns.inviteFlow.resultSummary')
              .replace('{ok}', String(invited.length))
              .replace('{fail}', String(failed.length))}
          </p>
        </header>

        <section className="space-y-2 rounded-lg border border-satin bg-surface-overlay p-4">
          <h2 className="text-sm font-semibold text-success">
            {t('employer.campaigns.inviteFlow.resultOk')}
          </h2>
          {invited.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <ul className="space-y-1 text-sm text-foreground">
              {invited.map((item) => (
                <li key={item.email}>{item.email}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-2 rounded-lg border border-satin bg-surface-overlay p-4">
          <h2 className="text-sm font-semibold text-error">
            {t('employer.campaigns.inviteFlow.resultFail')}
          </h2>
          {failed.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {failed.map((item) => (
                <li key={`${item.email}-${item.reason}`}>
                  {item.email} — {item.reason}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-wrap gap-2">
          <Button render={<Link to={`/employer/campaigns/${id}`} />}>
            {t('employer.campaigns.inviteFlow.backToDetail')}
          </Button>
          <Button variant="outline" render={<Link to={`/employer/campaigns/${id}/invite`} />}>
            {t('employer.campaigns.inviteFlow.inviteMore')}
          </Button>
        </div>
      </div>
    </div>
  );
}
