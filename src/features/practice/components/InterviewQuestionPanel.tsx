import { Clock } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import { formatTimerSeconds, getTimerColorClass, getTimerSeverity } from '../utils/questionTimer';
import { numberQuestions } from '../utils/questionNumbering';
import type { PracticeQuestionResponse, QuestionAnswerState } from '../types/b2cPracticeSession.types';

interface InterviewQuestionPanelProps {
  /** Vị trí trong mảng của câu đang hiện — tô đậm vòng tròn stepper. */
  currentIndex: number;
  /** Chỉ dùng khi chưa có `questions` (dựng vòng tròn rỗng). */
  totalQuestions: number;
  remainingSeconds: number;
  question?: PracticeQuestionResponse | null;
  questionStates?: Record<string, QuestionAnswerState>;
  questions?: PracticeQuestionResponse[];
  showWarning?: boolean;
  nextActionLabel?: string | null;
  speechStatus?: string | null;
  isTimingOut?: boolean;
  hasNextQuestion?: boolean;
}

export function InterviewQuestionPanel({
  currentIndex,
  totalQuestions,
  remainingSeconds,
  question,
  questionStates,
  questions,
  showWarning,
  nextActionLabel,
  speechStatus,
  isTimingOut,
  hasNextQuestion,
}: InterviewQuestionPanelProps) {
  const { t } = useLanguage();
  const timerClass = getTimerColorClass(getTimerSeverity(remainingSeconds));
  const steps = questions?.length
    ? questions
    : Array.from({ length: Math.max(totalQuestions, 1) }, () => null);
  // Số hiệu PHÂN CẤP (1 · 1.1 · 1.2 · 2 · 2.1 …) tính từ `kind` + thứ tự mảng — nhãn "Câu hỏi N / M" và vòng
  // tròn stepper đọc CÙNG map này; mẫu số = số câu GỐC (không phình khi câu đào sâu về). Xem `questionNumbering`.
  const numbering = numberQuestions(questions ?? []);
  const labelOf = (id: string | undefined, index: number) => (id && numbering.labels.get(id)) || String(index + 1);
  const total = numbering.rootCount || Math.max(totalQuestions, steps.length, 1);

  return (
    <section
      className="frame-satin flex h-full flex-col gap-5 rounded-2xl bg-surface-raised p-5 shadow-[var(--satin-inset)] sm:p-6"
      aria-label={t('practice.room.progressLabel')}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {t('practice.room.questionOf')
              .replace('{current}', labelOf(question?.id, currentIndex))
              .replace('{total}', String(total))}
          </p>
          {question?.kind ? (
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{question.kind}</p>
          ) : null}
          {nextActionLabel ? (
            <p className="text-xs font-medium text-foreground">{nextActionLabel}</p>
          ) : null}
          <h2 className="text-lg font-semibold leading-relaxed text-foreground whitespace-normal [overflow-wrap:anywhere]">
            {question?.content ?? t('practice.room.waitingQuestion')}
          </h2>
          {speechStatus ? <p className="text-sm text-muted-foreground">{speechStatus}</p> : null}
        </div>

        <div
          className={cn(
            'frame-satin-soft flex shrink-0 items-center gap-3 self-start rounded-xl bg-surface-overlay/60 px-4 py-3',
            remainingSeconds <= 10 && 'border border-warning/50',
          )}
        >
          <Clock className="size-5 text-muted-foreground" aria-hidden />
          <div>
            <p
              className={cn('text-2xl font-semibold tabular-nums tracking-wide', timerClass)}
              aria-live={remainingSeconds === 60 || remainingSeconds === 30 || remainingSeconds === 10 || remainingSeconds === 0 ? 'polite' : 'off'}
            >
              {formatTimerSeconds(remainingSeconds)}
            </p>
            <p className="text-[11px] text-muted-foreground">{t('practice.timer.answerTime')}</p>
          </div>
        </div>
      </div>

      {showWarning ? (
        <p className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning" role="alert">
          {t('practice.timer.warning')}
        </p>
      ) : null}

      {remainingSeconds === 0 ? (
        <p className="text-sm text-error" role="status">
          {t('practice.timer.expired')}
        </p>
      ) : null}
      {isTimingOut ? (
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {t(hasNextQuestion === false ? 'practice.timer.readyToFinish' : 'practice.timer.autoAdvance')}
        </p>
      ) : null}

      <ol className="flex flex-wrap items-center justify-center gap-0 pt-1" aria-label={t('practice.room.progressLabel')}>
        {steps.map((item, index) => {
          const qid = item?.id;
          const step = labelOf(qid, index);
          const isActive = index === currentIndex;
          const state = qid && questionStates ? questionStates[qid] : undefined;
          const isSubmitted = state === 'submitted' || (!state && index < currentIndex);
          const isUnanswered = state === 'unanswered';
          const label =
            state === 'submitted'
              ? t('practice.recording.submitted')
              : state === 'unanswered'
                ? t('practice.recording.unanswered')
                : isActive
                  ? t('practice.recording.recording')
                  : t('practice.recording.idle');
          return (
            <li key={qid ?? step} className="flex items-center">
              {index > 0 ? (
                <span className="mx-1 h-px w-6 border-t border-dashed border-satin sm:w-10" aria-hidden />
              ) : null}
              <span
                className={cn(
                  'flex h-8 min-w-8 items-center justify-center rounded-full border px-1.5 text-xs font-semibold tabular-nums',
                  isActive && 'border-white bg-white text-black',
                  isSubmitted && !isActive && 'border-success/50 bg-success/15 text-success',
                  isUnanswered && !isActive && 'border-error/50 bg-error/10 text-error',
                  !isActive && !isSubmitted && !isUnanswered && 'border-satin bg-transparent text-muted-foreground',
                )}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${t('practice.room.questionOf').replace('{current}', step).replace('{total}', String(total))}: ${label}`}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
