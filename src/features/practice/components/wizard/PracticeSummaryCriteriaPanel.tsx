import { HelpCircle, Pencil, Scale } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PracticeJobCategory, PracticeSeniority } from '../../types/b2cPracticeSession.types';
import type { PracticeRubricCriterion } from '../../types/practiceSetup.types';
import { PracticeSessionTopics } from '../PracticeSessionTopics';

export function PracticeSummaryCriteriaPanel({ jobCategory, seniority, criteria, isCreating, onEditCriteria }: {
  jobCategory: PracticeJobCategory | null;
  seniority: PracticeSeniority | null;
  criteria: PracticeRubricCriterion[];
  isCreating: boolean;
  onEditCriteria: () => void;
}) {
  const { t } = useLanguage();
  return (
    <section className="rounded-2xl border border-info/25 bg-info/[0.045] p-4 sm:p-5" aria-labelledby="practice-summary-criteria">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-info/15 text-info-light ring-1 ring-info/20"><Scale className="size-4" aria-hidden /></span>
          <div>
            <h3 id="practice-summary-criteria" className="font-semibold text-foreground">{t('practice.setup.summary.gradingCriteria')}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{t('practice.setup.summary.criteriaCount').replace('{count}', String(criteria.length))}</p>
          </div>
        </div>
        <button type="button" className="btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-xs" onClick={onEditCriteria} disabled={isCreating}><Pencil className="size-3.5" aria-hidden />{t('practice.setup.summary.editCriteria')}</button>
      </div>
      <ul className="mt-4 space-y-2.5 border-t border-info/15 pt-4">
        {criteria.map((criterion) => (
          <li key={criterion.id} className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_2.5rem] items-center gap-3 text-xs sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_2.5rem] sm:text-sm">
            <span className="truncate font-medium text-foreground">{criterion.name}</span>
            <span className="h-2 overflow-hidden rounded-full bg-surface-elevated"><span className="block h-full rounded-full bg-info" style={{ width: `${Math.max(0, Math.min(100, criterion.weight))}%` }} /></span>
            <span className="text-right font-semibold tabular-nums text-info-light">{criterion.weight}%</span>
          </li>
        ))}
      </ul>
      {jobCategory ? <div className="mt-4 flex items-start gap-2 rounded-xl border border-info/30 bg-info/5 px-3 py-2.5 text-xs leading-5 text-info-light"><HelpCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden /><PracticeSessionTopics topics={null} jobCategory={jobCategory} seniority={seniority} variant="compact" /></div> : null}
    </section>
  );
}
