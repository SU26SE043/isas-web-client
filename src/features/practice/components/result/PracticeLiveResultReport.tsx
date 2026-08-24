import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type { PracticeSessionResponse } from '../../types/b2cPracticeSession.types';
import { useLiveReportTabs } from '../../hooks/useLiveReportTabs';
import { mapPracticeSessionResponseToViewModel } from '../../utils/practiceSessionResultViewModel';
import { PracticeSessionTopics } from '../PracticeSessionTopics';
import { LiveReportTabBar } from './LiveReportTabBar';
import { ReportCriteriaScores } from './ReportCriteriaScores';
import { ReportOverview } from './ReportOverview';
import { ReportQuestionDetail } from './ReportQuestionDetail';
import { SessionResultHeader } from './SessionResultHeader';

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
  const { activeTab, activeQuestionIndex, setActiveTab, setActiveQuestionIndex } =
    useLiveReportTabs(view.questions.length);

  if (!view.hasResult) return null;

  return (
    <div className="page-container page-section mx-auto max-w-7xl space-y-6 py-8">
      <SessionResultHeader view={view} />

      <div className="space-y-4 border-y border-satin py-3">
        <LiveReportTabBar activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="min-h-[320px]" role="tabpanel">
        {activeTab === 'overview' ? <ReportOverview view={view} /> : null}
        {activeTab === 'criteria' ? (
          <div
            className={
              session.topics?.length
                ? 'grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:items-start'
                : undefined
            }
          >
            <ReportCriteriaScores view={view} />
            {session.topics?.length ? (
              <PracticeSessionTopics
                topics={session.topics}
                seniority={session.seniority}
                variant="full"
              />
            ) : null}
          </div>
        ) : null}
        {activeTab === 'questions' ? (
          <ReportQuestionDetail
            questions={view.questions}
            sessionId={session.id}
            activeQuestionIndex={activeQuestionIndex}
            onQuestionChange={setActiveQuestionIndex}
          />
        ) : null}
      </div>

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
