import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { isCampaignSessionId } from '../types/interviewFlow.types';
import { practiceSessionService } from '../services/practiceSession.service';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { useInterviewFlowSession } from '../hooks/useInterviewFlowSession';
import { InterviewFlowShell } from '../components/flow/InterviewFlowShell';
import { TermsAcceptanceGate } from '../components/flow/TermsAcceptanceGate';

export const TermsAcceptancePage: React.FC = () => {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  useInterviewFlowSession(sessionId);
  const { deviceCheckPassed, termsAccepted, setTermsAccepted } = useInterviewFlowStore();
  const [accepted, setAccepted] = useState(termsAccepted);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isCampaignSessionId(sessionId)) {
      navigate(`/interview/${sessionId}/identity`, { replace: true });
      return;
    }
    if (!deviceCheckPassed) {
      navigate(`/interview/${sessionId}/prepare?step=device`, { replace: true });
    }
  }, [deviceCheckPassed, navigate, sessionId]);

  useEffect(() => {
    setAccepted(termsAccepted);
  }, [termsAccepted]);

  const handleContinue = async () => {
    if (!accepted) return;
    setSubmitting(true);
    try {
      await practiceSessionService.acceptTerms(sessionId);
      setTermsAccepted(sessionId, true);
      navigate(`/interview/${sessionId}/identity`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <InterviewFlowShell
      sessionId={sessionId}
      currentStep="terms"
      title={t('practice.flow.terms.pageTitle')}
      description={t('practice.flow.terms.pageDescription')}
      isCampaignSession
    >
      <TermsAcceptanceGate accepted={accepted} onAcceptedChange={setAccepted} />
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary"
          disabled={!accepted || submitting}
          onClick={() => void handleContinue()}
        >
          {t('practice.flow.continue')}
        </button>
      </div>
    </InterviewFlowShell>
  );
};
