import { FilterX, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import type { CampaignInvitationStatus } from '../../types/campaign.api.types';
import type { InvitationSortMode } from '../../utils/campaignInvitationsApi';

interface InvitationFilterBarProps {
  search: string;
  status: CampaignInvitationStatus | 'all';
  sort: InvitationSortMode;
  onSearch: (value: string) => void;
  onStatus: (value: CampaignInvitationStatus | 'all') => void;
  onSort: (value: InvitationSortMode) => void;
  onClear: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const selectClass =
  'h-10 min-w-[10rem] rounded-xl border border-satin bg-surface-raised px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]';

export function InvitationFilterBar({
  search,
  status,
  sort,
  onSearch,
  onStatus,
  onSort,
  onClear,
  onRefresh,
  isRefreshing,
}: InvitationFilterBarProps) {
  const { t } = useLanguage();

  return (
    <div className="frame-satin flex flex-col gap-3 rounded-xl bg-surface-raised/80 p-3 lg:flex-row lg:flex-wrap lg:items-center">
      <div className="relative min-w-[14rem] flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id="invite-history-search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t('employer.campaigns.campaignInvitations.filter.searchPlaceholder')}
          aria-label={t('employer.campaigns.campaignInvitations.filter.searchPlaceholder')}
          className="h-10 border-satin bg-surface-overlay pl-9"
        />
      </div>

      <select
        id="invite-history-status"
        className={selectClass}
        value={status}
        aria-label={t('employer.campaigns.campaignInvitations.table.status')}
        onChange={(e) => onStatus(e.target.value as CampaignInvitationStatus | 'all')}
      >
        <option value="all">{t('employer.campaigns.campaignInvitations.filter.allStatuses')}</option>
        <option value="Queued">{t('employer.campaigns.campaignInvitations.status.queued')}</option>
        <option value="Sent">{t('employer.campaigns.campaignInvitations.status.sent')}</option>
        <option value="Joined">{t('employer.campaigns.campaignInvitations.status.joined')}</option>
        <option value="Expired">{t('employer.campaigns.campaignInvitations.status.expired')}</option>
        <option value="Revoked">{t('employer.campaigns.campaignInvitations.status.revoked')}</option>
      </select>

      <select
        id="invite-history-sort"
        className={selectClass}
        value={sort}
        aria-label={t('employer.campaigns.campaignInvitations.filter.sortLabel')}
        onChange={(e) => onSort(e.target.value as InvitationSortMode)}
      >
        <option value="newest">{t('employer.campaigns.campaignInvitations.filter.newest')}</option>
        <option value="oldest">{t('employer.campaigns.campaignInvitations.filter.oldest')}</option>
        <option value="expiringSoon">
          {t('employer.campaigns.campaignInvitations.filter.expiringSoon')}
        </option>
        <option value="emailAsc">
          {t('employer.campaigns.campaignInvitations.filter.emailAscending')}
        </option>
      </select>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="h-10" onClick={onClear}>
          <FilterX className="size-4" aria-hidden />
          {t('employer.campaigns.campaignInvitations.filter.clear')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          loading={isRefreshing}
          onClick={onRefresh}
        >
          <RefreshCw className="size-4" aria-hidden />
          {t('employer.campaigns.campaignInvitations.actions.refresh')}
        </Button>
      </div>
    </div>
  );
}
