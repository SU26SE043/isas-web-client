import { useMemo, useState } from 'react';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import { RubricPreviewHistory, runNumberOf } from '@/features/employer-campaigns/components/wizard/preview/RubricPreviewHistory';
import { RubricPreviewResult } from '@/features/employer-campaigns/components/wizard/preview/RubricPreviewResult';
import type { AdminRubricPreviewRequest, AdminRubricPreviewRun, AdminRubricSet } from '../../types/adminApi.types';
import { toEmployerPreviewRun } from '../../utils/adminRubricApi';

interface AdminRubricPreviewPanelProps {
  rubric: AdminRubricSet;
  /** Có thay đổi chưa lưu ⇒ chấm thử vẫn chạy trên bản ĐÃ LƯU — phải nói ra, không chặn. */
  hasUnsavedChanges: boolean;
  preview: UseMutationResult<AdminRubricPreviewRun, unknown, AdminRubricPreviewRequest>;
  history: UseQueryResult<AdminRubricPreviewRun[], unknown>;
}

const SENIORITIES = ['Fresher', 'Junior', 'Middle', 'Senior'] as const;
const SELECT_CLASS = 'h-9 w-full rounded-lg border border-satin bg-surface-overlay px-3 text-sm text-foreground';

/**
 * Chấm thử thước đo (BC-8): AI viết 3 bài mẫu cho MỘT câu rồi chấm thật bằng bộ đang lưu — admin
 * thấy dải điểm trước khi người luyện gặp nó. Kết quả và lịch sử tái dùng UI của employer qua
 * adapter (`toEmployerPreviewRun`), vì hai màn nhìn cùng một loại dữ liệu.
 *
 * Bản cũ gửi `{criterionKey, answer}` (BE không có trường nào như vậy ⇒ chạy với câu mặc định) và
 * KHÔNG render kết quả — tốn 1/5 lượt miễn phí mà màn hình đứng im.
 */
