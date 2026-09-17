import { Pencil, Scale } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PracticeJobCategory, PracticeSeniority } from '../../types/b2cPracticeSession.types';
import type { PracticeRubricCriterion } from '../../types/practiceSetup.types';
import { PracticeSessionTopics } from '../PracticeSessionTopics';

interface PracticeSummaryCriteriaSectionProps {
  jobCategory: PracticeJobCategory | null;
  seniority: PracticeSeniority | null;
  criteria: PracticeRubricCriterion[];
  isCreating: boolean;
  onEditCriteria: () => void;
}

/** Extracted from `PracticeSetupSummaryStep` to stay under the 250-line UI file cap. */
export function PracticeSummaryCriteriaSection({
  jobCategory,
  seniority,
  criteria,
  isCreating,
  onEditCriteria,
}: PracticeSummaryCriteriaSectionProps) {
  const { t } = useLanguage();

  return (
    <section className="mt-5 rounded-2xl border border-info/30 bg-info/5 p-4" aria-labelledby="practice-summary-criteria">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-info/30 bg-info/10 text-info-light">
            <Scale className="size-4" aria-hidden />
          </span>
          <div>
            <h3 id="practice-summary-criteria" className="font-semibold text-foreground">
              {t('practice.setup.summary.gradingCriteria')}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('practice.setup.summary.criteriaCount').replace('{count}', String(criteria.length))}
            </p>
          </div>
        </div>
        <button type="button" className="btn-ghost inline-flex items-center gap-1.5 text-xs" onClick={onEditCriteria} disabled={isCreating}>
          <Pencil className="size-3.5" aria-hidden />
          {t('practice.setup.summary.editCriteria')}
        </button>
      </div>
      <ul className="mt-3 space-y-2 border-t border-info/15 pt-3">
        {criteria.map((criterion) => (
          <li key={criterion.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-foreground">{criterion.name}</span>
            <span className="shrink-0 font-semibold text-info-light">{criterion.weight}%</span>
          </li>
        ))}
      </ul>
      {jobCategory ? (
        <div className="mt-3 border-t border-info/15 pt-3">
          <PracticeSessionTopics
            topics={null}
            jobCategory={jobCategory}
            seniority={seniority}
            variant="compact"
          />
        </div>
      ) : null}
    </section>
  );
}
