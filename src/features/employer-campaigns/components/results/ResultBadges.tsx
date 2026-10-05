import { TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultItem, CampaignResultStatus } from '../../types/campaign.api.types';
import {
  formatResultDateTime,
  formatResultScore,
  getResultFlagCount,
  hasResultOverride,
} from '../../utils/campaignResultsActions';
import { ResultFlagSourceLabel } from './ResultFlagSourceLabel';
import { ResultsCriterionCutoff } from './ResultsContextStrip';
import { flagNoteText } from '../../utils/flagNoteText';
import {
  distinctFlagTypeCount,
  flagTypeLabel,
  getReviewPriority,
  pickTopFlag,
  REVIEW_PRIORITY_CLASS,
  REVIEW_PRIORITY_DOT_CLASS,
} from '../../utils/proctoringFlagPriority';

export function ResultStatusBadge({ result }: { result: CampaignResultStatus }) {
  const { t } = useLanguage();
  if (result === 'Pass') {
    return (
      <Badge className="border-transparent bg-success/15 text-success">
        {t('employer.campaigns.results.pass')}
      </Badge>
    );
  }
  if (result === 'Fail') {
    return (
      <Badge variant="destructive">{t('employer.campaigns.results.fail')}</Badge>
    );
  }
  return (
    <Badge variant="outline">{t('employer.campaigns.results.undetermined')}</Badge>
  );
}

/**
 * Badge "HR đã điều chỉnh" — tooltip (title) mang giờ + lý do để HR đọc ngay trên bảng.
 * `hideNone`: không render chữ "Chưa điều chỉnh" khi đứng trong ô điểm (ở đó im lặng = không có gì để nói).
 */
export function ResultOverrideBadge({ item, hideNone = false }: { item: CampaignResultItem; hideNone?: boolean }) {
  const { t, language } = useLanguage();
  if (!hasResultOverride(item)) {
    if (hideNone) return null;
    return (
      <span className="text-xs text-muted-foreground">
        {t('employer.campaigns.results.override.none')}
      </span>
    );
  }
  const title = item.overriddenAt
    ? t('employer.campaigns.results.override.badgeTooltip').replace(
        '{{time}}',
        formatResultDateTime(item.overriddenAt, language),
      ).replace('{{note}}', item.overrideNote?.trim() || t('employer.campaigns.results.override.unchanged'))
    : undefined;
  return (
    <Badge
      variant="secondary"
      title={title}
      className="border-transparent bg-info/15 text-info"
    >
      {t('employer.campaigns.results.override.badge')}
    </Badge>
  );
}

/**
 * Ô cờ của bảng kết quả: loại NẶNG NHẤT (tầng danh tính → hành vi → không quan sát được) tô theo tầng,
 * kèm "+N loại khác" và tổng LƯỢT GHI NHẬN. Trước đây mọi hàng cùng một chữ "N cảnh báo" màu cam nên
 * "Khuôn mặt không khớp" trông y như "Gián đoạn giám sát", và tooltip in mã thô (`tab_switch: 3`).
 * Số ở đây là lượt ghi nhận chứ không phải số sự việc — gộp sự việc cần dòng thời gian từng buổi.
 */
