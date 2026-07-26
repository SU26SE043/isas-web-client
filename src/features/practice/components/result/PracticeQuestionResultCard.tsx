import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { QuestionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { getQuestionStatusGroup } from '../../utils/practiceSessionResultFormat';
import { SampleAnswerCard } from './SampleAnswerCard';
import { SpeechMetricsPanel } from './SpeechMetricsPanel';

const statusClass = {
  graded: 'border-subtle bg-surface-overlay text-muted-foreground',
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
    <article
      id={`question-${question.orderNo}`}
      className="frame-satin scroll-mt-24 overflow-hidden rounded-2xl border border-satin bg-surface-raised"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-satin px-5 py-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">
            {t('practice.result.question')} {question.orderNo}
            {question.timeLimitSec != null ? ` · ${question.timeLimitSec}s` : ''}
          </h3>
          {question.isClarify ? (
            <Badge variant="outline" className="border-info/30 bg-info/10 text-info">
              <Sparkles className="mr-1 size-3" aria-hidden />
              {t('practice.result.aiClarify')}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn(statusClass[group])}>
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
        <div className="space-y-6 p-5">
          <p className="whitespace-pre-wrap leading-relaxed text-foreground">
            {question.content || t('practice.result.unknownQuestion')}
          </p>

          <div className="rounded-xl bg-surface-overlay p-4">
            {question.transcript || question.textAnswer ? (
              <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                <span className="font-semibold text-muted-foreground">
                  {question.transcript
                    ? t('practice.result.transcriptLabel')
                    : t('practice.result.textAnswerLabel')}{' '}
                </span>
                {question.transcript || question.textAnswer}
              </p>
            ) : (
              <div>
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
          </div>

          {question.criteria.length ? (
            <section className="divide-y divide-satin">
              {question.criteria.map((criterion) => (
                <div key={criterion.name} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-semibold text-foreground">{criterion.name}</h4>
                    <span className="shrink-0 font-semibold tabular-nums text-foreground">
                      {Number.isInteger(criterion.score)
                        ? criterion.score
                        : criterion.score.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {criterion.comment || t('practice.result.noCriterionComment')}
                  </p>
                </div>
              ))}
            </section>
          ) : question.skipped ? null : (
            <p className="text-sm text-muted-foreground">{t('practice.result.noQuestionRubric')}</p>
          )}

          {question.speakingMetrics ? (
            <SpeechMetricsPanel metrics={question.speakingMetrics} />
          ) : null}

          {question.suggestedAnswer ? (
            <SampleAnswerCard content={question.suggestedAnswer} />
          ) : null}
        </div>
      ) : (
        <div className="px-5 py-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {question.content || t('practice.result.unknownQuestion')}
          </p>
        </div>
      )}
    </article>
  );
}
