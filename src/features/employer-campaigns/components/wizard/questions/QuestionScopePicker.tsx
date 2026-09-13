import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { RubricCriterion } from '../../../types/campaignManagement.types';

export interface QuestionScopePickerProps {
  questionId: string;
  rubric: RubricCriterion[];
  /** I2 — ba trạng thái: `null`/`undefined` = chưa gắn nhãn (chấm ĐỦ) · `[]` = đã xét, không nhắm · `[ids]`. */
  value: string[] | null | undefined;
  disabled?: boolean;
  onChange: (next: string[] | null) => void;
  /** Không có tiêu chí `WhenTargeted` nào ⇒ đường về bước 3 để đặt phạm vi. */
  onGoToCriteria?: () => void;
}

export function alwaysCriteria(rubric: RubricCriterion[]): RubricCriterion[] {
  return rubric.filter((criterion) => (criterion.scoringScope ?? 'Always') === 'Always');
}

export function targetableCriteria(rubric: RubricCriterion[]): RubricCriterion[] {
  return rubric.filter((criterion) => criterion.scoringScope === 'WhenTargeted');
}

/**
 * SC2 · T9 — chip chọn nhiều tiêu chí `WhenTargeted` cho MỘT câu hỏi + dòng chỉ đọc liệt kê tiêu chí `Always`.
 *
 * Giữ đúng 3 trạng thái I2 khi GHI: chưa từng chạm ⇒ KHÔNG gọi `onChange` (giá trị vẫn `null` = chấm đủ);
 * bấm bỏ chip cuối cùng ⇒ `[]` (đã xét, không nhắm — chỉ chấm `Always`), KHÔNG được quay về `null`. Gộp hai
 * ca này làm tính năng vô hiệu đúng ở nhóm câu cần nó nhất (câu xã giao).
 */
export function QuestionScopePicker({ questionId, rubric, value, disabled = false, onChange, onGoToCriteria }: QuestionScopePickerProps) {
  const { t } = useLanguage();
  const always = alwaysCriteria(rubric);
  const targetable = targetableCriteria(rubric);
  const selected = new Set(value ?? []);
  const alwaysLine = always.length
    ? t('employer.campaigns.questionCard.scope.always').replace('{{names}}', always.map((criterion) => criterion.name).join(' · '))
    : t('employer.campaigns.questionCard.scope.alwaysNone');

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    // Giữ thứ tự theo rubric (tiêu chí CHÍNH = phần tử đầu, BE dùng cho selector rút đều) chứ không theo thứ tự bấm.
    onChange(targetable.filter((criterion) => next.has(criterion.id)).map((criterion) => criterion.id));
  };

  const stateLine = value == null
    ? t('employer.campaigns.questionCard.scope.untouched')
    : value.length === 0
      ? t('employer.campaigns.questionCard.scope.empty')
      : null;

  return (
    <div className="space-y-2" data-testid="question-scope-picker">
      <p className="text-sm font-medium text-foreground" id={`q-scope-${questionId}`}>
        {t('employer.campaigns.questionCard.scope.title')}
      </p>
      {targetable.length === 0 ? (
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>{t('employer.campaigns.questionCard.scope.none')}</p>
          {onGoToCriteria ? (
            <button type="button" className="font-medium text-foreground underline underline-offset-4" onClick={onGoToCriteria}>
              {t('employer.campaigns.questionCard.scope.goToCriteria')}
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby={`q-scope-${questionId}`}>
            {targetable.map((criterion) => {
              const active = selected.has(criterion.id);
              return (
                <button
                  key={criterion.id}
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  disabled={disabled}
                  title={t('employer.campaigns.questionCard.scope.hint')}
                  onClick={() => toggle(criterion.id)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors duration-200 ease-out',
                    active ? 'border-foreground bg-foreground text-background' : 'border-satin bg-surface-base text-muted-foreground hover:text-foreground',
                    disabled && 'cursor-not-allowed opacity-60',
                  )}
                >
                  {active ? <Check className="size-3" aria-hidden /> : null}
                  {criterion.name}
                </button>
              );
            })}
          </div>
          {stateLine ? <p className="text-xs text-muted-foreground">{stateLine}</p> : null}
        </>
      )}
      <p className="text-xs text-muted-foreground">{alwaysLine}</p>
    </div>
  );
}
