import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { InterviewHistoryItem } from '../../types/history.types';
import {
  formatInterviewDate,
  formatInterviewDuration,
  historyStatusConfig,
} from './historyPageUtils';

interface HistoryTableProps {
  interviews: InterviewHistoryItem[];
  compareMode?: boolean;
  selectedIds?: string[];
  showHidden?: boolean;
  onSelect: (id: string) => void;
  onToggleCompare?: (id: string) => void;
  onHide?: (id: string) => void;
  onRestore?: (id: string) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  interviews,
  compareMode = false,
  selectedIds = [],
  showHidden = false,
  onSelect,
  onToggleCompare,
  onHide,
  onRestore,
}) => {
  const { t } = useLanguage();

  return (
    <Table className="min-w-[720px]">
      <TableHeader>
        <TableRow>
          {compareMode ? <TableHead className="w-10" scope="col" /> : null}
          <TableHead scope="col">{t('practice.history.columns.role')}</TableHead>
          <TableHead scope="col">{t('practice.history.date')}</TableHead>
          <TableHead scope="col">{t('practice.history.duration')}</TableHead>
          <TableHead scope="col">{t('practice.history.score')}</TableHead>
          <TableHead scope="col">{t('practice.history.filterStatus')}</TableHead>
          <TableHead className="text-right" scope="col">
            {t('practice.history.columns.actions')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {interviews.map((interview) => {
          const status = historyStatusConfig[interview.status];
          const canCompare = interview.status === 'completed' && interview.overallScore > 0;
          const isHidden = Boolean(interview.deletedAt);
          const selected = selectedIds.includes(interview.id);

          return (
            <TableRow
              key={interview.id}
              data-state={selected ? 'selected' : undefined}
            >
              {compareMode ? (
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={!canCompare}
                    title={!canCompare ? t('practice.compare.disabledHint') : undefined}
                    aria-label={t('practice.compare.selectItem')}
                    onChange={() => onToggleCompare?.(interview.id)}
                  />
                </TableCell>
              ) : null}
              <TableCell>
                <button
                  type="button"
                  className="text-left"
                  onClick={() => {
                    if (compareMode && canCompare) {
                      onToggleCompare?.(interview.id);
                      return;
                    }
                    onSelect(interview.id);
                  }}
                >
                  <p className="font-semibold text-foreground">{interview.jobTitle}</p>
                  <p className="text-xs text-muted-foreground">{interview.company}</p>
                </button>
              </TableCell>
              <TableCell>{formatInterviewDate(interview.date)}</TableCell>
              <TableCell>{formatInterviewDuration(interview.duration)}</TableCell>
              <TableCell className="font-semibold text-foreground">
                {interview.overallScore > 0 ? `${interview.overallScore}%` : '-'}
              </TableCell>
              <TableCell>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.badge}`}>
                  {t(status.label)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {!compareMode && !isHidden ? (
                    <button
                      type="button"
                      className="btn-ghost px-2 py-1 text-xs"
                      onClick={() => onSelect(interview.id)}
                    >
                      {t('practice.history.viewDetails')}
                    </button>
                  ) : null}
                  {showHidden && isHidden ? (
                    <button
                      type="button"
                      className="btn-secondary px-2 py-1 text-xs"
                      onClick={() => onRestore?.(interview.id)}
                    >
                      {t('practice.history.restore')}
                    </button>
                  ) : null}
                  {!showHidden && !isHidden && onHide ? (
                    <button
                      type="button"
                      className="btn-ghost px-2 py-1 text-xs text-red-300"
                      onClick={() => onHide(interview.id)}
                    >
                      {t('practice.history.hide')}
                    </button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
