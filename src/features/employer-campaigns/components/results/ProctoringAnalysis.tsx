import { useMemo } from 'react';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultFlag, CampaignResultFlagEvent } from '../../types/campaign.api.types';
import { normalizeFlagType } from '../../utils/proctoringFlagPriority';
import { buildProctoringIncidents, summarizeIncidentsByTier } from '../../utils/proctoringTimeline';
import { ProctoringAggregatedList } from './proctoring/ProctoringAggregatedList';
import { ProctoringTierSummary } from './proctoring/ProctoringTierSummary';
import { ProctoringTimelineList } from './proctoring/ProctoringTimelineList';

export type ProctoringTimelineStatus = 'loading' | 'error' | 'ready';

interface ProctoringAnalysisProps {
  /** Cờ đã gộp của `/results` — luôn có, là nguồn dự phòng. */
  flags: CampaignResultFlag[];
  /** Từng cờ theo giây (`/results/{sessionId}/flags`). Vắng = chưa tải. */
  events?: CampaignResultFlagEvent[];
  timelineStatus?: ProctoringTimelineStatus;
}

/**
 * Nội dung popup "Phân tích giám sát".
 *
 * Có dòng thời gian ⇒ đếm theo SỰ VIỆC (gộp các lượt kiểm mặt liên tiếp: vắng mặt 1 phút 26 giây là
 * 1 lần, không phải 8), xếp ba tầng danh tính → hành vi → không quan sát được, rồi dòng thời gian.
 * Đang tải / lỗi / rỗng ⇒ hiện dữ liệu gộp kèm một dòng nói rõ đó là số lượt ghi nhận — popup không
 * bao giờ trắng, và không bao giờ nói "không có gì" khi thật ra là chưa tải được.
 *
 * Trước 2026-10-05 popup có ô "Vi phạm thời gian" đếm loại cờ backend không bao giờ ghi (luôn 0) và ô
 * "Vi phạm cửa sổ" đếm theo dòng — cả hai đã gỡ.
 */
export function ProctoringAnalysis({ flags, events, timelineStatus = 'loading' }: ProctoringAnalysisProps) {
  const { t } = useLanguage();
  const serverKeys = useMemo(
    () => new Set(flags.filter((flag) => flag.source === 'Server').map((flag) => normalizeFlagType(flag.type))),
    [flags],
  );
  const incidents = useMemo(() => buildProctoringIncidents(events ?? []), [events]);
  const groups = useMemo(() => summarizeIncidentsByTier(incidents), [incidents]);
  const timelineReady = timelineStatus === 'ready' && incidents.length > 0;

  if (!timelineReady && flags.length === 0) {
    return <p className="text-sm text-success">{t('employer.campaigns.results.proctoring.none')}</p>;
  }

  return (
    <div className="space-y-4">
      {serverKeys.size > 0 ? (
        <p className="rounded-lg border border-satin bg-surface-overlay p-3 text-xs leading-relaxed text-muted-foreground">
          {t('employer.campaigns.results.proctoring.sourceExplanation')}
        </p>
      ) : null}

      {timelineReady ? (
        <>
          <p className="text-sm font-medium text-foreground" data-testid="proctoring-summary">
            {t('employer.campaigns.results.proctoring.summary')
              .replace('{{incidents}}', String(incidents.length))
              .replace('{{records}}', String(events?.length ?? 0))}
          </p>
          <ProctoringTierSummary groups={groups} serverKeys={serverKeys} />
          <section className="space-y-2" aria-labelledby="proctoring-timeline-heading">
            <h4 id="proctoring-timeline-heading" className="text-sm font-semibold text-foreground">
              {t('employer.campaigns.results.proctoring.timeline.title')}
            </h4>
            <ProctoringTimelineList incidents={incidents} />
          </section>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground" role="status">
            {timelineStatus === 'loading'
              ? t('employer.campaigns.results.proctoring.timeline.loading')
              : t('employer.campaigns.results.proctoring.timeline.error')}
          </p>
          <ProctoringAggregatedList flags={flags} />
        </>
      )}
    </div>
  );
}
