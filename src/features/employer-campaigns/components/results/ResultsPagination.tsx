import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';

interface ResultsPaginationProps {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function ResultsPagination({
  page,
  pageCount,
  total,
  onPageChange,
}: ResultsPaginationProps) {
  const { t } = useLanguage();

  if (pageCount <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>
        {t('employer.campaigns.results.pagination.summary')
          .replace('{page}', String(page))
          .replace('{pages}', String(pageCount))
          .replace('{total}', String(total))}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page <= 1}
          aria-label={t('employer.campaigns.results.pagination.previous')}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page >= pageCount}
          aria-label={t('employer.campaigns.results.pagination.next')}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}
