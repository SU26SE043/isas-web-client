import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';

interface CampaignPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20];

export function CampaignPagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: CampaignPaginationProps) {
  const { t } = useLanguage();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);
  const firstVisiblePage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const visiblePageCount = Math.min(5, totalPages);
  const pageNumbers = Array.from(
    { length: visiblePageCount },
    (_, index) => firstVisiblePage + index,
  );
  const rangeLabel = t('employer.campaigns.list.pagination.range')
    .replace('{from}', String(rangeStart))
    .replace('{to}', String(rangeEnd))
    .replace('{total}', String(totalItems));

  return (
    <nav
      className="flex flex-col gap-3 rounded-xl border border-white/8 bg-surface-raised px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
      aria-label={t('employer.campaigns.list.pagination.label')}
    >
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        {t('employer.campaigns.list.pagination.show')}
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-8 rounded-lg border border-input bg-surface-overlay px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label={t('employer.campaigns.list.pagination.pageSize')}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {t('employer.campaigns.list.pagination.perPage')}
      </label>

      <p className="text-center text-xs text-muted-foreground" aria-live="polite">
        {rangeLabel}
      </p>

      <div className="flex items-center justify-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label={t('employer.campaigns.list.pagination.previous')}
        >
          <ChevronLeft aria-hidden />
        </Button>
        {pageNumbers.map((page) => (
          <Button
            key={page}
            type="button"
            variant={page === currentPage ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => onPageChange(page)}
            aria-label={t('employer.campaigns.list.pagination.goTo').replace('{page}', String(page))}
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn(page === currentPage && 'bg-white text-black hover:bg-white/90')}
          >
            {page}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label={t('employer.campaigns.list.pagination.next')}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
