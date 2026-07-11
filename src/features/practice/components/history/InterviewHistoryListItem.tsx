import React from 'react';
import { useLanguage } from '../../../../shared/languages';
import type { InterviewHistoryItem } from '../../types/history.types';
import {
  formatInterviewDate,
  formatInterviewDuration,
  getCompanyColor,
  getCompanyInitials,
  historyStatusConfig,
} from './historyPageUtils';

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface InterviewHistoryListItemProps {
  interview: InterviewHistoryItem;
  index: number;
  onSelect: (id: string) => void;
  compareMode?: boolean;
  selected?: boolean;
  onToggleCompare?: (id: string) => void;
}

export const InterviewHistoryListItem: React.FC<InterviewHistoryListItemProps> = ({
  interview,
  index,
  onSelect,
  compareMode = false,
  selected = false,
  onToggleCompare,
}) => {
  const { t } = useLanguage();
  const status = historyStatusConfig[interview.status];
  const hasScore = interview.overallScore > 0;

  const canCompare = interview.status === 'completed' && interview.overallScore > 0;

  return (
    <div
      role="button"
      tabIndex={0}
      className={[
        'flex items-center border border-subtle rounded-xl px-5 py-4 bg-surface-raised hover:shadow-md transition-all cursor-pointer group shrink-0',
        selected ? 'ring-2 ring-[var(--border-focus)]' : '',
      ].join(' ')}
      onClick={() => {
        if (compareMode && canCompare) {
          onToggleCompare?.(interview.id);
          return;
        }
        onSelect(interview.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (compareMode && canCompare) {
            onToggleCompare?.(interview.id);
            return;
          }
          onSelect(interview.id);
        }
      }}
    >
      {compareMode ? (
        <div className="mr-4 flex h-5 w-5 items-center justify-center">
          <input
            type="checkbox"
            checked={selected}
            disabled={!canCompare}
            onChange={() => onToggleCompare?.(interview.id)}
            onClick={(event) => event.stopPropagation()}
            aria-label={t('practice.compare.selectItem')}
            className="h-4 w-4 rounded border-subtle"
          />
        </div>
      ) : null}
      <div className="w-1/3 flex items-center min-w-0 pr-4">
        <div
          className={`flex-shrink-0 w-11 h-11 rounded-xl ${getCompanyColor(index)} flex items-center justify-center text-foreground font-bold text-lg shadow-sm border border-subtle`}
        >
          {getCompanyInitials(interview.jobTitle || interview.company)}
        </div>
        <div className="ml-4 truncate">
          <h3 className="font-bold text-foreground text-[15px] truncate">{interview.jobTitle}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{interview.company}</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-between px-4">
        <div className="w-36 flex flex-col">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5">
            {t('practice.history.date')}
          </span>
          <div className="flex items-center text-[13px] text-muted-foreground font-medium">
            <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
            {formatInterviewDate(interview.date)}
          </div>
        </div>
        <div className="w-24 flex flex-col">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5">
            {t('practice.history.duration')}
          </span>
          <div className="flex items-center text-[13px] text-muted-foreground font-medium">
            <ClockIcon className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
            {formatInterviewDuration(interview.duration)}
          </div>
        </div>
        <div className="w-24 flex flex-col">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5">
            {t('practice.history.score')}
          </span>
          <div className="flex items-center text-[13px] font-bold">
            <StarIcon
              className={`w-3.5 h-3.5 mr-1.5 ${hasScore ? 'text-success' : 'text-muted-foreground'}`}
            />
            <span className={hasScore ? 'text-success' : 'text-muted-foreground'}>
              {hasScore ? `${interview.overallScore}%` : '-'}
            </span>
          </div>
        </div>
      </div>

      <div className="w-48 flex items-center justify-end gap-5 pl-4 shrink-0">
        <span className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${status.badge}`}>
          {t(status.label)}
        </span>
        <span className="w-8 h-8 flex items-center justify-center rounded-lg border border-subtle text-muted-foreground group-hover:border-default group-hover:bg-surface-overlay transition-colors">
          <ChevronRightIcon className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
};
