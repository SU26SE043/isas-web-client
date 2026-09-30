import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/shared/languages';
import { getRubric } from '@/features/rubrics/services/candidateRubrics.service';
import { CANDIDATE_RUBRIC_QUERY_KEY } from '@/features/rubrics/hooks/useCandidateRubric';
import type { JobCategory } from '@/features/rubrics/types/rubric.types';
import type { PracticeSessionResponse } from '../../types/b2cPracticeSession.types';
import { useLiveReportTabs } from '../../hooks/useLiveReportTabs';
import { mapPracticeSessionResponseToViewModel } from '../../utils/practiceSessionResultViewModel';
import { PracticeSessionTopics } from '../PracticeSessionTopics';
import { LiveReportTabBar } from './LiveReportTabBar';
import { ReportCriteriaScores } from './ReportCriteriaScores';
import { ReportOverview } from './ReportOverview';
import { ReportQuestionDetail } from './ReportQuestionDetail';
import { SessionResultHeader } from './SessionResultHeader';
import { getPracticeRubricLanguage, getUnassessedCriteria } from '../../utils/unassessedCriteria';

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
  const rubricSource = session.result?.rubricSource;
  const jobCategory = session.jobCategory;
  const rubricLanguage = getPracticeRubricLanguage(session.language);
  const canLoadDefaultRubric =
    rubricSource === 'SystemDefault' &&
    (jobCategory === 'BA' || jobCategory === 'BE' || jobCategory === 'FE');
  const rubricQuery = useQuery({
    queryKey: [...CANDIDATE_RUBRIC_QUERY_KEY, jobCategory, rubricLanguage],
    queryFn: ({ signal }) => getRubric(jobCategory as JobCategory, rubricLanguage, signal),
    enabled: canLoadDefaultRubric,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const unassessedCriteria = getUnassessedCriteria(
    session,
    rubricQuery.data,
    {
      isLoading: canLoadDefaultRubric && rubricQuery.isLoading,
      isError: canLoadDefaultRubric && rubricQuery.isError,
    },
  );
  const { activeTab, activeQuestionIndex, setActiveTab, setActiveQuestionIndex } =
    useLiveReportTabs(view.questions.length);

  if (!view.hasResult) return null;

  return (
    <div className="app-page space-y-6">
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
            <ReportCriteriaScores view={view} unassessedCriteria={unassessedCriteria} />
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
