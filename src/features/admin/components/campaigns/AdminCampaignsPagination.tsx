import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';

interface AdminCampaignsPaginationProps {
  pageNumber: number;
  itemCount: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isFetching: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function AdminCampaignsPagination({
  pageNumber,
  itemCount,
  canGoPrevious,
  canGoNext,
  isFetching,
  onPrevious,
  onNext,
}: AdminCampaignsPaginationProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3 border-t border-satin/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {t('admin.campaignsManage.pagination.pageItems')
          .replace('{{count}}', String(itemCount))
          .replace('{{page}}', String(pageNumber))}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!canGoPrevious || isFetching}
          onClick={onPrevious}
          aria-label={t('admin.campaignsManage.pagination.previous')}
        >
          <ChevronLeft className="size-4" aria-hidden />
          {t('admin.campaignsManage.pagination.previous')}
        </Button>
        <span className="min-w-16 text-center text-sm font-medium text-foreground">
          {t('admin.campaignsManage.pagination.page').replace('{{page}}', String(pageNumber))}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!canGoNext || isFetching}
          onClick={onNext}
          aria-label={t('admin.campaignsManage.pagination.next')}
        >
          {t('admin.campaignsManage.pagination.next')}
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
