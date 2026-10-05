import { useLanguage } from '@/shared/languages';
import { flagTypeLabel, REVIEW_PRIORITY_DOT_CLASS } from '../../../utils/proctoringFlagPriority';
import type { ProctoringTierGroup, ProctoringTypeSummary } from '../../../utils/proctoringTimeline';
import { formatDuration } from '../../../utils/resultDetailViewModel';
import { RecordedBySystemBadge } from '../ResultFlagSourceLabel';

type Translate = (key: string) => string;

/**
 * Ba tầng theo thứ tự HR nên đọc (khớp backend AC1). Tầng trống vẫn hiện "Không có": HR cần biết
 * tầng danh tính ĐÃ được xét và sạch, không phải bị quên.
 */
export function ProctoringTierSummary({
  groups,
  serverKeys,
}: {
  groups: ProctoringTierGroup[];
  serverKeys: ReadonlySet<string>;
}) {
  const { t, language } = useLanguage();
  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <section
          key={group.priority}
          data-tier={group.priority}
          className="rounded-xl border border-satin bg-surface-overlay p-3"
          aria-labelledby={`proctoring-tier-${group.priority}`}
        >
          <div className="flex items-start gap-2">
            <span className={`mt-1.5 size-2 shrink-0 rounded-full ${REVIEW_PRIORITY_DOT_CLASS[group.priority]}`} aria-hidden />
            <div className="min-w-0">
              <h4 id={`proctoring-tier-${group.priority}`} className="text-sm font-semibold text-foreground">
                {t(`employer.campaigns.results.proctoring.tier.${group.priority}.title`)}
              </h4>
              <p className="text-xs text-muted-foreground">
                {t(`employer.campaigns.results.proctoring.tier.${group.priority}.hint`)}
              </p>
            </div>
          </div>
          {group.items.length === 0 ? (
            <p className="mt-2 pl-4 text-xs text-muted-foreground">{t('employer.campaigns.results.proctoring.tier.empty')}</p>
          ) : (
            <ul className="mt-2 space-y-1.5 pl-4">
              {group.items.map((item) => (
                <li key={item.key} data-flag-type={item.key} className="text-sm text-foreground">
                  <span className="font-medium">{flagTypeLabel(item.type, t)}</span>
                  {' · '}
                  {t('employer.campaigns.results.proctoring.incidents').replace('{{count}}', String(item.incidents))}
                  {serverKeys.has(item.key) ? <RecordedBySystemBadge /> : null}
                  {item.faceCheck ? (
                    <span className="block text-xs text-muted-foreground">{faceCheckDetail(item, t, language)}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

/**
 * Cờ kiểm mặt: một lượt kiểm lẻ (dễ là nhiễu ánh sáng/góc máy) khác hẳn một chuỗi lượt kiểm liên tiếp
 * (hiện tượng kéo dài) — HR cần thấy khác biệt đó, không chỉ con số.
 */
export function faceCheckDetail(item: ProctoringTypeSummary, t: Translate, language: string): string {
  const checks = t('employer.campaigns.results.proctoring.checks').replace('{{count}}', String(item.checks));
  if (item.checks === item.incidents) return t('employer.campaigns.results.proctoring.singleCheck');
  if (item.incidents === 1 && item.spanSeconds > 0) {
    const span = t('employer.campaigns.results.proctoring.span')
      .replace('{{duration}}', formatDuration(item.spanSeconds, language) ?? '');
    return `${span} (${checks})`;
  }
  return checks;
}
