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
import type { InterviewHistoryItem } from '../../types/history.types';

interface RoadmapReportsTableProps {
  reports: InterviewHistoryItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
}

export function RoadmapReportsTable({
  reports,
  selectedIds,
  onToggle,
  onSelectAll,
  onUnselectAll,
}: RoadmapReportsTableProps) {
  const { language, t } = useLanguage();
  const allSelected = reports.length > 0 && reports.every((item) => selectedIds.includes(item.id));

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const statusLabel = (status: InterviewHistoryItem['status']) => {
    if (status === 'in-progress') return t('practice.history.status.inProgress');
    if (status === 'pending') return t('practice.history.status.pending');
    return t('practice.history.status.completed');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-ghost text-sm" onClick={onSelectAll}>
          {t('practice.roadmapWizard.reports.selectAll')}
        </button>
        <button type="button" className="btn-ghost text-sm" onClick={onUnselectAll}>
          {t('practice.roadmapWizard.reports.unselectAll')}
        </button>
      </div>

      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" scope="col">
              <input
                type="checkbox"
                className="size-4 accent-foreground"
                checked={allSelected}
                aria-label={t('practice.roadmapWizard.reports.selectAll')}
                onChange={() => (allSelected ? onUnselectAll() : onSelectAll())}
              />
            </TableHead>
            <TableHead scope="col">{t('practice.roadmapWizard.reports.columns.title')}</TableHead>
            <TableHead scope="col">{t('practice.roadmapWizard.reports.columns.date')}</TableHead>
            <TableHead scope="col">{t('practice.roadmapWizard.reports.columns.level')}</TableHead>
            <TableHead scope="col">{t('practice.roadmapWizard.reports.score')}</TableHead>
            <TableHead className="hidden sm:table-cell" scope="col">
              {t('practice.roadmapWizard.reports.columns.duration')}
            </TableHead>
            <TableHead scope="col">{t('practice.roadmapWizard.reports.columns.status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => {
            const checked = selectedIds.includes(report.id);
            return (
              <TableRow key={report.id} data-state={checked ? 'selected' : undefined}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="size-4 accent-foreground"
                    checked={checked}
                    aria-label={report.jobTitle}
                    onChange={() => onToggle(report.id)}
                  />
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{report.jobTitle}</p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(report.date)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {t(`practice.roadmapWizard.level.${report.level}`)}
                </TableCell>
                <TableCell className="font-semibold tabular-nums text-foreground">
                  {report.overallScore}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                  {report.duration} {t('practice.roadmapWizard.reports.minutes')}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      report.status === 'completed' && 'border-success/30 bg-success/10 text-success',
                      report.status === 'in-progress' && 'border-info/30 bg-info/10 text-info',
                      report.status === 'pending' && 'border-warning/30 bg-warning/10 text-warning',
                    )}
                  >
                    {statusLabel(report.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
