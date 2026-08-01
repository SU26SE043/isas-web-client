import { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Clock3,
  MessageSquareText,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { QuestionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { getQuestionStatusGroup } from '../../utils/practiceSessionResultFormat';
import { QuestionCriteriaPanel } from './QuestionCriteriaPanel';
import { SampleAnswerCard } from './SampleAnswerCard';
import { SpeechMetricsPanel } from './SpeechMetricsPanel';

const statusClass = {
  graded: 'border-success/30 bg-success/10 text-success-light',
  answered: 'border-info/30 bg-info/10 text-info',
  skipped: 'border-subtle bg-surface-overlay text-muted-foreground',
  processing: 'border-warning/30 bg-warning/10 text-warning',
  failed: 'border-destructive/30 bg-destructive/10 text-destructive',
  unknown: 'border-subtle bg-surface-overlay text-muted-foreground',
} as const;

export function PracticeQuestionResultCard({
  question,
  defaultOpen = true,
}: {
  question: QuestionResultViewModel;
  defaultOpen?: boolean;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(defaultOpen);
  const group = getQuestionStatusGroup(question.status, question.answered);
  const statusLabel =
    group === 'unknown'
      ? question.status || t('practice.result.questionStatus.unknown')
      : t(`practice.result.questionStatus.${group}`);

  return (
    <article className="frame-satin overflow-hidden rounded-2xl border border-satin bg-surface-raised">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-satin px-5 py-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">
            {t('practice.result.question')} {question.orderNo}
          </h3>
          {question.timeLimitSec != null ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-info/20 bg-info/10 px-2.5 py-1 text-xs font-medium text-info-light">
              <Clock3 className="size-3.5" aria-hidden />
              {question.timeLimitSec}s
            </span>
          ) : null}
          {question.isClarify ? (
            <Badge variant="outline" className="border-info/30 bg-info/10 text-info">
              <Sparkles className="mr-1 size-3" aria-hidden />
              {t('practice.result.aiClarify')}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn('font-semibold', statusClass[group])}>
            {group === 'graded' ? <CheckCircle2 className="mr-1 size-3.5" aria-hidden /> : null}
            {statusLabel}
          </Badge>
          <button
            type="button"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
            aria-expanded={open}
            aria-label={t(open ? 'practice.result.collapseQuestion' : 'practice.result.expandQuestion')}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <ChevronUp size={22} absoluteStrokeWidth strokeWidth={2.5} aria-hidden />
            ) : (
              <ChevronDown size={22} absoluteStrokeWidth strokeWidth={2.5} aria-hidden />
            )}
          </button>
        </div>
      </header>

      {open ? (
        <div className="space-y-4 p-5">
          <section className="rounded-xl border border-satin p-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-info-light">
              <span className="inline-flex size-7 items-center justify-center rounded-lg border border-info/25 bg-info/10">
                <CircleHelp className="size-4" aria-hidden />
              </span>
              {t('practice.result.question')}
            </h4>
            <p className="mt-3 whitespace-pre-wrap font-medium leading-relaxed text-foreground">
              {question.content || t('practice.result.unknownQuestion')}
            </p>
          </section>

          <section className="rounded-xl bg-surface-overlay p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--chart-cat-6)]">
                <span className="inline-flex size-7 items-center justify-center rounded-lg border border-[color:var(--chart-cat-6)]/25 bg-[color:var(--chart-cat-6)]/10">
                  <MessageSquareText className="size-4" aria-hidden />
                </span>
                {question.transcript
                  ? t('practice.result.transcriptLabel')
                  : t('practice.result.textAnswerLabel')}
              </h4>
              {question.durationSec != null ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" aria-hidden />
                  {t('practice.result.answerDuration').replace(
                    '{{n}}',
                    String(question.durationSec),
                  )}
                </span>
              ) : null}
            </div>
            {question.transcript || question.textAnswer ? (
              <p className="mt-3 whitespace-pre-wrap font-medium leading-relaxed text-foreground">
                {question.transcript || question.textAnswer}
              </p>
            ) : (
              <div className="mt-3">
                <p className="font-medium text-foreground">{t('practice.result.skippedAnswer')}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('practice.result.skippedAnswerDescription')}
                </p>
              </div>
            )}
            {question.audioUrl ? (
              <audio className="mt-4 w-full" controls preload="metadata" src={question.audioUrl}>
                {t('practice.result.audioUnsupported')}
              </audio>
            ) : null}
          </section>

          <div className="grid items-start gap-4 lg:grid-cols-2">
            {question.criteria.length ? (
              <QuestionCriteriaPanel
                criteria={question.criteria}
                score={question.score}
                maxScore={question.maxScore}
              />
            ) : question.skipped ? null : (
              <p className="text-sm text-muted-foreground">{t('practice.result.noQuestionRubric')}</p>
            )}

            {question.speakingMetrics || question.suggestedAnswer ? (
              <div className="space-y-4">
                {question.speakingMetrics ? (
                  <SpeechMetricsPanel metrics={question.speakingMetrics} />
                ) : null}
                {question.suggestedAnswer ? (
                  <SampleAnswerCard content={question.suggestedAnswer} />
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="px-5 py-3">
          <p className="line-clamp-2 text-sm font-medium text-foreground/80">
            {question.content || t('practice.result.unknownQuestion')}
          </p>
        </div>
      )}
    </article>
  );
}