export function AdminRubricPreviewPanel({ rubric, hasUnsavedChanges, preview, history }: AdminRubricPreviewPanelProps) {
  const { t } = useLanguage();
  const [questionMode, setQuestionMode] = useState<'sample' | 'custom'>('sample');
  const [sampleQuestionId, setSampleQuestionId] = useState(rubric.sampleQuestions[0]?.id ?? '');
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [seniority, setSeniority] = useState('');
  const [viewingId, setViewingId] = useState<string | null>(null);

  // Chỉ CẢNH BÁO, không chặn: BE chỉ đòi mốc ở tiêu chí do AI chấm (`MeasuredCriteriaSplit.ForAi`) — tiêu chí
  // đo bằng số (độ trôi chảy, F11) cố ý 0 mốc, mà DTO admin chưa lộ `scoringMethod` nên FE không phân biệt được.
  // Chặn cứng ở đây là khoá chấm thử với mọi bộ chuẩn ĐÚNG (đo trên dev: 6/7 có mốc là trạng thái chuẩn).
  const missingLevels = useMemo(() => rubric.criteria.filter((c) => c.levels.length < 2).map((c) => c.name), [rubric.criteria]);
  const runs = history.data ?? [];
  const latest = preview.data ?? runs[0] ?? null;
  const viewing = (viewingId ? runs.find((run) => run.id === viewingId) : null) ?? latest;
  const freeRuns = latest && latest.rubricVersion === rubric.version ? latest.freeRunsRemaining : null;
  const employerRuns = useMemo(() => runs.map(toEmployerPreviewRun), [runs]);

  const canRun = !preview.isPending && (questionMode === 'sample' ? Boolean(sampleQuestionId) || rubric.sampleQuestions.length === 0 : customQuestion.trim().length > 0);
  const run = () => {
    const input: AdminRubricPreviewRequest = {
      ...(questionMode === 'custom' ? { question: customQuestion.trim() } : sampleQuestionId ? { sampleQuestionId } : {}),
      ...(customAnswer.trim() ? { customAnswer: customAnswer.trim() } : {}),
      ...(seniority ? { seniority } : {}),
    };
    preview.mutate(input, { onSuccess: () => setViewingId(null) });
  };
  const errorKey = () => {
    const status = getApiStatusCode(preview.error);
    return status && [400, 404, 409, 429, 502].includes(status) ? `admin.rubrics.preview.error.${status}` : 'admin.rubrics.preview.error.default';
  };

  return (
    <section className="space-y-4 rounded-xl border border-satin bg-surface-raised p-4" aria-label={t('admin.rubrics.preview.title')}>
      <div>
        <h2 className="text-base font-medium text-foreground">{t('admin.rubrics.preview.title')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.rubrics.preview.description')}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {freeRuns !== null
            ? t('admin.rubrics.preview.free').replace('{count}', String(freeRuns)).replace('{version}', String(rubric.version))
            : t('admin.rubrics.preview.freeUnknown').replace('{version}', String(rubric.version))}
        </p>
      </div>

      {missingLevels.length ? <Alert variant="warning"><AlertDescription>{t('admin.rubrics.preview.needsLevels').replace('{names}', missingLevels.join(', '))}</AlertDescription></Alert> : null}
      {hasUnsavedChanges ? <Alert variant="info"><AlertDescription>{t('admin.rubrics.preview.unsaved')}</AlertDescription></Alert> : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rubric-preview-question-mode">{t('admin.rubrics.preview.question')}</Label>
          <select id="rubric-preview-question-mode" value={questionMode} onChange={(event) => setQuestionMode(event.target.value as 'sample' | 'custom')} className={SELECT_CLASS}>
            <option value="sample">{t('admin.rubrics.preview.questionSample')}</option>
            <option value="custom">{t('admin.rubrics.preview.questionCustom')}</option>
          </select>
          {questionMode === 'sample' ? (
            <select aria-label={t('admin.rubrics.preview.questionSample')} value={sampleQuestionId} onChange={(event) => setSampleQuestionId(event.target.value)} className={SELECT_CLASS} disabled={rubric.sampleQuestions.length === 0}>
              {rubric.sampleQuestions.length === 0 ? <option value="">{t('admin.rubrics.preview.noSamples')}</option> : null}
              {rubric.sampleQuestions.map((q) => <option key={q.id} value={q.id}>{q.text}</option>)}
            </select>
          ) : (
            <Textarea aria-label={t('admin.rubrics.preview.questionCustom')} value={customQuestion} rows={2} onChange={(event) => setCustomQuestion(event.target.value)} placeholder={t('admin.rubrics.preview.questionPlaceholder')} />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="rubric-preview-seniority">{t('admin.rubrics.preview.seniority')}</Label>
          <select id="rubric-preview-seniority" value={seniority} onChange={(event) => setSeniority(event.target.value)} className={SELECT_CLASS}>
            <option value="">{t('admin.rubrics.preview.seniorityAny')}</option>
            {SENIORITIES.map((level) => <option key={level} value={level}>{t(`admin.rubrics.seniority.${level}`)}</option>)}
          </select>
          <Label htmlFor="rubric-preview-custom-answer">{t('admin.rubrics.preview.customAnswer')}</Label>
          <Textarea id="rubric-preview-custom-answer" value={customAnswer} rows={2} onChange={(event) => setCustomAnswer(event.target.value)} placeholder={t('admin.rubrics.preview.customAnswerHint')} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={run} disabled={!canRun} loading={preview.isPending}>{t('admin.rubrics.preview.run')}</Button>
        {preview.isPending ? <span className="text-sm text-muted-foreground" role="status">{t('admin.rubrics.preview.running')}</span> : null}
      </div>
      {preview.isError ? <Alert variant="error"><AlertDescription>{t(errorKey())} {getApiErrorMessage(preview.error, '')}</AlertDescription></Alert> : null}

      {viewing ? (
        <RubricPreviewResult
          run={toEmployerPreviewRun(viewing)}
          runNumber={runNumberOf(employerRuns, viewing.id) || runs.length + 1}
          passScorePct={null}
          onRerun={canRun ? run : undefined}
          onBackToLatest={latest && viewing.id !== latest.id ? () => setViewingId(null) : undefined}
          dimmed={preview.isPending}
        />
      ) : null}
      {latest ? (
        <RubricPreviewHistory runs={employerRuns} latest={toEmployerPreviewRun(latest)} viewingId={viewing?.id ?? latest.id} isLoading={history.isLoading} onOpen={setViewingId} />
      ) : null}
    </section>
  );
}
