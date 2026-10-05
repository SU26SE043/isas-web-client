import { useLanguage } from '@/shared/languages';
import type { CampaignResultFlag } from '../../../types/campaign.api.types';
import { formatResultClock, spansMultipleDays } from '../../../utils/campaignResultsActions';
import { flagNoteText } from '../../../utils/flagNoteText';
import {
  flagTypeLabel,
  getReviewPriority,
  REVIEW_PRIORITY_CLASS,
} from '../../../utils/proctoringFlagPriority';
import { ResultFlagSourceLabel } from '../ResultFlagSourceLabel';

/**
 * Cờ ĐÃ GỘP theo loại (dữ liệu của `/results`): mỗi dòng = một loại + số LƯỢT GHI NHẬN (không phải số
 * sự việc — lượt kiểm mặt lặp lại khi hiện tượng kéo dài). Dùng ở khu chưa chấm và làm dự phòng của
 * popup khi chưa tải được dòng thời gian.
 */
export function ProctoringAggregatedList({ flags }: { flags: CampaignResultFlag[] }) {
  const { t, language } = useLanguage();
  const withDate = spansMultipleDays(flags.flatMap((flag) => [flag.firstAt, flag.lastAt]));

  return (
    <ul className="space-y-2 text-xs">
      {flags.map((flag) => {
        const firstAt = formatResultClock(flag.firstAt, language, { date: withDate });
        const lastAt = formatResultClock(flag.lastAt, language, { date: withDate });
        return (
          <li
            key={`${flag.type}-${flag.source}-${flag.count}-${flag.note ?? ''}`}
            className={`rounded-lg border px-3 py-2 ${REVIEW_PRIORITY_CLASS[getReviewPriority(flag.type)]}`}
          >
            <p className="font-medium">
              {flagTypeLabel(flag.type, t)}
              {' · '}
              {t('employer.campaigns.results.proctoring.records').replace('{{count}}', String(flag.count))}
              <ResultFlagSourceLabel flag={flag} />
            </p>
            {flag.note?.trim() ? <p className="mt-1 text-current/80">{flagNoteText(flag.note, t)}</p> : null}
            {firstAt || lastAt ? (
              <p className="mt-1 text-current/80">
                {firstAt ? `${t('employer.campaigns.results.proctoring.firstAt')} ${firstAt}` : null}
                {firstAt && lastAt ? ' · ' : null}
                {lastAt ? `${t('employer.campaigns.results.proctoring.lastAt')} ${lastAt}` : null}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
