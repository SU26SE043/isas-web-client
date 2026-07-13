import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import {
  B2C_FLOW_STEPS,
  INTERVIEW_FLOW_STEPS,
  type InterviewFlowStep,
} from '../../types/interviewFlow.types';

type PrepFlowStep = Exclude<InterviewFlowStep, 'room' | 'complete'>;

interface InterviewFlowShellProps {
  sessionId: string;
  currentStep: PrepFlowStep;
  title: string;
  description?: string;
  isCampaignSession?: boolean;
  children: React.ReactNode;
}

const STEP_LABEL_KEYS: Record<PrepFlowStep, string> = {
  prepare: 'practice.flow.steps.prepare',
  'device-check': 'practice.flow.steps.deviceCheck',
  terms: 'practice.flow.steps.terms',
  identity: 'practice.flow.steps.identity',
  waiting: 'practice.flow.steps.waiting',
};

export const InterviewFlowShell: React.FC<InterviewFlowShellProps> = ({
  sessionId,
  currentStep,
  title,
  description,
  isCampaignSession = false,
  children,
}) => {
  const { t } = useLanguage();
  const steps = isCampaignSession ? INTERVIEW_FLOW_STEPS : B2C_FLOW_STEPS;
  const prepSteps = steps.filter((step): step is PrepFlowStep => step !== 'room' && step !== 'complete');
  const currentIndex = prepSteps.indexOf(currentStep);

  return (
    <div className="page-container page-section min-h-screen">
      <div className="mx-auto max-w-3xl">
        <nav aria-label={t('practice.flow.stepperLabel')} className="mb-8">
          <ol className="flex flex-wrap gap-2">
            {prepSteps.map((step, index) => {
              const isActive = step === currentStep;
              const isComplete = index < currentIndex;
              return (
                <li
                  key={step}
                  className={[
                    'rounded-full border px-3 py-1 text-xs font-medium',
                    isActive
                      ? 'border-default bg-surface-elevated text-foreground'
                      : isComplete
                        ? 'border-subtle bg-surface-overlay text-foreground'
                        : 'border-subtle text-muted-foreground',
                  ].join(' ')}
                >
                  {t(STEP_LABEL_KEYS[step])}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="mb-6">
          <Link
            to="/candidate/dashboard"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            {t('practice.flow.backToDashboard')}
          </Link>
          <h1 className="heading-primary mt-3 text-3xl">{title}</h1>
          {description ? <p className="body-text mt-2">{description}</p> : null}
          <p className="mt-2 text-caption text-muted-foreground">
            {t('practice.flow.sessionLabel')}: {sessionId}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
};
