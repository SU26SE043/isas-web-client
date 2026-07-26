import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  type AppPaginationProps,
} from './pagination.types';
import { getPaginationRange, getPaginationTokens } from './pagination.utils';

export function AppPagination(props: AppPaginationProps) {
  const { t } = useLanguage();
  const inactive = Boolean(props.disabled || props.isLoading);
  const options = props.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;
  const isPageMode = props.mode !== 'cursor';
  const totalPages = isPageMode
    ? Math.max(1, Math.ceil(props.totalItems / props.pageSize))
    : null;
  const safePage = isPageMode
    ? Math.min(Math.max(1, props.currentPage), totalPages!)
    : Math.max(1, props.currentPage);
  const range = isPageMode
    ? getPaginationRange(safePage, props.pageSize, props.totalItems)
    : null;
  const tokens = isPageMode ? getPaginationTokens(safePage, totalPages!) : [];
  const previousDisabled = isPageMode ? safePage <= 1 : !props.hasPreviousPage;
  const nextDisabled = isPageMode ? safePage >= totalPages! : !props.hasNextPage;

  const changePageSize = (pageSize: number) => {
    if (inactive || pageSize === props.pageSize) return;
    if (isPageMode) props.onPageChange(1);
    props.onPageSizeChange(pageSize);
  };

  return (
    <nav
      className={cn(
        'frame-satin grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-xl bg-surface-raised px-3 py-2.5',
        'md:grid-cols-[minmax(180px,1fr)_auto_minmax(180px,1fr)] md:items-center',
        inactive && 'opacity-60',
        props.className,
      )}
      aria-label={t('ds.pagination.label')}
      aria-busy={props.isLoading || undefined}
    >
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{t('ds.pagination.show')}</span>
        <select
          value={props.pageSize}
          disabled={inactive}
          onChange={(event) => changePageSize(Number(event.target.value))}
          className="h-8 rounded-lg border border-satin bg-surface-overlay px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label={t('ds.pagination.pageSize')}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span>{t('ds.pagination.perPage')}</span>
      </label>

      <p className="text-right text-xs text-muted-foreground md:text-center" aria-live="polite">
        {isPageMode
          ? t('ds.pagination.range')
              .replace('{start}', String(range!.start))
              .replace('{end}', String(range!.end))
              .replace('{total}', String(props.totalItems))
              .replace('{itemLabel}', props.itemLabel)
          : t('ds.pagination.cursorSummary')
              .replace('{page}', String(safePage))
              .replace('{count}', String(props.itemCount))
              .replace('{itemLabel}', props.itemLabel)}
      </p>

      <div className="col-span-2 flex min-w-0 items-center justify-center gap-1 md:col-span-1 md:justify-end">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={inactive || previousDisabled}
          onClick={() =>
            isPageMode ? props.onPageChange(safePage - 1) : props.onPreviousPage()
          }
          aria-label={t('ds.pagination.previous')}
        >
          <ChevronLeft aria-hidden />
        </Button>
        {isPageMode ? (
          tokens.map((token) =>
            typeof token === 'number' ? (
              <Button
                key={token}
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={inactive}
                onClick={() => props.onPageChange(token)}
                aria-label={t('ds.pagination.goTo').replace('{page}', String(token))}
                aria-current={token === safePage ? 'page' : undefined}
                className={cn(
                  'size-7 sm:size-8',
                  token === safePage && 'bg-foreground text-background hover:bg-foreground/90',
                )}
              >
                {token}
              </Button>
            ) : (
              <span
                key={token}
                className="grid size-7 place-items-center text-muted-foreground sm:size-8"
              >
                …
              </span>
            ),
          )
        ) : (
          <span className="min-w-16 px-2 text-center text-xs font-medium text-foreground">
            {t('ds.pagination.page').replace('{page}', String(safePage))}
          </span>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={inactive || nextDisabled}
          onClick={() =>
            isPageMode ? props.onPageChange(safePage + 1) : props.onNextPage()
          }
          aria-label={t('ds.pagination.next')}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </nav>
  );
}

export { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from './pagination.types';
export type { AppPaginationProps } from './pagination.types';
