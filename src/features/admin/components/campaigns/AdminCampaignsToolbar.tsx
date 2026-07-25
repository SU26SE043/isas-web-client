import { RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import type { AdminCampaignStatusFilter } from '../../types/adminCampaigns.types';
import {
  ADMIN_CAMPAIGN_PAGE_SIZES,
  ADMIN_CAMPAIGN_STATUS_OPTIONS,
} from '../../utils/adminCampaignsActions';

const selectClass =
  'h-9 rounded-lg border border-satin bg-surface-overlay px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface AdminCampaignsToolbarProps {
  search: string;
  status: AdminCampaignStatusFilter;
  orgId: string;
  pageSize: number;
  isFetching: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AdminCampaignStatusFilter) => void;
  onOrgIdChange: (value: string) => void;
  onOrgIdCommit: (value: string) => void;
  onPageSizeChange: (value: number) => void;
  onRefresh: () => void;
}

export function AdminCampaignsToolbar({
  search,
  status,
  orgId,
  pageSize,
  isFetching,
  onSearchChange,
  onStatusChange,
  onOrgIdChange,
  onOrgIdCommit,
  onPageSizeChange,
  onRefresh,
}: AdminCampaignsToolbarProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-2 rounded-xl border border-satin bg-surface-raised p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto]">
        <div className="space-y-1">
          <label className="flex items-center gap-2">
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <span className="sr-only">{t('admin.campaignsManage.filters.search')}</span>
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t('admin.campaignsManage.filters.searchPlaceholder')}
              aria-label={t('admin.campaignsManage.filters.searchPlaceholder')}
            />
          </label>
          <p className="text-xs text-muted-foreground">
            {t('admin.campaignsManage.filters.searchHint')}
          </p>
        </div>

        <select
          className={selectClass}
          value={status}
          onChange={(event) => onStatusChange(event.target.value as AdminCampaignStatusFilter)}
          aria-label={t('admin.campaignsManage.filters.status')}
        >
          <option value="all">{t('admin.campaignsManage.filters.allStatuses')}</option>
          {ADMIN_CAMPAIGN_STATUS_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {t(`admin.campaignsManage.status.${item}`)}
            </option>
          ))}
        </select>

        <Input
          value={orgId}
          onChange={(event) => onOrgIdChange(event.target.value)}
          onBlur={() => onOrgIdCommit(orgId)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onOrgIdCommit(orgId);
            }
          }}
          placeholder={t('admin.campaignsManage.filters.orgIdPlaceholder')}
          aria-label={t('admin.campaignsManage.filters.orgId')}
        />

        <select
          className={selectClass}
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          aria-label={t('admin.campaignsManage.filters.pageSize')}
        >
          {ADMIN_CAMPAIGN_PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant="outline"
          disabled={isFetching}
          onClick={onRefresh}
          aria-label={t('admin.campaignsManage.filters.refresh')}
        >
          <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden />
          {t('admin.campaignsManage.filters.refresh')}
        </Button>
      </div>
    </div>
  );
}
