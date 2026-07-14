import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';

export const ROADMAP_WIZARD_STEP_KEYS = [
  'practice.roadmapWizard.steps.domain',
  'practice.roadmapWizard.steps.reports',
  'practice.roadmapWizard.steps.level',
  'practice.roadmapWizard.steps.confirm',
] as const;

interface RoadmapWizardShellProps {
  currentStep: number;
  /** Extra heading shown on the first step only. */
  introTitle?: string;
  introDescription?: string;
  children: React.ReactNode;
}

export const RoadmapWizardShell: React.FC<RoadmapWizardShellProps> = ({
  currentStep,
  introTitle,
  introDescription,
  children,
}) => {
  const { t } = useLanguage();
  const showIntro = currentStep === 0 && Boolean(introTitle);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] justify-center overflow-y-auto bg-surface-base px-6 py-6 sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
        <nav
          aria-label={t('practice.roadmapWizard.stepperLabel')}
          className="hidden shrink-0 sm:block lg:sticky lg:top-8 lg:w-[240px] lg:self-start"
        >
          <h1 className="sr-only">
            {t('practice.roadmapWizard.stepOf')
              .replace('{current}', String(currentStep + 1))
              .replace('{total}', String(ROADMAP_WIZARD_STEP_KEYS.length))}
            {': '}
            {t(ROADMAP_WIZARD_STEP_KEYS[currentStep])}
          </h1>

          <ol className="flex flex-col">
            {ROADMAP_WIZARD_STEP_KEYS.map((key, index) => {
              const isActive = index === currentStep;
              const isComplete = index < currentStep;
              const isLast = index === ROADMAP_WIZARD_STEP_KEYS.length - 1;
              return (
                <li key={key} className="flex w-full items-stretch gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-[background-color,border-color,color] duration-200 ease-out',
                        isActive
                          ? 'border-white bg-white text-black'
                          : isComplete
                            ? 'border-white/30 bg-white/10 text-foreground'
                            : 'border-white/15 bg-transparent text-muted-foreground',
                      )}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      {index + 1}
                    </span>
                    {!isLast ? (
                      <div
                        className={cn(
                          'mt-1 w-px flex-1 min-h-8',
                          isComplete ? 'bg-white/25' : 'bg-white/10',
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <div className={cn('min-w-0 pt-1.5', !isLast && 'pb-6')}>
                    <span
                      className={cn(
                        'block text-sm font-medium leading-snug',
                        isActive ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {t(key)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="shrink-0">
            <Link
              to="/candidate/dashboard"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              {t('practice.flow.backToDashboard')}
            </Link>

            {showIntro ? (
              <>
                <h2 className="heading-primary mt-4 text-3xl text-foreground sm:text-4xl">{introTitle}</h2>
                {introDescription ? (
                  <p className="body-text mt-2 max-w-3xl">{introDescription}</p>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
};
