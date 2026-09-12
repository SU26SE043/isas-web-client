import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import { cn } from '@/lib/utils';
import type { RubricCriterion } from '../../../types/campaignManagement.types';
import { suggestCriterionLevels } from '../../../services/campaignLevels.service';
import {
  mergeSuggestedLevels,
  summarizeSuggestedLevels,
  type SuggestedCriterionLevels,
  type SuggestedLevelsMergeMode,
} from '../../../utils/criterionLevelRules';

interface SuggestLevelsButtonProps {
  /** Id chiến dịch đã tồn tại trên server (edit). Chỉ dùng khi KHÔNG có `onEnsurePersisted`. */
  campaignId?: string | null;
  /**
   * Lưu bản nháp (kể cả tiêu chí đang gõ dở) rồi trả id — AI đọc tiêu chí ĐÃ LƯU, nên có
   * hàm này thì LUÔN gọi trước, kể cả khi đã có `campaignId`: id cũ không mang tiêu chí mới.
   * Trả `null` = không lưu được ⇒ không gọi AI.
   */
  onEnsurePersisted?: () => Promise<string | null>;
  rubric: RubricCriterion[];
  onChangeRubric: (rubric: RubricCriterion[]) => void;
  disabled?: boolean;
}

type Notice = { kind: 'error' | 'info' | 'success'; text: string };

const K = 'employer.campaigns.wizard.levelsEditor';

/**
 * "AI đề xuất mốc" — gọi `POST /campaign/{id}/criteria/levels/suggest` rồi ghép kết quả vào
 * rubric local THEO TÊN (server trả id của bản đã lưu, wizard PUT mint id mới nên id vô dụng).
 *
 * Tiêu chí đã có mốc do HR soạn: hỏi "chỉ điền chỗ trống / thay hết" thay vì đè im lặng.
 * AI lỗi (502): hiện NGUYÊN câu server, KHÔNG rơi về dải mặc định — HR sẽ tin "Mức 3/10" là
 * do AI soạn rồi phát hành một thước đo chưa ai viết.
 */
export function SuggestLevelsButton({ campaignId, onEnsurePersisted, rubric, onChangeRubric, disabled }: SuggestLevelsButtonProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [pending, setPending] = useState<SuggestedCriterionLevels[] | null>(null);
  const needsSave = !onEnsurePersisted && !campaignId;

  const apply = (suggested: SuggestedCriterionLevels[], mode: SuggestedLevelsMergeMode) => {
    const summary = summarizeSuggestedLevels(rubric, suggested);
    onChangeRubric(mergeSuggestedLevels(rubric, suggested, mode));
    const applied = mode === 'fillEmpty' ? summary.matched - summary.matchedWithLevels : summary.matched;
    const parts = [t(`${K}.suggestApplied`).replace('{{count}}', String(applied))];
    if (summary.unmatched.length) {
      parts.push(
        t(`${K}.suggestUnmatched`)
          .replace('{{count}}', String(summary.unmatched.length))
          .replace('{{names}}', summary.unmatched.join(', ')),
      );
    }
    setNotice({ kind: 'success', text: parts.join(' ') });
    setPending(null);
  };

  const run = async () => {
    setNotice(null);
    setLoading(true);
    try {
      const id = onEnsurePersisted ? await onEnsurePersisted() : (campaignId ?? null);
      if (!id) {
        setNotice({ kind: 'error', text: t(`${K}.suggestNotSaved`) });
        return;
      }
      const { criteria } = await suggestCriterionLevels(id);
      const summary = summarizeSuggestedLevels(rubric, criteria);
      if (summary.matched === 0) {
        setNotice({ kind: 'info', text: t(`${K}.suggestNoMatch`) });
        return;
      }
      if (summary.matchedWithLevels > 0) {
        setPending(criteria);
        return;
      }
      apply(criteria, 'fillEmpty');
    } catch (error) {
      const status = getApiStatusCode(error);
      if (status === 409) setNotice({ kind: 'error', text: t(`${K}.suggestClosed`) });
      else if (status === 400) setNotice({ kind: 'error', text: getApiErrorMessage(error, t(`${K}.suggestNoCriteria`)) });
      // 502: câu của server nói AI hỏng vì sao — giữ nguyên, chỉ thay khi body rỗng.
      else if (status === 502) setNotice({ kind: 'error', text: getApiErrorMessage(error, t(`${K}.suggestAiFailed`)) });
      else setNotice({ kind: 'error', text: getApiErrorMessage(error, t(`${K}.suggestFailed`)) });
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = pending ? summarizeSuggestedLevels(rubric, pending).matchedWithLevels : 0;

  return (
    <div className="flex min-w-0 flex-col items-end gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={loading}
        disabled={disabled || needsSave}
        onClick={() => void run()}
        title={needsSave ? t(`${K}.suggestNeedsSave`) : undefined}
      >
        <Sparkles className="size-3.5" aria-hidden />
        {loading ? t(`${K}.suggesting`) : t(`${K}.suggest`)}
      </Button>
      {needsSave ? (
        <p className="max-w-xs text-right text-[11px] leading-relaxed text-muted-foreground">
          {t(`${K}.suggestNeedsSave`)}
        </p>
      ) : null}
      {notice ? (
        <p
          role={notice.kind === 'error' ? 'alert' : 'status'}
          className={cn(
            'max-w-md text-right text-xs leading-relaxed',
            notice.kind === 'error' ? 'text-error' : 'text-muted-foreground',
          )}
        >
          {notice.text}
        </p>
      ) : null}

      <AppModal open={pending !== null} onClose={() => setPending(null)} size="sm" ariaLabel={t(`${K}.mergeTitle`)}>
        <div className="space-y-4 pr-8">
          <h2 className="text-base font-semibold text-foreground">{t(`${K}.mergeTitle`)}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t(`${K}.mergeDescription`).replace('{{count}}', String(pendingCount))}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" size="lg" onClick={() => setPending(null)}>
              {t(`${K}.cancel`)}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => pending && apply(pending, 'replaceAll')}>
              {t(`${K}.mergeReplaceAll`)}
            </Button>
            <Button type="button" size="lg" onClick={() => pending && apply(pending, 'fillEmpty')}>
              {t(`${K}.mergeFillEmpty`)}
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  );
}
