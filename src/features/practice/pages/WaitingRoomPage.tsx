import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { practiceSessionService } from '../services/practiceSession.service';
import { isCampaignSessionId, requiresIdentityVerification } from '../types/interviewFlow.types';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { useInterviewFlowSession } from '../hooks/useInterviewFlowSession';
import { InterviewFlowShell } from '../components/flow/InterviewFlowShell';

export const WaitingRoomPage: React.FC = () => {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  useInterviewFlowSession(sessionId);
  const { deviceCheckPassed, identityVerified } = useInterviewFlowStore();
  const isCampaign = isCampaignSessionId(sessionId);
  const [status, setStatus] = useState<'polling' | 'ready' | 'error'>('polling');
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    if (!deviceCheckPassed) {
      navigate(`/interview/${sessionId}/device-check`, { replace: true });
      return;
    }
    if (requiresIdentityVerification(sessionId) && !identityVerified) {
      navigate(`/interview/${sessionId}/identity`, { replace: true });
    }
  }, [deviceCheckPassed, identityVerified, navigate, sessionId]);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const questions = await practiceSessionService.pollQuestions(sessionId);
        if (cancelled) return;
        if (questions.length > 0) {
          setQuestionCount(questions.length);
          setStatus('ready');
          return;
        }
        if (attempts >= 8) {
          setStatus('error');
          return;
        }
        window.setTimeout(() => void poll(), 1200);
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (status !== 'ready') return;
    const timer = window.setTimeout(() => {
      navigate(`/interview/${sessionId}/room`);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [navigate, sessionId, status]);

  return (
    <InterviewFlowShell
      sessionId={sessionId}
      currentStep="waiting"
      title={t('practice.flow.waiting.title')}
      description={t('practice.flow.waiting.description')}
      isCampaignSession={isCampaign}
    >
      <div className="rounded-xl border border-subtle bg-surface-raised p-8 text-center">
        {status === 'polling' ? (
          <>
            <Loader2 className="mx-auto size-10 animate-spin text-muted-foreground" aria-hidden />
            <p className="mt-4 text-sm text-foreground">{t('practice.flow.waiting.polling')}</p>
          </>
        ) : null}
        {status === 'ready' ? (
          <p className="text-sm text-emerald-400">
            {t('practice.flow.waiting.ready').replace('{count}', String(questionCount))}
          </p>
        ) : null}
        {status === 'error' ? (
          <div>
            <p className="text-sm text-red-400">{t('practice.flow.waiting.error')}</p>
            <button
              type="button"
              className="btn-primary mt-4"
              onClick={() => navigate(`/interview/${sessionId}/room`)}
            >
              {t('practice.flow.waiting.enterAnyway')}
            </button>
          </div>
        ) : null}
      </div>
    </InterviewFlowShell>
  );
};
