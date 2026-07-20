import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/shared/languages';
import {
  useCampaignInvitations,
  useReissueCampaignInvitation,
} from '../../hooks/useCampaignInvitations';
import type { CampaignInvitation, CampaignInvitationStatus } from '../../types/campaign.api.types';
import type { EmployerCampaign } from '../../types/campaignManagement.types';
import {
  filterAndSortInvitations,
  mergeInvitationsById,
  type InvitationSortMode,
} from '../../utils/campaignInvitationsApi';
import {
  getInvitationApiErrorMessage,
  getInvitationListErrorKey,
  getInvitationReissueErrorKey,
} from '../../utils/invitationApiError';
import { EmailInviteCampaignSummary } from './EmailInviteCampaignSummary';
import { InvitationDetailDrawer } from './InvitationDetailDrawer';
import { InvitationFilterBar } from './InvitationFilterBar';
import { InvitationList } from './InvitationList';
import { InvitationStatusSummary } from './InvitationStatusSummary';
import { ReissueConfirmModal } from './ReissueConfirmModal';

interface InvitationHistoryPanelProps {
  campaign: EmployerCampaign;
  enabled: boolean;
  onGoToSend: () => void;
}

export function InvitationHistoryPanel({
  campaign,
  enabled,
  onGoToSend,
}: InvitationHistoryPanelProps) {
  const { t, language } = useLanguage();
  const isActive = campaign.status === 'active';
  const query = useCampaignInvitations(campaign.id, { enabled });
  const reissueMutation = useReissueCampaignInvitation(campaign.id);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CampaignInvitationStatus | 'all'>('all');
  const [sort, setSort] = useState<InvitationSortMode>('newest');
  const [detail, setDetail] = useState<CampaignInvitation | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<CampaignInvitation | null>(null);
  const [reissuingInvitationId, setReissuingInvitationId] = useState<string | null>(null);

  const loadedItems = useMemo(
    () => mergeInvitationsById([], query.data?.pages.flatMap((page) => page.items) ?? []),
    [query.data?.pages],
  );
  const filtered = useMemo(
    () => filterAndSortInvitations(loadedItems, { search, status, sort }),
    [loadedItems, search, sort, status],
  );
  const hasMore = Boolean(query.hasNextPage);
  const listError =
    query.isError
      ? getInvitationApiErrorMessage(query.error, t(getInvitationListErrorKey(query.error)))
      : null;

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setSort('newest');
  };

  const openReissue = (invitation: CampaignInvitation) => {
    if (!isActive || invitation.status === 'Joined') return;
    setDetail(null);
    setConfirmTarget(invitation);
  };

  const confirmReissue = async () => {
    if (!confirmTarget || reissuingInvitationId) return;
    setReissuingInvitationId(confirmTarget.id);
    try {
      const result = await reissueMutation.mutateAsync(confirmTarget.id);
      setConfirmTarget(null);
      toast.success(
        t('employer.campaigns.campaignInvitations.reissue.success').replace(
          '{{email}}',
          result.email,
        ),
      );
      toast(
        t('employer.campaigns.campaignInvitations.reissue.newExpiration').replace(
          '{{expiresAt}}',
          new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'vi-VN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date(result.expiresAt)),
        ),
      );
      await query.refetch();
    } catch (error) {
      toast.error(
        getInvitationApiErrorMessage(error, t(getInvitationReissueErrorKey(error))),
      );
    } finally {
      setReissuingInvitationId(null);
    }
  };

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner
          className="size-8"
          label={t('employer.campaigns.campaignInvitations.history.title')}
        />
      </div>
    );
  }

  if (listError) {
    return (
      <div className="space-y-4">
        <Alert variant="error">
          <AlertDescription>{listError}</AlertDescription>
        </Alert>
        <Button type="button" onClick={() => void query.refetch()}>
          {t('employer.campaigns.campaignInvitations.actions.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">
          {t('employer.campaigns.campaignInvitations.history.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('employer.campaigns.campaignInvitations.history.description')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('employer.campaigns.campaignInvitations.history.loadedCount').replace(
            '{{count}}',
            String(loadedItems.length),
          )}
        </p>
      </header>

      <EmailInviteCampaignSummary campaign={campaign} />
      <InvitationStatusSummary items={loadedItems} hasMore={hasMore} />
      <InvitationFilterBar
        search={search}
        status={status}
        sort={sort}
        onSearch={setSearch}
        onStatus={setStatus}
        onSort={setSort}
        onClear={clearFilters}
        onRefresh={() => void query.refetch()}
        isRefreshing={query.isFetching && !query.isFetchingNextPage}
      />

      {loadedItems.length === 0 ? (
        <EmptyState
          variant="no-results"
          title={t('employer.campaigns.campaignInvitations.empty.invitations')}
          description={t('employer.campaigns.campaignInvitations.history.description')}
          action={
            <Button type="button" onClick={onGoToSend}>
              {t('employer.campaigns.campaignInvitations.actions.inviteCandidates')}
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          variant="no-results"
          title={t('employer.campaigns.campaignInvitations.empty.filtered')}
          description={t('employer.campaigns.campaignInvitations.history.partialStatistics')}
          action={
            <Button type="button" variant="outline" onClick={clearFilters}>
              {t('employer.campaigns.campaignInvitations.filter.clear')}
            </Button>
          }
        />
      ) : (
        <InvitationList
          items={filtered}
          isActiveCampaign={isActive}
          reissuingInvitationId={reissuingInvitationId}
          onViewDetail={setDetail}
          onReissue={openReissue}
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        {hasMore ? (
          <Button
            type="button"
            variant="outline"
            disabled={query.isFetchingNextPage}
            loading={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {query.isFetchingNextPage
              ? t('employer.campaigns.campaignInvitations.actions.loadingMore')
              : t('employer.campaigns.campaignInvitations.actions.loadMore')}
          </Button>
        ) : loadedItems.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            {t('employer.campaigns.campaignInvitations.empty.allLoaded')}
          </p>
        ) : null}
      </div>

      <InvitationDetailDrawer
        invitation={detail}
        open={Boolean(detail)}
        isActiveCampaign={isActive}
        isReissuing={Boolean(detail && reissuingInvitationId === detail.id)}
        onClose={() => setDetail(null)}
        onReissue={openReissue}
      />
      <ReissueConfirmModal
        open={Boolean(confirmTarget)}
        campaignTitle={campaign.title}
        invitation={confirmTarget}
        isConfirming={Boolean(confirmTarget && reissuingInvitationId === confirmTarget.id)}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() => void confirmReissue()}
      />
    </div>
  );
}
