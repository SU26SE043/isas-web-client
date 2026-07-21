import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { CampaignInvitation } from '../../types/campaign.api.types';
import { InvitationStatusBadge } from './InvitationStatusBadge';

function formatDateTime(value: string | null | undefined, locale: string, empty: string) {
  if (!value) return empty;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

interface InvitationListProps {
  items: CampaignInvitation[];
  isActiveCampaign: boolean;
  reissuingInvitationId: string | null;
  onViewDetail: (invitation: CampaignInvitation) => void;
  onReissue: (invitation: CampaignInvitation) => void;
}

export function InvitationList({
  items,
  isActiveCampaign,
  reissuingInvitationId,
  onViewDetail,
  onReissue,
}: InvitationListProps) {
  const { t, language } = useLanguage();
  const empty = t('employer.campaigns.campaignInvitations.table.noValue');

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-satin lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-satin bg-surface-overlay text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2">{t('employer.campaigns.campaignInvitations.table.email')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.campaignInvitations.table.status')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.campaignInvitations.table.createdAt')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.campaignInvitations.table.emailSentAt')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.campaignInvitations.table.expiresAt')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.campaignInvitations.table.joinedAt')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.campaignInvitations.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((invitation) => {
              const canReissue = isActiveCampaign && invitation.status !== 'Joined';
              const isRowReissuing = reissuingInvitationId === invitation.id;
              return (
                <tr key={invitation.id} className="border-b border-satin/60 align-top">
                  <td
                    className="max-w-[16rem] px-3 py-3 break-words text-foreground"
                    style={{ overflowWrap: 'anywhere' }}
                  >
                    {invitation.email}
                  </td>
                  <td className="px-3 py-3">
                    <InvitationStatusBadge status={invitation.status} />
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {formatDateTime(invitation.createdAt, language, empty)}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {invitation.emailSentAt
                      ? formatDateTime(invitation.emailSentAt, language, empty)
                      : t('employer.campaigns.campaignInvitations.table.notSent')}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {formatDateTime(invitation.expiresAt, language, empty)}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {formatDateTime(invitation.joinedAt, language, empty)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetail(invitation)}
                      >
                        {t('employer.campaigns.campaignInvitations.actions.viewDetail')}
                      </Button>
                      {canReissue ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={isRowReissuing}
                          loading={isRowReissuing}
                          title={
                            !isActiveCampaign
                              ? t(
                                  'employer.campaigns.campaignInvitations.errors.campaignNotActive',
                                )
                              : undefined
                          }
                          aria-label={t(
                            'employer.campaigns.campaignInvitations.actions.reissueFor',
                          ).replace('{{email}}', invitation.email)}
                          onClick={() => onReissue(invitation)}
                        >
                          <RefreshCw className="size-3.5" aria-hidden />
                          {isRowReissuing
                            ? t('employer.campaigns.campaignInvitations.actions.reissuing')
                            : t('employer.campaigns.campaignInvitations.actions.reissue')}
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {items.map((invitation) => {
          const canReissue = isActiveCampaign && invitation.status !== 'Joined';
          const isRowReissuing = reissuingInvitationId === invitation.id;
          return (
            <li
              key={invitation.id}
              className="space-y-3 rounded-lg border border-satin bg-surface-overlay p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p
                  className="min-w-0 flex-1 break-words text-sm font-medium text-foreground"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {invitation.email}
                </p>
                <InvitationStatusBadge status={invitation.status} />
              </div>
              <dl className="grid gap-1 text-xs text-muted-foreground">
                <div>
                  {t('employer.campaigns.campaignInvitations.table.createdAt')}:{' '}
                  {formatDateTime(invitation.createdAt, language, empty)}
                </div>
                <div>
                  {t('employer.campaigns.campaignInvitations.table.emailSentAt')}:{' '}
                  {invitation.emailSentAt
                    ? formatDateTime(invitation.emailSentAt, language, empty)
                    : t('employer.campaigns.campaignInvitations.table.notSent')}
                </div>
                <div>
                  {t('employer.campaigns.campaignInvitations.table.expiresAt')}:{' '}
                  {formatDateTime(invitation.expiresAt, language, empty)}
                </div>
                <div>
                  {t('employer.campaigns.campaignInvitations.table.joinedAt')}:{' '}
                  {formatDateTime(invitation.joinedAt, language, empty)}
                </div>
              </dl>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetail(invitation)}
                >
                  {t('employer.campaigns.campaignInvitations.actions.viewDetail')}
                </Button>
                {canReissue ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={isRowReissuing}
                    loading={isRowReissuing}
                    aria-label={t(
                      'employer.campaigns.campaignInvitations.actions.reissueFor',
                    ).replace('{{email}}', invitation.email)}
                    onClick={() => onReissue(invitation)}
                  >
                    {isRowReissuing
                      ? t('employer.campaigns.campaignInvitations.actions.reissuing')
                      : t('employer.campaigns.campaignInvitations.actions.reissue')}
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
