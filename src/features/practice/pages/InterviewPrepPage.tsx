import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { practiceSessionService } from '../services/practiceSession.service';
import { isCampaignSessionId, isLearningSessionId } from '../types/interviewFlow.types';
import { useInterviewGate } from '../hooks/useInterviewGate';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { useInterviewFlowSession } from '../hooks/useInterviewFlowSession';
import { InterviewFlowShell } from '../components/flow/InterviewFlowShell';
import { InterviewGatePanel } from '../components/flow/InterviewGatePanel';
import { getLearningPracticeSession } from '../services/learningPracticeSession.registry';

export const InterviewPrepPage: React.FC = () => {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  useInterviewFlowSession(sessionId);
  const gate = useInterviewGate(sessionId);
  const { consentAccepted, setConsentAccepted } = useInterviewFlowStore();
  const [sessionTitle, setSessionTitle] = useState('');
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    let active = true;
    void practiceSessionService.getSession(sessionId).then((session) => {
      if (!active) return;
      setSessionTitle(session.title);
      setLoadingSession(false);
    });
    return () => {
      active = false;
    };
  }, [sessionId]);

  const canContinue = gate.canStart && consentAccepted && !loadingSession;
  const isCampaignSession = isCampaignSessionId(sessionId);
  const isLearningSession = isLearningSessionId(sessionId);
  const learningMeta = isLearningSession ? getLearningPracticeSession(sessionId) : undefined;
  const cancelHref = learningMeta
    ? `/candidate/learning/roadmaps/${learningMeta.roadmapId}`
    : '/candidate/dashboard';
  const consentKey = isCampaignSession
    ? 'practice.flow.prepare.consent'
    : 'practice.flow.prepare.consentPractice';

  return (
    <InterviewFlowShell
      sessionId={sessionId}
      currentStep="prepare"
      title={t('practice.flow.prepare.title')}
      description={sessionTitle || t('practice.flow.prepare.description')}
    >
      {gate.isLoading || loadingSession ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        </div>
      ) : (
        <div className="space-y-6">
          {!isLearningSession ? (
            <InterviewGatePanel
              meetsProfileGate={gate.meetsProfileGate}
              hasCredits={gate.hasCredits}
              completenessPercent={gate.completenessPercent}
              creditsRemaining={gate.tokenAvailable}
              reserveEstimate={gate.reserveEstimate}
            />
          ) : null}

          <div className="rounded-xl border border-subtle bg-surface-raised p-6">
            <h2 className="heading-secondary text-lg">{t('practice.flow.prepare.checklistTitle')}</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>{t('practice.flow.prepare.checkQuiet')}</li>
              <li>{t('practice.flow.prepare.checkCamera')}</li>
              <li>{t('practice.flow.prepare.checkTime')}</li>
            </ul>

            <label className="mt-6 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border-default bg-surface-overlay"
                checked={consentAccepted}
                disabled={!gate.canStart}
                onChange={(event) => setConsentAccepted(sessionId, event.target.checked)}
              />
              <span className="text-sm text-foreground">{t(consentKey)}</span>
            </label>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary"
                disabled={!canContinue}
                onClick={() => navigate(`/interview/${sessionId}/device-check`)}
              >
                {t('practice.flow.continue')}
              </button>
              <Link to={cancelHref} className="btn-secondary">
                {t('practice.flow.cancel')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </InterviewFlowShell>
  );
};
