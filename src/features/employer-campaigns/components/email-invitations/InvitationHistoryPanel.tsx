import { useEffect, useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Spinner } from '@/components/ui/spinner';
import { AppPagination, DEFAULT_PAGE_SIZE } from '@/components/ui/app-pagination';
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
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CampaignInvitationStatus | 'all'>('all');
  const [sort, setSort] = useState<InvitationSortMode>('newest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [detail, setDetail] = useState<CampaignInvitation | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<CampaignInvitation | null>(null);
  const [reissuingInvitationId, setReissuingInvitationId] = useState<string | null>(null);
  const query = useCampaignInvitations(campaign.id, { enabled, pageSize });
  const reissueMutation = useReissueCampaignInvitation(campaign.id);

  const loadedPages = query.data?.pages ?? [];
  const currentPageItems = loadedPages[page - 1]?.items ?? [];
  const loadedItems = useMemo(
    () => mergeInvitationsById([], currentPageItems),
    [currentPageItems],
  );
  const filtered = useMemo(
    () => filterAndSortInvitations(loadedItems, { search, status, sort }),
    [loadedItems, search, sort, status],
  );
  useEffect(() => {
    setPage(1);
  }, [search, status, sort]);

  const hasMore = page < loadedPages.length || Boolean(query.hasNextPage);
  const listError = query.isError
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
      toast.error(getInvitationApiErrorMessage(error, t(getInvitationReissueErrorKey(error))));
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
        <>
          <InvitationList
            items={filtered}
            isActiveCampaign={isActive}
            reissuingInvitationId={reissuingInvitationId}
            onViewDetail={setDetail}
            onReissue={openReissue}
          />
          <AppPagination
            mode="cursor"
            currentPage={page}
            pageSize={pageSize}
            itemCount={filtered.length}
            itemLabel={t('employer.campaigns.campaignInvitations.pagination.itemLabel')}
            hasPreviousPage={page > 1}
            hasNextPage={hasMore}
            isLoading={query.isFetchingNextPage}
            onPreviousPage={() => setPage((current) => Math.max(1, current - 1))}
            onNextPage={() => {
              if (page < loadedPages.length) {
                setPage((current) => current + 1);
                return;
              }
              void query.fetchNextPage().then((result) => {
                if (result.data && result.data.pages.length > page) {
                  setPage((current) => current + 1);
                }
              });
            }}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              {t('employer.campaigns.campaignInvitations.history.realtimeNote')}
            </span>
          </p>
        </>
      )}

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
