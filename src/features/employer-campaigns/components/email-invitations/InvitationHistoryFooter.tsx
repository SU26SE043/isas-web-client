import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

interface InvitationHistoryFooterProps {
  total: number;
  page: number;
  pageSize: number;
  hasMoreFromServer: boolean;
  isLoadingMore: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onLoadMore: () => void;
}

export function InvitationHistoryFooter({
  total,
  page,
  pageSize,
  hasMoreFromServer,
  isLoadingMore,
  onPageChange,
  onPageSizeChange,
  onLoadMore,
}: InvitationHistoryFooterProps) {
  const { t } = useLanguage();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 border-t border-satin/60 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {t('employer.campaigns.campaignInvitations.pagination.showing')
            .replace('{{from}}', String(from))
            .replace('{{to}}', String(to))
            .replace('{{total}}', String(total))}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t('employer.campaigns.campaignInvitations.pagination.rowsPerPage')}</span>
            <select
              className="h-9 rounded-lg border border-satin bg-surface-raised px-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
              value={pageSize}
              aria-label={t('employer.campaigns.campaignInvitations.pagination.rowsPerPage')}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={safePage <= 1}
              aria-label={t('employer.campaigns.campaignInvitations.pagination.previous')}
              onClick={() => onPageChange(safePage - 1)}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            <span className="min-w-8 px-2 text-center text-sm font-medium text-foreground">
              {safePage}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={safePage >= pageCount}
              aria-label={t('employer.campaigns.campaignInvitations.pagination.next')}
              onClick={() => onPageChange(safePage + 1)}
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>

      {hasMoreFromServer ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoadingMore}
          loading={isLoadingMore}
          onClick={onLoadMore}
        >
          {isLoadingMore
            ? t('employer.campaigns.campaignInvitations.actions.loadingMore')
            : t('employer.campaigns.campaignInvitations.actions.loadMore')}
        </Button>
      ) : null}

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>{t('employer.campaigns.campaignInvitations.history.realtimeNote')}</span>
      </p>
    </div>
  );
}
