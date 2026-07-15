import { Link } from 'react-router-dom';
import type { CandidateReportListItem } from '../../types/candidateReports.types';

interface ReportListItemProps {
  item: CandidateReportListItem;
  language: 'vi' | 'en';
  scoreLabel: string;
}

export function ReportListItem({ item, language, scoreLabel }: ReportListItemProps) {
  const title = language === 'vi' ? item.titleVi : item.title;
  const subtitle = language === 'vi' ? item.subtitleVi : item.subtitle;
  const dateLabel = new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'medium',
  }).format(new Date(item.createdAt));

  return (
    <Link
      to={item.href}
      className="flex items-start justify-between gap-3 rounded-lg border border-subtle bg-surface-overlay px-4 py-3 transition hover:border-default hover:bg-surface-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
    >
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
        <p className="text-[11px] text-muted-foreground">{dateLabel}</p>
      </div>
      {typeof item.score === 'number' ? (
        <span className="shrink-0 rounded-full bg-surface-raised px-2.5 py-1 text-xs font-semibold text-foreground">
          {scoreLabel}: {item.score}
        </span>
      ) : null}
    </Link>
  );
}
