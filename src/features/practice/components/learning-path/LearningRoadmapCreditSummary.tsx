import { useLanguage } from '@/shared/languages';

interface LearningRoadmapCreditSummaryProps {
  remainingLessons: number;
  balance: number;
}

export function LearningRoadmapCreditSummary({ remainingLessons, balance }: LearningRoadmapCreditSummaryProps) {
  const { t } = useLanguage();

  return (
    <dl className="relative grid max-w-2xl gap-3 text-sm sm:grid-cols-2">
      <div className="frame-satin-soft rounded-xl bg-surface-overlay/70 px-4 py-3">
        <dt className="text-muted-foreground">{t('practice.learningPath.roadmapCreditsNeeded')}</dt>
        <dd className="mt-1 font-semibold text-foreground">
          {remainingLessons.toLocaleString()} · {t('practice.learningPath.creditsUnit')}
        </dd>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('practice.learningPath.remainingLessons').replace('{count}', String(remainingLessons))}
        </p>
      </div>
      <div className="frame-satin-soft rounded-xl bg-surface-overlay/70 px-4 py-3">
        <dt className="text-muted-foreground">{t('practice.learningPath.currentBalance')}</dt>
        <dd className="mt-1 font-semibold text-foreground">
          {balance.toLocaleString()} · {t('practice.learningPath.creditsUnit')}
        </dd>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('practice.learningPath.creditCostPerLesson').replace('{cost}', '1')}
        </p>
      </div>
    </dl>
  );
}
