import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
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
  const [copied, setCopied] = useState(false);
  const steps = isCampaignSession ? INTERVIEW_FLOW_STEPS : B2C_FLOW_STEPS;
  const prepSteps = steps.filter((step): step is PrepFlowStep => step !== 'room' && step !== 'complete');
  const currentIndex = prepSteps.indexOf(currentStep);

  const handleCopySession = async () => {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-surface-base px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-5 lg:items-start lg:gap-10">
        <nav
          aria-label={t('practice.flow.stepperLabel')}
          className="lg:sticky lg:top-8 lg:col-span-1"
        >
          <h1 className="sr-only">{title}</h1>
          <ol className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
            {prepSteps.map((step, index) => {
              const isActive = step === currentStep;
              const isComplete = index < currentIndex;
              const isLast = index === prepSteps.length - 1;
              return (
                <li key={step} className="flex shrink-0 items-stretch gap-3 lg:w-full">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-[background-color,border-color,color] duration-200 ease-out',
                        isActive
                          ? 'border-white bg-white text-black'
                          : isComplete
                            ? 'border-satin bg-white/10 text-foreground'
                            : 'border-satin bg-transparent text-muted-foreground',
                      )}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      {index + 1}
                    </span>
                    {!isLast ? (
                      <div
                        className={cn(
                          'mt-1 hidden min-h-6 w-px flex-1 lg:block',
                          isComplete ? 'bg-white/25' : 'bg-white/10',
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <div className={cn('pt-1.5', !isLast && 'lg:pb-6')}>
                    <span
                      className={cn(
                        'block text-sm font-medium',
                        isActive ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {t(STEP_LABEL_KEYS[step])}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="min-w-0 space-y-6 lg:col-span-4">
          <header className="space-y-2">
            <Link
              to="/candidate/dashboard"
              className="inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('practice.flow.backToDashboard')}
            </Link>
            <h2 className="heading-primary text-3xl tracking-tight sm:text-4xl">{title}</h2>
            {description ? (
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
            ) : null}
            <div className="flex items-center gap-2">
              <p className="text-caption text-muted-foreground">
                {t('practice.flow.sessionLabel')}: {sessionId}
              </p>
              <button
                type="button"
                onClick={() => void handleCopySession()}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-satin text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
                aria-label={t('practice.flow.copySession')}
              >
                {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
              </button>
            </div>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
};
