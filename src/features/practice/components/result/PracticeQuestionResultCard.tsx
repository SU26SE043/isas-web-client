import { useState } from 'react';
import { AudioLines, ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { PracticeAnswerReview } from '../../types/b2cPracticeSession.types';

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export function PracticeQuestionResultCard({
  answer,
  fallbackOrder,
  timeLimitSec,
  defaultOpen = false,
}: {
  answer: PracticeAnswerReview;
  fallbackOrder: number;
  timeLimitSec?: number;
  defaultOpen?: boolean;
}) {
  const { t } = useLanguage();
  const metrics = answer.speakingMetrics;
  const [open, setOpen] = useState(defaultOpen);
  const questionScore = answer.criteriaScores?.reduce((sum, item) => sum + item.score, 0);
  const questionMax = answer.criteriaScores?.reduce(
    (sum, item) => sum + (item.maxScore ?? 0),
    0,
  );

  return (
    <article
      id={`question-${answer.orderNo ?? fallbackOrder}`}
      className="frame-satin scroll-mt-24 overflow-hidden rounded-2xl border border-satin bg-surface-raised"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-satin p-5">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {t('practice.result.question')} {answer.orderNo ?? fallbackOrder}
            </h3>
            {timeLimitSec ? (
              <span className="text-sm text-muted-foreground">· {timeLimitSec}s</span>
            ) : null}
          </div>
          <p className="max-w-4xl leading-relaxed text-foreground">
            {answer.content || answer.questionId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {questionScore != null && questionMax ? (
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {questionScore}/{questionMax}
            </span>
          ) : null}
          {answer.status ? (
            <span className="rounded-full border border-success/30 bg-success-bg px-3 py-1 text-xs font-medium text-success-light">
              {answer.status}
            </span>
          ) : null}
          <button
            type="button"
            className="btn-ghost size-9 p-0"
            aria-expanded={open}
            aria-label={t(open ? 'practice.result.collapseQuestion' : 'practice.result.expandQuestion')}
            onClick={() => setOpen((value) => !value)}
          >
            <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
          </button>
        </div>
      </header>

      {open ? <div className="space-y-6 p-5">
        <div className="rounded-xl bg-surface-overlay p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('practice.result.transcript')}
          </p>
          {answer.transcript || answer.textAnswer ? (
            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-foreground">
              {answer.transcript || answer.textAnswer}
            </p>
          ) : (
            <div className="mt-2">
              <p className="font-medium text-foreground">{t('practice.result.skippedAnswer')}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('practice.result.skippedAnswerDescription')}
              </p>
            </div>
          )}
          {answer.audioUrl ? (
            <audio className="mt-4 w-full" controls preload="metadata" src={answer.audioUrl}>
              {t('practice.result.audioUnsupported')}
            </audio>
          ) : null}
        </div>

        {answer.criteriaScores?.length ? (
          <section className="divide-y divide-satin">
            {answer.criteriaScores.map((criterion) => (
              <div key={criterion.name} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-medium text-foreground">{criterion.name}</h4>
                  <span className="font-semibold tabular-nums text-foreground">
                    {criterion.score}
                    {criterion.maxScore != null ? `/${criterion.maxScore}` : ''}
                  </span>
                </div>
                {criterion.comment ? (
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {criterion.comment}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('practice.result.noCriterionComment')}
                  </p>
                )}
                {criterion.maxScore ? (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-highlight">
                    <div
                      className="h-full rounded-full bg-info"
                      style={{
                        width: `${Math.max(0, Math.min(100, (criterion.score / criterion.maxScore) * 100))}%`,
                      }}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </section>
        ) : null}

        {metrics ? (
          <section className="rounded-xl border border-satin bg-surface-overlay p-4">
            <h4 className="flex items-center gap-2 font-semibold text-foreground">
              <AudioLines className="size-4 text-info" aria-hidden />
              {t('practice.result.speakingMetrics')}
            </h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Metric label={t('practice.result.speechRate')} value={metrics.speechRate == null ? '—' : String(metrics.speechRate)} />
              <Metric label={t('practice.result.longestPause')} value={metrics.longestPauseSec == null ? '—' : `${metrics.longestPauseSec}s`} />
              <Metric label={t('practice.result.hesitations')} value={metrics.hesitationCount == null ? '—' : String(metrics.hesitationCount)} />
              <Metric label={t('practice.result.silenceRatio')} value={metrics.silenceRatio == null ? '—' : `${metrics.silenceRatio}%`} />
              <Metric label={t('practice.result.fillerWords')} value={metrics.fillerWordCount == null ? '—' : String(metrics.fillerWordCount)} />
              {metrics.audioDurationSec != null ? (
                <Metric label={t('practice.result.audioDuration')} value={`${metrics.audioDurationSec}s`} />
              ) : null}
              {metrics.wordCount != null ? (
                <Metric label={t('practice.result.wordCount')} value={String(metrics.wordCount)} />
              ) : null}
            </div>
            {metrics.referenceText ? (
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                {metrics.referenceText}
              </p>
            ) : null}
          </section>
        ) : null}

        {answer.suggestedAnswer ? (
          <section className="rounded-xl border border-info/30 bg-info-bg p-4">
            <h4 className="flex items-center gap-2 font-semibold text-info-light">
              <Sparkles className="size-4" aria-hidden />
              {t('practice.result.suggestedAnswer')}
            </h4>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-foreground">
              {answer.suggestedAnswer}
            </p>
          </section>
        ) : null}
      </div> : null}
    </article>
  );
}
