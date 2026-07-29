import type { ReactNode } from 'react';
import { ChartNoAxesCombined, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type { PracticeSessionResponse } from '../../types/b2cPracticeSession.types';
import { mapPracticeSessionResponseToViewModel } from '../../utils/practiceSessionResultViewModel';
import { CriteriaProgressList, CriteriaThresholdNote } from './CriteriaProgressList';
import { CriteriaRadarChart } from './CriteriaRadarChart';
import { PracticeOverallFeedback } from './PracticeOverallFeedback';
import { PracticeQuestionResultCard } from './PracticeQuestionResultCard';
import { ResultQuickNavigation } from './ResultQuickNavigation';
import { SessionResultHeader } from './SessionResultHeader';
import { SessionSummaryCard } from './SessionSummaryCard';

interface PracticeLiveResultReportProps {
  session: PracticeSessionResponse;
  onLeave?: () => void;
  actions?: ReactNode;
}

export function PracticeLiveResultReport({ session, onLeave, actions }: PracticeLiveResultReportProps) {
  const { t } = useLanguage();
  const view = mapPracticeSessionResponseToViewModel(session);
  if (!view.hasResult) return null;

  return (
    <div className="page-container page-section mx-auto max-w-7xl space-y-8 py-8">
      <SessionResultHeader view={view} />
      <ResultQuickNavigation questions={view.questions} />
      <SessionSummaryCard view={view} />

      <section id="criteria" className="scroll-mt-24 space-y-5">
        <div className="frame-satin overflow-hidden rounded-2xl border border-satin bg-surface-raised">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-chart-cat-1/10 text-chart-cat-1">
                <ChartNoAxesCombined className="size-5" aria-hidden />
              </span>
              <h2 className="text-lg font-semibold text-foreground">{t('practice.result.criteriaScores')}</h2>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-chart-cat-1" aria-hidden />{t('practice.result.radarYourScore')}</span>
              {view.passThresholdPct != null ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-chart-cat-3" aria-hidden />
                  {t('practice.result.radarThreshold')}
                  <span className="rounded bg-surface-elevated px-1.5 py-0.5 tabular-nums text-foreground">{Math.round(view.passThresholdPct)}%</span>
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
              <CriteriaRadarChart criteria={view.criteria} passThresholdPct={view.passThresholdPct} benchmark={view.benchmark} />
              <CriteriaThresholdNote passThresholdPct={view.passThresholdPct} note={view.passThresholdNote} />
            </div>

            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <List className="size-4 text-chart-cat-1" aria-hidden />
                {t('practice.result.criteriaDetail')}
              </div>
              <CriteriaProgressList criteria={view.criteria} passThresholdPct={view.passThresholdPct} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-subtle bg-surface-base/60 px-5 py-3 text-xs text-muted-foreground sm:px-6">
            {view.passThresholdPct != null ? (
              <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-chart-cat-3" aria-hidden />{t('practice.result.passThreshold').replace('{{n}}', String(Math.round(view.passThresholdPct)))}</span>
            ) : null}
            <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-success" aria-hidden />{t('practice.result.criteriaUpdatedHint')}</span>
          </div>
        </div>
      </section>

      <section id="questions" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">{t('practice.result.questionReview')}</h2>
        {view.questions.length ? view.questions.map((question) => <PracticeQuestionResultCard key={question.answerId ?? question.questionId} question={question} defaultOpen />) : <p className="text-sm text-muted-foreground">{t('practice.result.noQuestionsDescription')}</p>}
      </section>

      <PracticeOverallFeedback strengths={view.strengths} improvements={view.improvements} nextSteps={view.nextSteps} cvVsAnswerSummary={view.cvVsAnswerSummary} />

      <div className="flex flex-wrap gap-3 pb-8">
        {actions ?? <>
          <Link to="/practice" className="btn-primary" onClick={onLeave}>{t('practice.result.practiceAgain')}</Link>
          <Link to="/candidate/practice/history" className="btn-secondary" onClick={onLeave}>{t('practice.result.history')}</Link>
          <Link to="/candidate/dashboard" className="btn-ghost" onClick={onLeave}>{t('practice.result.dashboard')}</Link>
        </>}
      </div>
    </div>
  );
}
