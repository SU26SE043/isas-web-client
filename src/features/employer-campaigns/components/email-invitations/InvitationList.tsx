import { Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
      <div className="hidden lg:block">
        <Table className="min-w-[960px]">
          <TableHeader>
            <TableRow>
              <TableHead>{t('employer.campaigns.campaignInvitations.table.email')}</TableHead>
              <TableHead>{t('employer.campaigns.campaignInvitations.table.status')}</TableHead>
              <TableHead>{t('employer.campaigns.campaignInvitations.table.createdAt')}</TableHead>
              <TableHead>{t('employer.campaigns.campaignInvitations.table.emailSentAt')}</TableHead>
              <TableHead>{t('employer.campaigns.campaignInvitations.table.expiresAt')}</TableHead>
              <TableHead>{t('employer.campaigns.campaignInvitations.table.joinedAt')}</TableHead>
              <TableHead>{t('employer.campaigns.campaignInvitations.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((invitation) => {
              const canReissue = isActiveCampaign && invitation.status !== 'Joined';
              const isRowReissuing = reissuingInvitationId === invitation.id;
              return (
                <TableRow key={invitation.id} className="align-top">
                  <TableCell
                    className="max-w-[16rem] break-words font-medium whitespace-normal text-foreground"
                    style={{ overflowWrap: 'anywhere' }}
                  >
                    {invitation.email}
                  </TableCell>
                  <TableCell>
                    <InvitationStatusBadge status={invitation.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(invitation.createdAt, language, empty)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {invitation.emailSentAt
                      ? formatDateTime(invitation.emailSentAt, language, empty)
                      : t('employer.campaigns.campaignInvitations.table.notSent')}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(invitation.expiresAt, language, empty)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(invitation.joinedAt, language, empty)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetail(invitation)}
                      >
                        <Eye className="size-3.5" aria-hidden />
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
                          <RefreshCw className="size-3.5" aria-hidden />
                          {isRowReissuing
                            ? t('employer.campaigns.campaignInvitations.actions.reissuing')
                            : t('employer.campaigns.campaignInvitations.actions.reissue')}
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {items.map((invitation) => {
          const canReissue = isActiveCampaign && invitation.status !== 'Joined';
          const isRowReissuing = reissuingInvitationId === invitation.id;
          return (
            <li
              key={invitation.id}
              className="frame-satin space-y-3 rounded-xl bg-surface-raised p-4"
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
                  <Eye className="size-3.5" aria-hidden />
                  {t('employer.campaigns.campaignInvitations.actions.viewDetail')}
                </Button>
                {canReissue ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={isRowReissuing}
                    loading={isRowReissuing}
                    onClick={() => onReissue(invitation)}
                  >
                    <RefreshCw className="size-3.5" aria-hidden />
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
