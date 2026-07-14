import React from 'react';
import { Clock } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import { formatTimerSeconds, getTimerColorClass, getTimerSeverity } from '../utils/questionTimer';

interface InterviewQuestionPanelProps {
  questionText: string;
  currentIndex: number;
  totalQuestions: number;
  remainingSeconds: number;
  hint?: string;
}

export const InterviewQuestionPanel: React.FC<InterviewQuestionPanelProps> = ({
  questionText,
  currentIndex,
  totalQuestions,
  remainingSeconds,
  hint,
}) => {
  const { t } = useLanguage();
  const current = currentIndex + 1;
  const timerClass = getTimerColorClass(getTimerSeverity(remainingSeconds));
  const progressLabel = t('practice.room.questionOf')
    .replace('{current}', String(current))
    .replace('{total}', String(Math.max(totalQuestions, 1)));

  return (
    <section
      className="frame-satin flex flex-col gap-5 rounded-2xl bg-surface-raised p-5 shadow-[var(--satin-inset)] sm:p-6"
      aria-labelledby="interview-question-heading"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-black"
              aria-hidden
            >
              AI
            </span>
            <p className="text-sm text-muted-foreground">{progressLabel}</p>
          </div>

          <h2
            id="interview-question-heading"
            className="text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl"
          >
            {questionText}
          </h2>

          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground/80">{t('practice.room.hintLabel')}: </span>
            {hint ?? t('practice.room.questionHint')}
          </p>
        </div>

        <div className="frame-satin-soft flex shrink-0 items-center gap-3 self-start rounded-xl bg-surface-overlay/60 px-4 py-3">
          <Clock className="size-5 text-muted-foreground" aria-hidden />
          <div>
            <p className={cn('text-2xl font-semibold tabular-nums tracking-wide', timerClass)}>
              {formatTimerSeconds(remainingSeconds)}
            </p>
            <p className="text-[11px] text-muted-foreground">{t('practice.room.answerTime')}</p>
          </div>
        </div>
      </div>

      <ol
        className="flex items-center justify-center gap-0 pt-1"
        aria-label={t('practice.room.progressLabel')}
      >
        {Array.from({ length: Math.max(totalQuestions, 1) }, (_, index) => {
          const step = index + 1;
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;
          return (
            <li key={step} className="flex items-center">
              {index > 0 ? (
                <span
                  className="mx-1 h-px w-6 border-t border-dashed border-satin sm:w-10"
                  aria-hidden
                />
              ) : null}
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-full border text-xs font-semibold',
                  isActive && 'border-white bg-white text-black',
                  isDone && !isActive && 'border-satin bg-surface-elevated text-foreground',
                  !isActive && !isDone && 'border-satin bg-transparent text-muted-foreground',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
