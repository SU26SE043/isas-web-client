import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Camera,
  CheckSquare,
  ChevronRight,
  Clock,
  Loader2,
  Sun,
} from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { SectionPanel } from '@/components/ui/section-panel';
import { practiceSessionService } from '../services/practiceSession.service';
import { isCampaignSessionId, isLearningSessionId } from '../types/interviewFlow.types';
import { useInterviewGate } from '../hooks/useInterviewGate';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { useInterviewFlowSession } from '../hooks/useInterviewFlowSession';
import { InterviewFlowShell } from '../components/flow/InterviewFlowShell';
import { InterviewGatePanel } from '../components/flow/InterviewGatePanel';
import { getLearningPracticeSession } from '../services/learningPracticeSession.registry';

const CHECKLIST = [
  { key: 'practice.flow.prepare.checkQuiet', icon: Sun },
  { key: 'practice.flow.prepare.checkCamera', icon: Camera },
  { key: 'practice.flow.prepare.checkTime', icon: Clock },
] as const;

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
      isCampaignSession={isCampaignSession}
    >
      {gate.isLoading || loadingSession ? (
        <div className="frame-satin flex min-h-[220px] items-center justify-center rounded-2xl">
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        </div>
      ) : (
        <div className="space-y-5">
          {!isLearningSession ? (
            <InterviewGatePanel
              meetsProfileGate={gate.meetsProfileGate}
              hasCredits={gate.hasCredits}
              completenessPercent={gate.completenessPercent}
              creditsRemaining={gate.tokenAvailable}
              reserveEstimate={gate.reserveEstimate}
            />
          ) : null}

          <SectionPanel
            icon={<CheckSquare className="size-4" aria-hidden />}
            title={t('practice.flow.prepare.checklistTitle')}
            description={t('practice.flow.prepare.checklistHint')}
            footer={
              <div className="mt-8 flex flex-col gap-3 border-t border-satin pt-6 sm:flex-row sm:items-center">
                <button
                  type="button"
                  className="btn-primary inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5"
                  disabled={!canContinue}
                  onClick={() => navigate(`/interview/${sessionId}/device-check`)}
                >
                  {t('practice.flow.continue')}
                  <ChevronRight className="size-4" aria-hidden />
                </button>
                <Link to={cancelHref} className="btn-secondary inline-flex justify-center rounded-xl px-5 py-2.5">
                  {t('practice.flow.cancel')}
                </Link>
              </div>
            }
          >
            <ul className="divide-y divide-[color-mix(in_srgb,var(--isas-silver-200)_16%,transparent)]">
              {CHECKLIST.map(({ key, icon: Icon }) => (
                <li key={key} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                  <span className="frame-satin-soft mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t(key)}</p>
                </li>
              ))}
            </ul>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-satin bg-white/[0.03] px-4 py-3.5">
              <input
                type="checkbox"
                className="mt-0.5 size-4 rounded border-satin bg-surface-overlay accent-white"
                checked={consentAccepted}
                disabled={!gate.canStart}
                onChange={(event) => setConsentAccepted(sessionId, event.target.checked)}
              />
              <span className="text-sm text-foreground">{t(consentKey)}</span>
            </label>
          </SectionPanel>
        </div>
      )}
    </InterviewFlowShell>
  );
};
