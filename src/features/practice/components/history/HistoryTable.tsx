import React from 'react';
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
    <div className="overflow-x-auto rounded-xl border border-subtle">
      <table className="min-w-full divide-y divide-[var(--border-subtle)]">
        <thead className="bg-surface-overlay">
          <tr>
            {compareMode ? <th className="w-10 px-4 py-3" scope="col" /> : null}
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground" scope="col">
              {t('practice.history.columns.role')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground" scope="col">
              {t('practice.history.date')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground" scope="col">
              {t('practice.history.duration')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground" scope="col">
              {t('practice.history.score')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground" scope="col">
              {t('practice.history.filterStatus')}
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground" scope="col">
              {t('practice.history.columns.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)] bg-surface-raised">
          {interviews.map((interview) => {
            const status = historyStatusConfig[interview.status];
            const canCompare = interview.status === 'completed' && interview.overallScore > 0;
            const isHidden = Boolean(interview.deletedAt);
            const selected = selectedIds.includes(interview.id);

            return (
              <tr
                key={interview.id}
                className={selected ? 'bg-surface-overlay' : 'hover:bg-surface-overlay/60'}
              >
                {compareMode ? (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={!canCompare}
                      title={!canCompare ? t('practice.compare.disabledHint') : undefined}
                      aria-label={t('practice.compare.selectItem')}
                      onChange={() => onToggleCompare?.(interview.id)}
                    />
                  </td>
                ) : null}
                <td className="px-4 py-3">
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
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{formatInterviewDate(interview.date)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatInterviewDuration(interview.duration)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-foreground">
                  {interview.overallScore > 0 ? `${interview.overallScore}%` : '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.badge}`}>
                    {t(status.label)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {!compareMode && !isHidden ? (
                      <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => onSelect(interview.id)}>
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
