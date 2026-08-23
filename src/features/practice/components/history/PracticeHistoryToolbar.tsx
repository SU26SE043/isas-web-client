import { RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import type {
  PracticeHistorySort,
  PracticeHistorySourceFilter,
  PracticeHistoryStatusFilter,
} from '../../types/history.types';
import {
  PRACTICE_SESSION_SOURCE_LABEL_KEYS,
  type PracticeSessionSource,
} from '../../utils/practiceReportLabel';

/**
 * Danh sách lựa chọn nguồn dựng TỪ chính `PRACTICE_SESSION_SOURCE_LABEL_KEYS` chứ không gõ tay hai
 * dòng `<option>`: thêm một nguồn mới ở đó là ô lọc tự có, không thể quên. Nhãn cũng vì thế trùng
 * KHÍT chữ đang hiện trên từng hàng của bảng — người dùng không phải học hai bộ từ vựng cho cùng
 * một khái niệm.
 */
const SOURCE_OPTIONS = Object.keys(
  PRACTICE_SESSION_SOURCE_LABEL_KEYS,
) as PracticeSessionSource[];

const selectClass =
  'h-9 rounded-lg border border-satin bg-surface-overlay px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface PracticeHistoryToolbarProps {
  search: string;
  status: PracticeHistoryStatusFilter;
  source: PracticeHistorySourceFilter;
  sort: PracticeHistorySort;
  isFetching: boolean;
  compareMode: boolean;
  dateFilter?: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: PracticeHistoryStatusFilter) => void;
  onSourceChange: (value: PracticeHistorySourceFilter) => void;
  onSortChange: (value: PracticeHistorySort) => void;
  onRefresh: () => void;
  onToggleCompareMode: () => void;
  onClearDateFilter?: () => void;
}

export function PracticeHistoryToolbar({
  search,
  status,
  source,
  sort,
  isFetching,
  compareMode,
  dateFilter,
  onSearchChange,
  onStatusChange,
  onSourceChange,
  onSortChange,
  onRefresh,
  onToggleCompareMode,
  onClearDateFilter,
}: PracticeHistoryToolbarProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-2 rounded-xl border border-satin bg-surface-raised p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))_auto_auto]">
        <div className="space-y-1">
          <label className="flex items-center gap-2">
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t('practice.history.searchPlaceholder')}
              aria-label={t('practice.history.searchPlaceholder')}
            />
          </label>
          <p className="text-xs text-muted-foreground">{t('practice.history.filterHint')}</p>
        </div>

        <select
          className={selectClass}
          value={status}
          onChange={(event) => onStatusChange(event.target.value as PracticeHistoryStatusFilter)}
          aria-label={t('practice.history.filterStatus')}
        >
          <option value="all">{t('practice.history.filters.allStatuses')}</option>
          <option value="completed">{t('practice.history.statusGroup.completed')}</option>
          <option value="inProgress">{t('practice.history.statusGroup.inProgress')}</option>
          <option value="pendingScore">{t('practice.history.statusGroup.pendingScore')}</option>
          <option value="failed">{t('practice.history.statusGroup.failed')}</option>
        </select>

        <select
          className={selectClass}
          value={source}
          onChange={(event) => onSourceChange(event.target.value as PracticeHistorySourceFilter)}
          aria-label={t('practice.history.filterSource')}
        >
          <option value="all">{t('practice.history.filters.allSources')}</option>
          {SOURCE_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {t(PRACTICE_SESSION_SOURCE_LABEL_KEYS[value])}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={sort}
          onChange={(event) => onSortChange(event.target.value as PracticeHistorySort)}
          aria-label={t('practice.history.sort.label')}
        >
          <option value="newest">{t('practice.history.sort.newest')}</option>
          <option value="oldest">{t('practice.history.sort.oldest')}</option>
          <option value="scoreDesc">{t('practice.history.sort.scoreDesc')}</option>
          <option value="scoreAsc">{t('practice.history.sort.scoreAsc')}</option>
        </select>

        <Button
          type="button"
          variant={compareMode ? 'default' : 'outline'}
          onClick={onToggleCompareMode}
        >
          {t('practice.compare.toggle')}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isFetching}
          aria-label={t('practice.history.refresh')}
          onClick={onRefresh}
        >
          <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden />
        </Button>
      </div>

      {dateFilter && onClearDateFilter ? (
        <Button type="button" size="sm" variant="outline" onClick={onClearDateFilter}>
          {t('practice.history.filterDate')}: {dateFilter} ×
        </Button>
      ) : null}
    </div>
  );
}
