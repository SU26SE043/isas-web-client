import { ChartNoAxesCombined, Info, List } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { CriteriaProgressList, CriteriaThresholdNote } from './CriteriaProgressList';
import { CriteriaRadarChart } from './CriteriaRadarChart';
import type { UnassessedCriteriaResult } from '../../utils/unassessedCriteria';

export function ReportCriteriaScores({
  view,
  unassessedCriteria,
}: {
  view: PracticeSessionResultViewModel;
  unassessedCriteria: UnassessedCriteriaResult;
}) {
  const { t } = useLanguage();

  return (
    <section className="space-y-5" aria-labelledby="report-criteria-heading">
      <div className="frame-satin overflow-hidden rounded-2xl border border-satin bg-surface-raised">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-chart-cat-1/10 text-chart-cat-1">
              <ChartNoAxesCombined className="size-5" aria-hidden />
            </span>
            <h2 id="report-criteria-heading" className="text-lg font-semibold text-foreground">
              {t('practice.result.criteriaScores')}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-chart-cat-1" aria-hidden />
              {t('practice.result.radarYourScore')}
            </span>
            {view.passThresholdPct != null ? (
              <span className="inline-flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-chart-cat-3" aria-hidden />
                {t('practice.result.radarThreshold')}
                <span className="rounded bg-surface-elevated px-1.5 py-0.5 tabular-nums text-foreground">
                  {Math.round(view.passThresholdPct)}%
                </span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] lg:gap-5 lg:p-6">
          <div className="frame-satin-soft rounded-xl bg-surface-base/60 p-4 sm:p-5">
            <div className="mb-1 flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
              <ChartNoAxesCombined className="size-4 text-chart-cat-1" aria-hidden />
              {t('practice.result.skillOverview')}
            </div>
            <CriteriaRadarChart
              criteria={view.criteria}
              passThresholdPct={view.passThresholdPct}
              benchmark={view.benchmark}
            />
            <CriteriaThresholdNote
              passThresholdPct={view.passThresholdPct}
              note={view.passThresholdNote}
            />
          </div>

          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <List className="size-4 text-chart-cat-1" aria-hidden />
              {t('practice.result.criteriaDetail')}
            </div>
            <CriteriaProgressList
              criteria={view.criteria}
              passThresholdPct={view.passThresholdPct}
            />
            {unassessedCriteria.status === 'known' && unassessedCriteria.names.length > 0 ? (
              <div className="mt-4 rounded-xl border border-info/30 bg-info/5 p-4 text-sm text-foreground" role="status">
                <p className="flex items-start gap-2 font-medium">
                  <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
                  <span>{t('practice.result.unassessed.title')}</span>
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
                  {unassessedCriteria.names.map((name) => <li key={name}>{name}</li>)}
                </ul>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {t('practice.result.unassessed.explanation')}
                </p>
              </div>
            ) : unassessedCriteria.status === 'unknown' ? (
              <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground" role="status">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <span>{t('practice.result.unassessed.generic')}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-subtle bg-surface-base/60 px-5 py-3 text-xs text-muted-foreground sm:px-6">
          {view.passThresholdPct != null ? (
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-chart-cat-3" aria-hidden />
              {t('practice.result.passThreshold').replace(
                '{{n}}',
                String(Math.round(view.passThresholdPct)),
              )}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-success" aria-hidden />
            {t('practice.result.criteriaUpdatedHint')}
          </span>
        </div>
      </div>
    </section>
  );
}
