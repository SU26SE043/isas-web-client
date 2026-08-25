import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/shared/languages';
import type { ApiLessonMistake } from '../../types/roadmap.api.types';

const ANSWER_PREVIEW_LIMIT = 140;

export function truncateAtWordBoundary(value: string, limit = ANSWER_PREVIEW_LIMIT): string {
  if (value.length <= limit) return value;
  const preview = value.slice(0, limit);
  const boundary = preview.lastIndexOf(' ');
  const end = boundary > 0 ? boundary : limit;
  return `${value.slice(0, end).trimEnd()}…`;
}

type LessonMistakeReviewProps = {
  mistakes?: ApiLessonMistake[] | null;
};

function MistakeText({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">{label}</p>
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-text-primary">{value}</p>
    </div>
  );
}

function ToggleButton({ expanded, label, onClick }: { expanded: boolean; label: string; onClick: () => void }) {
  const Icon = expanded ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-satin px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      aria-expanded={expanded}
      onClick={onClick}
    >
      {label}
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}

function MistakeItem({ mistake, index }: { mistake: ApiLessonMistake; index: number }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(index === 0);
  const [answerExpanded, setAnswerExpanded] = useState(false);
  const [sampleExpanded, setSampleExpanded] = useState(false);
  const criterion = mistake.criterionName || t('practice.learningPath.mistakes.untitled');
  const answerIsLong = Boolean(mistake.answer && mistake.answer.length > ANSWER_PREVIEW_LIMIT);
  const displayedAnswer = answerExpanded ? mistake.answer : truncateAtWordBoundary(mistake.answer);

  return (
    <article className="overflow-hidden rounded-xl border border-satin bg-surface-raised">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus sm:px-5"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-text-primary">{criterion}</span>
          <span className="mt-1 block text-xs text-text-secondary">
            {t('practice.learningPath.mistakes.score').replace('{score}', String(mistake.scorePct ?? 0))}
          </span>
        </span>
        {expanded ? <ChevronUp className="mt-0.5 size-5 shrink-0 text-text-secondary" aria-hidden="true" /> : <ChevronDown className="mt-0.5 size-5 shrink-0 text-text-secondary" aria-hidden="true" />}
      </button>

      {expanded ? (
        <div className="space-y-5 border-t border-satin px-4 py-5 sm:px-5">
          <MistakeText label={t('practice.learningPath.mistakes.question')} value={mistake.question} />
          {mistake.answer ? (
            <div className="space-y-2">
              <MistakeText label={t('practice.learningPath.mistakes.answer')} value={displayedAnswer} />
              {answerIsLong ? (
                <ToggleButton
                  expanded={answerExpanded}
                  label={t(answerExpanded ? 'practice.learningPath.mistakes.hideFullAnswer' : 'practice.learningPath.mistakes.showFullAnswer')}
                  onClick={() => setAnswerExpanded((current) => !current)}
                />
              ) : null}
            </div>
          ) : null}
          <MistakeText label={t('practice.learningPath.mistakes.whatWentWrong')} value={mistake.whatWentWrong} />
          <MistakeText label={t('practice.learningPath.mistakes.howToFixIt')} value={mistake.howToFixIt} />
          {mistake.sampleAnswer ? (
            <div className="space-y-2 rounded-lg border border-satin bg-surface-overlay p-4">
              <MistakeText
                label={t('practice.learningPath.mistakes.sampleAnswer')}
                value={sampleExpanded ? mistake.sampleAnswer : truncateAtWordBoundary(mistake.sampleAnswer)}
              />
              {mistake.sampleAnswer.length > ANSWER_PREVIEW_LIMIT ? (
                <ToggleButton
                  expanded={sampleExpanded}
                  label={t(sampleExpanded ? 'practice.learningPath.mistakes.hideSampleAnswer' : 'practice.learningPath.mistakes.showSampleAnswer')}
                  onClick={() => setSampleExpanded((current) => !current)}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function LessonMistakeReview({ mistakes }: LessonMistakeReviewProps) {
  const { t } = useLanguage();
  if (!Array.isArray(mistakes) || mistakes.length === 0) return null;

  return (
    <section className="space-y-3" aria-label={t('practice.learningPath.mistakes.sectionLabel')}>
      <div>
        <p className="text-base font-semibold text-text-primary">{t('practice.learningPath.mistakes.title')}</p>
        <p className="mt-1 text-sm leading-6 text-text-secondary">{t('practice.learningPath.mistakes.description')}</p>
      </div>
      <div className="space-y-3">
        {mistakes.map((mistake, index) => (
          <MistakeItem key={mistake.id} mistake={mistake} index={index} />
        ))}
      </div>
    </section>
  );
}
