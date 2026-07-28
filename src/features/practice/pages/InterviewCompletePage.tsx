import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { getPracticeSession } from '../services/b2cPracticeSession.service';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import { isCampaignSessionId, isLearningSessionId } from '../types/interviewFlow.types';
import { resultService } from '../services/result.service';

export function InterviewCompletePage() {
  const { sessionId = '' } = useParams();
  const { t } = useLanguage();
  const resetFlow = useInterviewFlowStore((state) => state.reset);
  const updateSession = useB2cPracticeInterviewStore((s) => s.updateSession);
  const isLegacy = isCampaignSessionId(sessionId) || isLearningSessionId(sessionId);
  const assessmentId = `assessment-${sessionId}`;

  const query = useQuery({
    queryKey: ['practice-session', sessionId],
    queryFn: () => getPracticeSession(sessionId),
    enabled: Boolean(sessionId) && !isLegacy,
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (status === 'Scored') return false;
      return 3000;
    },
  });

  const session = query.data;
  const isScored = session?.status === 'Scored';

  useEffect(() => {
    if (session) updateSession(session);
  }, [session, updateSession]);

  useEffect(() => {
    if (!sessionId || isLegacy) return;
    resultService.registerPendingAssessment(assessmentId);
  }, [assessmentId, isLegacy, sessionId]);

  if (isLegacy) {
    return (
      <div className="page-container page-section flex min-h-screen items-center justify-center">
        <div className="w-full max-w-lg rounded-xl border border-subtle bg-surface-raised p-8 text-center">
          <h1 className="heading-primary text-2xl">{t('practice.flow.complete.title')}</h1>
          <Link to="/candidate/dashboard" className="btn-primary mt-6 inline-flex">
            {t('practice.flow.backToDashboard')}
          </Link>
        </div>
      </div>
    );
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

  return (
    <div className="page-container page-section flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border border-subtle bg-surface-raised p-8 text-center">
        <h1 className="heading-primary text-2xl">{t('practice.flow.complete.title')}</h1>
        <p className="body-text mt-3 text-sm text-muted-foreground">
          {t('practice.flow.complete.description')}
        </p>
        <p className="mt-4 text-sm text-foreground">
          {t('practice.flow.complete.assessmentId').replace('{id}', assessmentId)}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to={`/practice/result?assessmentId=${encodeURIComponent(assessmentId)}`}
            className="btn-primary inline-flex justify-center"
            onClick={() => resetFlow(sessionId)}
          >
            {t('practice.flow.complete.viewResult')}
          </Link>
          <Link
            to="/candidate/practice/history"
            className="btn-secondary inline-flex justify-center"
            onClick={() => resetFlow(sessionId)}
          >
            {t('practice.flow.complete.viewHistory')}
          </Link>
        </div>
      </div>
    </div>
  );
}
