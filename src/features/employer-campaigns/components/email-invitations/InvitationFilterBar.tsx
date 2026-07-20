import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="flex flex-col gap-3 rounded-lg border border-satin bg-surface-overlay p-4 lg:flex-row lg:flex-wrap lg:items-end">
      <div className="min-w-[12rem] flex-1 space-y-1">
        <Label htmlFor="invite-history-search">
          {t('employer.campaigns.campaignInvitations.filter.searchPlaceholder')}
        </Label>
        <Input
          id="invite-history-search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t('employer.campaigns.campaignInvitations.filter.searchPlaceholder')}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="invite-history-status">
          {t('employer.campaigns.campaignInvitations.table.status')}
        </Label>
        <select
          id="invite-history-status"
          className="h-9 rounded-lg border border-satin bg-surface-raised px-3 text-sm text-foreground"
          value={status}
          onChange={(e) => onStatus(e.target.value as CampaignInvitationStatus | 'all')}
        >
          <option value="all">{t('employer.campaigns.campaignInvitations.filter.allStatuses')}</option>
          <option value="Queued">{t('employer.campaigns.campaignInvitations.status.queued')}</option>
          <option value="Sent">{t('employer.campaigns.campaignInvitations.status.sent')}</option>
          <option value="Joined">{t('employer.campaigns.campaignInvitations.status.joined')}</option>
          <option value="Expired">{t('employer.campaigns.campaignInvitations.status.expired')}</option>
          <option value="Revoked">{t('employer.campaigns.campaignInvitations.status.revoked')}</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="invite-history-sort">
          {t('employer.campaigns.campaignInvitations.filter.sortLabel')}
        </Label>
        <select
          id="invite-history-sort"
          className="h-9 rounded-lg border border-satin bg-surface-raised px-3 text-sm text-foreground"
          value={sort}
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
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onClear}>
          {t('employer.campaigns.campaignInvitations.filter.clear')}
        </Button>
        <Button type="button" variant="outline" loading={isRefreshing} onClick={onRefresh}>
          {t('employer.campaigns.campaignInvitations.actions.refresh')}
        </Button>
      </div>
    </div>
  );
}
