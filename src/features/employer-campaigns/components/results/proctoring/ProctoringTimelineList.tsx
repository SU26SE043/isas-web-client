import { Fragment } from 'react';
import { useLanguage } from '@/shared/languages';
import {
  formatResultClock,
  formatResultDay,
  resultDayKey,
  spansMultipleDays,
} from '../../../utils/campaignResultsActions';
import { flagNoteText } from '../../../utils/flagNoteText';
import { flagTypeLabel, REVIEW_PRIORITY_DOT_CLASS } from '../../../utils/proctoringFlagPriority';
import { incidentSpanSeconds, type ProctoringIncident } from '../../../utils/proctoringTimeline';

/**
 * Dòng thời gian theo SỰ VIỆC (đã gộp các lượt kiểm mặt liên tiếp), mỗi dòng giữ ghi chú RIÊNG của nó —
 * dữ liệu gộp của `/results` chỉ giữ ghi chú đầu tiên nên Alt+Tab / thoát toàn màn hình (cùng mã
 * `tab_switch`) trông y như chuyển tab. Trải qua nhiều ngày ⇒ có tiêu đề ngày.
 */
export function ProctoringTimelineList({ incidents }: { incidents: ProctoringIncident[] }) {
  const { t, language } = useLanguage();
  const multiDay = spansMultipleDays(incidents.map((incident) => incident.startAt));
  const hasSpan = incidents.some((incident) => incident.faceCheck && incidentSpanSeconds(incident) > 0);

  return (
    <div className="space-y-2">
      <ol className="space-y-1.5" aria-label={t('employer.campaigns.results.proctoring.timeline.title')}>
        {incidents.map((incident, index) => {
          const day = resultDayKey(incident.startAt);
          const showDay = multiDay && (index === 0 || day !== resultDayKey(incidents[index - 1].startAt));
          return (
            <Fragment key={`${incident.key}-${incident.startMs}-${index}`}>
              {showDay ? (
                <li className="pt-1 text-xs font-semibold text-muted-foreground" aria-hidden>
                  {formatResultDay(incident.startAt, language)}
                </li>
              ) : null}
              <TimelineRow incident={incident} />
            </Fragment>
          );
        })}
      </ol>
      {hasSpan ? (
        <p className="text-xs text-muted-foreground">{t('employer.campaigns.results.proctoring.spanLegend')}</p>
      ) : null}
    </div>
  );
}

function TimelineRow({ incident }: { incident: ProctoringIncident }) {
  const { t, language } = useLanguage();
  const start = formatResultClock(incident.startAt, language, { seconds: true });
  const end = incident.endMs > incident.startMs
    ? formatResultClock(incident.endAt, language, { seconds: true })
    : null;
  const notes = incident.notes.map((note) => flagNoteText(note, t)).filter(Boolean);
  return (
    <li data-flag-type={incident.key} className="flex flex-col gap-0.5 text-sm sm:flex-row sm:gap-3">
      <span className="shrink-0 tabular-nums text-muted-foreground sm:w-36">
        {end ? `${start}–${end}` : start}
      </span>
      <span className="flex min-w-0 gap-2">
        <span className={`mt-1.5 size-2 shrink-0 rounded-full ${REVIEW_PRIORITY_DOT_CLASS[incident.priority]}`} aria-hidden />
        <span className="min-w-0">
          <span className="font-medium text-foreground">{flagTypeLabel(incident.type, t)}</span>
          {incident.faceCheck && incident.checks > 1 ? (
            <span className="text-muted-foreground">
              {' · '}
              {t('employer.campaigns.results.proctoring.checks').replace('{{count}}', String(incident.checks))}
            </span>
          ) : null}
          {notes.length > 0 ? <span className="block text-xs text-muted-foreground">{notes.join(' · ')}</span> : null}
          {incident.serverRecorded ? (
            <span className="block text-xs text-muted-foreground">
              {t('employer.campaigns.results.proctoring.timeline.serverRecorded')}
            </span>
          ) : null}
        </span>
      </span>
    </li>
  );
}
