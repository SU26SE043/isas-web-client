import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { getPracticeSession } from '../services/b2cPracticeSession.service';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import { isCampaignSessionId, isLearningSessionId } from '../types/interviewFlow.types';
import { isValidPracticeSessionId } from '../utils/practiceSessionId';
import { SessionResultErrorState } from '../components/result/SessionResultErrorState';
import { isPlaywrightRuntime } from '@/shared/mock';
import { isPracticeReportFailed, isPracticeReportReady } from '../utils/practiceReportStatus';

export function InterviewCompletePage() {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const resetFlow = useInterviewFlowStore((state) => state.reset);
  const updateSession = useB2cPracticeInterviewStore((s) => s.updateSession);
  const isLegacy = isCampaignSessionId(sessionId) || isLearningSessionId(sessionId);
  const isPlaywrightSession =
    isPlaywrightRuntime() && /^session-[0-9a-f]+$/i.test(sessionId);
  const isValidSessionId = isValidPracticeSessionId(sessionId);

  const query = useQuery({
    queryKey: ['practice-session', sessionId],
    queryFn: () => getPracticeSession(sessionId),
    enabled: isValidSessionId && !isLegacy,
    refetchInterval: (q) => {
      const session = q.state.data;
      if (session && (isPracticeReportReady(session) || isPracticeReportFailed(session.status))) {
        return false;
      }
      return 3000;
    },
  });

  const session = query.data;
  const isScored = session ? isPracticeReportReady(session) : false;

  useEffect(() => {
    if (session) updateSession(session);
  }, [session, updateSession]);

  useEffect(() => {
    if (!isScored || !session || isLegacy) return;
    const resultSessionId = session.id || sessionId;
    if (!isValidPracticeSessionId(resultSessionId)) return;
    resetFlow(sessionId);
    navigate(`/practice/result?sessionId=${encodeURIComponent(resultSessionId)}`, {
      replace: true,
    });
  }, [isLegacy, isScored, navigate, resetFlow, session, sessionId]);

  if (isLegacy || isPlaywrightSession) {
    return (
      <div className="page-container page-section flex min-h-screen items-center justify-center">
        <div className="w-full max-w-lg rounded-xl border border-subtle bg-surface-raised p-8 text-center">
          <h1 className="heading-primary text-2xl">{t('practice.flow.complete.title')}</h1>
          {isCampaignSessionId(sessionId) ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {t('practice.flow.complete.assessmentId').replace(
                '{id}',
                `assessment-${sessionId}`,
              )}
            </p>
          ) : null}
          {isPlaywrightSession ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                {t('practice.flow.complete.assessmentId').replace(
                  '{id}',
                  `assessment-${sessionId}`,
                )}
              </p>
              <Link
                to={`/candidate/practice/history/interview-result-001?assessmentId=${encodeURIComponent(`assessment-${sessionId}`)}`}
                className="btn-primary mt-6 inline-flex"
              >
                {t('practice.flow.complete.viewResult')}
              </Link>
            </>
          ) : (
            <Link to="/candidate/dashboard" className="btn-primary mt-6 inline-flex">
              {t('practice.flow.backToDashboard')}
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!isValidSessionId) {
    return <SessionResultErrorState kind="invalidSession" />;
  }

  if (query.isError) {
    return (
      <div className="page-container page-section flex min-h-screen items-center justify-center">
        <div className="w-full max-w-lg rounded-xl border border-subtle bg-surface-raised p-8 text-center">
          <h1 className="heading-primary text-2xl">{t('practice.errors.scoringFailed')}</h1>
          <button type="button" className="btn-primary mt-6" onClick={() => void query.refetch()}>
            {t('practice.scoring.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (session && isPracticeReportFailed(session.status)) {
    return <SessionResultErrorState kind="generationFailed" />;
  }

  if (!isScored) {
    return (
      <div className="page-container page-section flex min-h-screen items-center justify-center">
        <div className="w-full max-w-lg space-y-6 rounded-xl border border-subtle bg-surface-raised p-8 text-center">
          <Loader2 className="mx-auto size-10 animate-spin text-muted-foreground" aria-hidden />
          <div>
            <h1 className="heading-primary text-2xl">{t('practice.scoring.title')}</h1>
            <p className="body-text mt-3 text-sm text-muted-foreground">
              {t('practice.scoring.description')}
            </p>
          </div>
          <ol className="space-y-2 text-left text-sm text-muted-foreground">
            <li>{t('practice.scoring.received')}</li>
            <li>{t('practice.scoring.analyzing')}</li>
            <li>{t('practice.scoring.criteria')}</li>
            <li>{t('practice.scoring.report')}</li>
          </ol>
        </div>
      </div>
    );
  }

  return null;
}
