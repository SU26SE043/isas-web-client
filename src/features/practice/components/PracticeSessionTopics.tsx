import { useLanguage } from '@/shared/languages';
import type {
  PracticeJobCategory,
  PracticeSeniority,
  PracticeSessionTopic,
} from '../types/b2cPracticeSession.types';

type PracticeSessionTopicsVariant = 'full' | 'compact';

export interface PracticeSessionTopicsProps {
  topics?: PracticeSessionTopic[] | null;
  /** Wizard preview source: the session has no catalog until it is created. */
  jobCategory?: PracticeJobCategory | null;
  seniority?: PracticeSeniority | null;
  variant: PracticeSessionTopicsVariant;
}

const SENIORITY_KEYS: Record<PracticeSeniority, string> = {
  Fresher: 'practice.wizard.level.fresher',
  Junior: 'practice.wizard.level.junior',
  Middle: 'practice.wizard.level.middle',
  Senior: 'practice.wizard.level.senior',
};

const CATEGORY_KEYS: Record<PracticeJobCategory, string> = {
  FE: 'practice.setup.jobCategory.FE',
  BE: 'practice.setup.jobCategory.BE',
  BA: 'practice.setup.jobCategory.BA',
};

function getCategoryFromTopicKey(topicKey: string | undefined): PracticeJobCategory | null {
  const category = topicKey?.split('.')[0]?.toUpperCase();
  return category === 'FE' || category === 'BE' || category === 'BA' ? category : null;
}

export function PracticeSessionTopics({
  topics,
  jobCategory,
  seniority,
  variant,
}: PracticeSessionTopicsProps) {
  const { t } = useLanguage();

  const canRenderCompactPreview = variant === 'compact' && Boolean(jobCategory);
  if (!topics?.length && !canRenderCompactPreview) return null;

  const level = seniority ?? 'Junior';
  const levelLabel = t(SENIORITY_KEYS[level]);
  const category = jobCategory ?? getCategoryFromTopicKey(topics?.[0]?.key);
  const categoryLabel = category ? t(CATEGORY_KEYS[category]) : t('practice.topics.genericCategory');

  if (variant === 'compact') {
    return (
      <p
        className="text-sm leading-6 text-muted-foreground"
        data-variant="compact"
        data-testid="practice-session-topics-compact"
      >
        {t('practice.topics.compact')
          .replace('{category}', categoryLabel)
          .replace('{seniority}', levelLabel)}
      </p>
    );
  }

  return (
    <section
      className="frame-satin rounded-2xl bg-surface-raised p-4 sm:p-5"
      aria-labelledby="practice-session-topics-title"
      data-variant="full"
    >
      <div className="flex flex-col gap-1">
        <h2 id="practice-session-topics-title" className="text-base font-semibold text-foreground">
          {t('practice.topics.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('practice.topics.level').replace('{seniority}', levelLabel)}
        </p>
      </div>

      <ol
        className="mt-4 grid gap-2.5 sm:grid-cols-2"
        aria-label={t('practice.topics.listLabel')}
      >
        {(topics ?? []).map((topic, index) => (
          <li
            key={topic.key}
            className="flex min-w-0 items-start gap-3 rounded-xl border border-satin/70 bg-surface-overlay px-3 py-3"
          >
            <span
              className="grid size-6 shrink-0 place-items-center rounded-full border border-satin bg-surface-elevated text-xs font-semibold text-foreground"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <span className="min-w-0 break-words text-sm leading-5 text-foreground">{topic.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