export function ResultFlagsCell({ item }: { item: CampaignResultItem }) {
  const { t } = useLanguage();
  const flagCount = getResultFlagCount(item.flags);
  const top = pickTopFlag(item.flags);
  if (flagCount === 0 || !top) {
    return <span className="text-xs text-muted-foreground">{t('employer.campaigns.results.flags.none')}</span>;
  }
  const priority = getReviewPriority(top.type);
  const moreTypes = distinctFlagTypeCount(item.flags) - 1;
  const tooltip = item.flags
    .map((flag) => {
      const records = t('employer.campaigns.results.proctoring.records').replace('{{count}}', String(flag.count));
      const source = flag.source === 'Server' ? ` (${t('employer.campaigns.results.flags.recordedBySystem')})` : '';
      const note = flag.note?.trim() ? ` — ${flagNoteText(flag.note, t)}` : '';
      return `${flagTypeLabel(flag.type, t)}: ${records}${source}${note}`;
    })
    .join('\n');
  const serverFlag = item.flags.find((flag) => flag.source === 'Server');
  return (
    <span className="inline-flex flex-col items-start gap-1" title={tooltip}>
      <span
        data-priority={priority}
        className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${REVIEW_PRIORITY_CLASS[priority]}`}
      >
        <span className={`size-1.5 shrink-0 rounded-full ${REVIEW_PRIORITY_DOT_CLASS[priority]}`} aria-hidden />
        <span className="truncate">{flagTypeLabel(top.type, t)}</span>
        {moreTypes > 0 ? (
          <span className="shrink-0 font-normal">
            {t('employer.campaigns.results.flags.moreTypes').replace('{{count}}', String(moreTypes))}
          </span>
        ) : null}
      </span>
      <span className="text-xs text-muted-foreground">
        {t('employer.campaigns.results.flags.count').replace('{{count}}', String(flagCount))}
        {serverFlag ? <ResultFlagSourceLabel flag={serverFlag} /> : null}
      </span>
    </span>
  );
}

/**
 * Ô "Điểm chính thức" của bảng: điểm chốt + điểm AI gốc + số câu gốc đã trả lời + badge HR (kèm tooltip lý do).
 * Đây là ô DUY NHẤT nói về điểm/điều chỉnh trên một hàng — trước đây "Điểm AI" và "HR đã điều chỉnh" còn
 * lặp lại ở hai cột riêng, làm bảng 9 cột tràn khung 1440 và cột dính phải đè lên "Thời gian chấm".
 */
export function ResultScoreCells({ item }: { item: CampaignResultItem }) {
  const { t } = useLanguage();
  return (
    <>
      <span className="text-base font-semibold tabular-nums text-foreground">
        {formatResultScore(item.totalScore)}
      </span>
      <div className="mt-0.5 space-y-1 text-xs text-muted-foreground">
        <p className="whitespace-nowrap">
          {t('employer.campaigns.results.aiScore')}: {formatResultScore(item.aiScore)}
          {item.seedAnswered != null && item.seedTotal != null
            ? ` · ${item.seedAnswered}/${item.seedTotal} ${t('employer.campaigns.results.context.seedQuestions')}`
            : ''}
        </p>
        <ResultOverrideBadge item={item} hideNone />
      </div>
    </>
  );
}

export function ResultCandidateMeta({ item }: { item: CampaignResultItem }) {
  const { t } = useLanguage();
  return (
    <div className="mt-1 space-y-1 text-xs text-muted-foreground">
      {item.cvMatchScore != null ? (
        <p title={t('employer.campaigns.results.context.cvHint')}>
          CV {formatResultScore(item.cvMatchScore)} · {t('employer.campaigns.results.context.cvRisk')} {item.cvVerificationRisk ?? '—'}
          {item.cvScreeningVersion === 1 ? ` ${t('employer.campaigns.results.context.legacyScale')}` : ''}
        </p>
      ) : null}
      {item.scoreFallback === true ? (
        <p className="flex items-center gap-1 text-warning">
          <TriangleAlert className="size-3.5" aria-hidden />
          {t('employer.campaigns.results.context.fallback')}
        </p>
      ) : null}
      <ResultsCriterionCutoff item={item} />
    </div>
  );
}

export function candidateDisplayName(
  item: Pick<CampaignResultItem, 'fullName' | 'email'>,
  t: (key: string) => string,
) {
  return (
    item.fullName?.trim() ||
    item.email?.trim() ||
    t('employer.campaigns.results.noName')
  );
}

export function candidateDisplayEmail(
  item: Pick<CampaignResultItem, 'fullName' | 'email'>,
  t: (key: string) => string,
) {
  if (!item.fullName?.trim()) return '';
  return item.email?.trim() || t('employer.campaigns.results.noEmail');
}
