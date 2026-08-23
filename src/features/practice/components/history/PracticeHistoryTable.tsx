import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { PracticeSessionHistoryItem } from '../../types/history.types';
import {
  formatDurationLabel,
  formatOverallScoreLabel,
  formatSessionDateTime,
  formatSessionDuration,
  getPracticeHistoryStatusGroup,
} from '../../utils/practiceSessionHistoryActions';
import {
  PRACTICE_SESSION_SOURCE_LABEL_KEYS,
  practiceReportTitle,
  practiceSessionSource,
} from '../../utils/practiceReportLabel';
import { PracticeHistoryRowActions } from './PracticeHistoryRowActions';

interface PracticeHistoryTableProps {
  items: PracticeSessionHistoryItem[];
  compareMode?: boolean;
  selectedIds?: string[];
  onToggleCompare?: (id: string) => void;
  onViewResult: (id: string) => void;
  onResume: (id: string) => void;
}

const statusClass = {
  completed: 'border-success/30 bg-success/10 text-success',
  inProgress: 'border-info/30 bg-info/10 text-info',
  pendingScore: 'border-warning/30 bg-warning/10 text-warning',
  failed: 'border-destructive/30 bg-destructive/10 text-destructive',
  unknown: 'border-subtle bg-surface-overlay text-muted-foreground',
} as const;

export function PracticeHistoryTable({
  items,
  compareMode = false,
  selectedIds = [],
  onToggleCompare,
  onViewResult,
  onResume,
}: PracticeHistoryTableProps) {
  const { t, language } = useLanguage();

  return (
    <>
      <div className="hidden md:block">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              {compareMode ? <TableHead className="w-10" scope="col" /> : null}
              <TableHead scope="col">{t('practice.history.columns.jobCategory')}</TableHead>
              <TableHead scope="col">{t('practice.history.filterStatus')}</TableHead>
              <TableHead scope="col">{t('practice.history.columns.createdAt')}</TableHead>
              <TableHead className="hidden lg:table-cell" scope="col">
                {t('practice.history.columns.completedAt')}
              </TableHead>
              <TableHead className="hidden lg:table-cell" scope="col">
                {t('practice.history.duration')}
              </TableHead>
              <TableHead scope="col">{t('practice.history.score')}</TableHead>
              <TableHead className="text-right" scope="col">
                {t('practice.history.columns.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const group = getPracticeHistoryStatusGroup(item.status);
              const canCompare = group === 'completed' && item.overallScore != null;
              const selected = selectedIds.includes(item.id);
              const minutes = formatSessionDuration(item.createdAt, item.completedAt);

              return (
                <TableRow key={item.id} data-state={selected ? 'selected' : undefined}>
                  {compareMode ? (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={!canCompare}
                        aria-label={t('practice.compare.selectItem')}
                        onChange={() => onToggleCompare?.(item.id)}
                      />
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <PracticeSessionTitle item={item} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(statusClass[group])}>
                      {group === 'unknown'
                        ? item.status || t('practice.history.status.unknown')
                        : t(`practice.history.statusGroup.${group}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatSessionDateTime(item.createdAt, language) ||
                      t('practice.history.dateUnknown')}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {item.completedAt
                      ? formatSessionDateTime(item.completedAt, language)
                      : t('practice.history.notCompleted')}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {formatDurationLabel(minutes, t)}
                  </TableCell>
                  <TableCell className="font-semibold tabular-nums text-foreground">
                    {group === 'pendingScore' && item.overallScore == null
                      ? t('practice.history.scoring')
                      : formatOverallScoreLabel(item.overallScore, t)}
                  </TableCell>
                  <TableCell className="text-right">
                    <PracticeHistoryRowActions
                      item={item}
                      compareMode={compareMode}
                      onViewResult={onViewResult}
                      onResume={onResume}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((item) => {
          const group = getPracticeHistoryStatusGroup(item.status);
          const minutes = formatSessionDuration(item.createdAt, item.completedAt);
          return (
            <article
              key={item.id}
              className="rounded-xl border border-satin bg-surface-overlay p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <PracticeSessionTitle item={item} />
                  <div className="mt-2">
                    <Badge variant="outline" className={cn(statusClass[group])}>
                      {group === 'unknown'
                        ? item.status || t('practice.history.status.unknown')
                        : t(`practice.history.statusGroup.${group}`)}
                    </Badge>
                  </div>
                </div>
                {compareMode ? (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    disabled={!(group === 'completed' && item.overallScore != null)}
                    aria-label={t('practice.compare.selectItem')}
                    onChange={() => onToggleCompare?.(item.id)}
                  />
                ) : null}
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t('practice.history.columns.createdAt')}
                  </dt>
                  <dd>{formatSessionDateTime(item.createdAt, language)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t('practice.history.duration')}</dt>
                  <dd>{formatDurationLabel(minutes, t)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">{t('practice.history.score')}</dt>
                  <dd className="font-semibold">
                    {formatOverallScoreLabel(item.overallScore, t)}
                  </dd>
                </div>
              </dl>
              {!compareMode ? (
                <div className="mt-3">
                  <PracticeHistoryRowActions
                    item={item}
                    compareMode={false}
                    onViewResult={onViewResult}
                    onResume={onResume}
                  />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </>
  );
}

/**
 * Tiêu đề một dòng lịch sử, kèm NGUỒN của buổi (bài học trong lộ trình hay luyện tự do).
 *
 * 🔴 Ca thật (23/08): cột này lấy thẳng `jobCategory`, nên buổi sinh từ bài học và buổi luyện tự do
 * cùng ngành hiện y hệt nhau — đúng một chữ "BE". Người dùng vừa học xong một bài mở lịch sử ra
 * không có cách nào nhận ra buổi đó, và hai loại buổi khác hẳn nhau về ý nghĩa bị trộn làm một.
 *
 * Nhãn và cách phân loại đều lấy từ `practiceReportLabel` — KHÔNG đọc `lessonTitle` tại chỗ, để
 * mục Báo cáo và bảng này không bao giờ nói hai điều khác nhau về cùng một buổi.
 */
function PracticeSessionTitle({ item }: { item: PracticeSessionHistoryItem }) {
  const { t } = useLanguage();
  const label = practiceReportTitle(item);
  const source = practiceSessionSource(item);
  const category = item.jobCategory.trim();

  return (
    <>
      <p className="font-medium text-foreground">
        {label.text || t('practice.history.unknownCategory')}
      </p>
      <p className="text-xs text-muted-foreground">
        {t(PRACTICE_SESSION_SOURCE_LABEL_KEYS[source])}
        {/* Buổi bài học lấy TÊN BÀI làm tiêu đề, nên ngành phải xuống dòng phụ chứ không mất đi.
            Buổi tự do đã lấy chính ngành làm tiêu đề ⇒ nhắc lại là thừa. */}
        {source === 'lesson' && category ? ` · ${category}` : ''}
      </p>
    </>
  );
}
