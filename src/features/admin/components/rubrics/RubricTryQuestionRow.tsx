import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/shared/languages';
import type { AdminRubricSet } from '../../types/adminApi.types';

export type RubricTryQuestionMode = 'sample' | 'custom';
export interface RubricTryQuestionState {
  mode: RubricTryQuestionMode;
  sampleQuestionId: string;
  customQuestion: string;
  seniority: string;
}

const SENIORITIES = ['Fresher', 'Junior', 'Middle', 'Senior'] as const;
const SELECT_CLASS = 'h-9 w-full rounded-lg border border-satin bg-surface-overlay px-3 text-sm text-foreground';

interface RubricTryQuestionRowProps {
  rubric: AdminRubricSet;
  value: RubricTryQuestionState;
  /** Panel chặn đổi câu khi đã có bài (hỏi trước) — nên mọi thay đổi đi qua callback này. */
  onChange: (next: RubricTryQuestionState) => void;
  disabled?: boolean;
}

/** Câu hỏi đang thử phải nhìn thấy TRONG LÚC nói — như phòng luyện thật — nên dòng này đứng ngay trên mic. */
export function selectedQuestionText(rubric: AdminRubricSet, value: RubricTryQuestionState): string {
  if (value.mode === 'custom') return value.customQuestion.trim();
  return rubric.sampleQuestions.find((q) => q.id === value.sampleQuestionId)?.text ?? '';
}

export function RubricTryQuestionRow({ rubric, value, onChange, disabled }: RubricTryQuestionRowProps) {
  const { t } = useLanguage();
  const set = (patch: Partial<RubricTryQuestionState>) => onChange({ ...value, ...patch });
  const text = selectedQuestionText(rubric, value);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_12rem]">
        <div className="space-y-1.5">
          <Label htmlFor="rubric-try-question-mode">{t('admin.rubrics.preview.question')}</Label>
          <select id="rubric-try-question-mode" value={value.mode} disabled={disabled} onChange={(event) => set({ mode: event.target.value as RubricTryQuestionMode })} className={SELECT_CLASS}>
            <option value="sample">{t('admin.rubrics.preview.questionSample')}</option>
            <option value="custom">{t('admin.rubrics.preview.questionCustom')}</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rubric-try-question-pick">{value.mode === 'sample' ? t('admin.rubrics.preview.questionSample') : t('admin.rubrics.preview.questionCustom')}</Label>
          {value.mode === 'sample' ? (
            <select id="rubric-try-question-pick" value={value.sampleQuestionId} disabled={disabled || rubric.sampleQuestions.length === 0} onChange={(event) => set({ sampleQuestionId: event.target.value })} className={SELECT_CLASS}>
              {rubric.sampleQuestions.length === 0 ? <option value="">{t('admin.rubrics.preview.noSamples')}</option> : null}
              {rubric.sampleQuestions.map((q) => <option key={q.id} value={q.id}>{q.text}</option>)}
            </select>
          ) : (
            <Textarea id="rubric-try-question-pick" value={value.customQuestion} rows={2} disabled={disabled} onChange={(event) => set({ customQuestion: event.target.value })} placeholder={t('admin.rubrics.preview.questionPlaceholder')} />
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rubric-try-seniority">{t('admin.rubrics.preview.seniority')}</Label>
          <select id="rubric-try-seniority" value={value.seniority} disabled={disabled} onChange={(event) => set({ seniority: event.target.value })} className={SELECT_CLASS}>
            <option value="">{t('admin.rubrics.preview.seniorityAny')}</option>
            {SENIORITIES.map((s) => <option key={s} value={s}>{t(`admin.rubrics.seniority.${s}`)}</option>)}
          </select>
        </div>
      </div>
      {text ? (
        <blockquote className="rounded-xl border border-satin bg-surface-overlay/60 px-4 py-3 text-base text-foreground" aria-label={t('admin.rubrics.try.questionNow')}>
          <span className="block text-xs uppercase tracking-wider text-muted-foreground">{t('admin.rubrics.try.questionNow')}</span>
          {text}
        </blockquote>
      ) : null}
    </div>
  );
}
