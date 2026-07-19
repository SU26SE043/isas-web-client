import { CheckCircle2, Mail, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type {
  CreatedCampaignInvitation,
  FailedCampaignInvitation,
} from '../../types/campaign.api.types';

function formatDateTime(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

interface EmailInviteResultPanelProps {
  created: CreatedCampaignInvitation[];
  failed: FailedCampaignInvitation[];
  isRetrying: boolean;
  onRetryFailed: () => void;
  onInviteMore: () => void;
  onClose: () => void;
  onBackToCampaign: () => void;
}

export function EmailInviteResultPanel({
  created,
  failed,
  isRetrying,
  onRetryFailed,
  onInviteMore,
  onClose,
  onBackToCampaign,
}: EmailInviteResultPanelProps) {
  const { t, language } = useLanguage();
  const total = created.length + failed.length;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="heading-primary text-2xl text-foreground">
          {t('employer.campaigns.emailInvitations.result.title')}
        </h2>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label={t('employer.campaigns.emailInvitations.result.total')} value={total} />
        <StatCard
          label={t('employer.campaigns.emailInvitations.result.created')}
          value={created.length}
        />
        <StatCard
          label={t('employer.campaigns.emailInvitations.result.failed')}
          value={failed.length}
        />
      </div>

      {failed.length === 0 && created.length > 0 ? (
        <p className="rounded-md border border-satin bg-surface-overlay px-4 py-3 text-sm text-muted-foreground">
          {t('employer.campaigns.emailInvitations.result.noFailures')}
        </p>
      ) : null}

      {created.length > 0 ? (
        <section className="space-y-3 rounded-md border border-success/30 bg-surface-raised p-4">
          <h3 className="text-sm font-semibold text-success">
            {t('employer.campaigns.emailInvitations.result.createdSection')}
          </h3>
          <ul className="space-y-2">
            {created.map((item) => (
              <li
                key={item.id || item.email}
                className="flex items-start gap-3 rounded-md border border-satin bg-surface-overlay px-3 py-2.5"
              >
                <Mail className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="break-words text-sm text-foreground">{item.email}</p>
                  {item.expiresAt ? (
                    <p className="text-xs text-muted-foreground">
                      {t('employer.campaigns.emailInvitations.result.expiresAt')}:{' '}
                      {formatDateTime(item.expiresAt, language)}
                    </p>
                  ) : null}
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 border-success/30 bg-success-bg text-success"
                >
                  <CheckCircle2 className="mr-1 size-3" aria-hidden />
                  {t('employer.campaigns.emailInvitations.result.created')}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {failed.length > 0 ? (
        <section className="space-y-3 rounded-md border border-error/30 bg-surface-raised p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-error">
              {t('employer.campaigns.emailInvitations.result.failedSection')}
            </h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isRetrying}
              loading={isRetrying}
              onClick={onRetryFailed}
            >
              {t('employer.campaigns.emailInvitations.actions.retryFailed')}
            </Button>
          </div>
          <ul className="space-y-2">
            {failed.map((item) => (
              <li
                key={`${item.email}-${item.reason}`}
                className="flex items-start gap-3 rounded-md border border-satin bg-surface-overlay px-3 py-2.5"
              >
                <XCircle className="mt-0.5 size-4 shrink-0 text-error" aria-hidden />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="break-words text-sm text-foreground">{item.email}</p>
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 border-error/30 bg-error-bg text-error"
                >
                  {t('employer.campaigns.emailInvitations.result.failed')}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onInviteMore}>
          {t('employer.campaigns.emailInvitations.actions.inviteMore')}
        </Button>
        <Button type="button" variant="outline" onClick={onBackToCampaign}>
          {t('employer.campaigns.emailInvitations.actions.backToCampaign')}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          {t('employer.campaigns.emailInvitations.actions.close')}
        </Button>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-satin bg-surface-overlay px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
