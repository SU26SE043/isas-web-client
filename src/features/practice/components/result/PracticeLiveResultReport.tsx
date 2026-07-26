import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type { PracticeSessionResponse } from '../../types/b2cPracticeSession.types';
import { mapPracticeSessionResponseToViewModel } from '../../utils/practiceSessionResultViewModel';
import {
  CriteriaProgressList,
  CriteriaThresholdNote,
} from './CriteriaProgressList';
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

export function PracticeLiveResultReport({
  session,
  onLeave,
  actions,
}: PracticeLiveResultReportProps) {
  const { t } = useLanguage();
  const view = mapPracticeSessionResponseToViewModel(session);
  if (!view.hasResult) return null;

  return (
    <div className="page-container page-section mx-auto max-w-7xl space-y-8 py-8">
      <SessionResultHeader view={view} />
      <ResultQuickNavigation questions={view.questions} />

      <SessionSummaryCard view={view} />

      <section id="criteria" className="scroll-mt-24 space-y-5">
        <div className="frame-satin space-y-6 rounded-2xl border border-satin bg-surface-raised p-6">
          <h2 className="text-lg font-semibold text-foreground">
            {t('practice.result.criteriaScores')}
          </h2>
          <CriteriaRadarChart
            criteria={view.criteria}
            passThresholdPct={view.passThresholdPct}
          />
          <CriteriaThresholdNote
            passThresholdPct={view.passThresholdPct}
            note={view.passThresholdNote}
          />
          <CriteriaProgressList
            criteria={view.criteria}
            passThresholdPct={view.passThresholdPct}
          />
        </div>
      </section>

      <section id="questions" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          {t('practice.result.questionReview')}
        </h2>
        {view.questions.length ? (
          view.questions.map((question) => (
            <PracticeQuestionResultCard
              key={question.answerId ?? question.questionId}
              question={question}
              defaultOpen
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('practice.result.noQuestionsDescription')}
          </p>
        )}
      </section>

      <PracticeOverallFeedback
        overallFeedback={undefined}
        strengths={view.strengths}
        improvements={view.improvements}
        nextSteps={view.nextSteps}
        cvVsAnswerSummary={view.cvVsAnswerSummary}
      />

      <div className="flex flex-wrap gap-3 pb-8">
        {actions ?? (
          <>
            <Link to="/practice" className="btn-primary" onClick={onLeave}>
              {t('practice.result.practiceAgain')}
            </Link>
            <Link to="/candidate/practice/history" className="btn-secondary" onClick={onLeave}>
              {t('practice.result.history')}
            </Link>
            <Link to="/candidate/dashboard" className="btn-ghost" onClick={onLeave}>
              {t('practice.result.dashboard')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
