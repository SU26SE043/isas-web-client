import React from 'react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';

export const WIZARD_STEP_KEYS = [
  'practice.wizard.steps.domain',
  'practice.wizard.steps.level',
  'practice.wizard.steps.cv',
  'practice.wizard.steps.questions',
  'practice.wizard.steps.rubric',
  'practice.wizard.steps.confirm',
] as const;

interface PracticeWizardShellProps {
  currentStep: number;
  children: React.ReactNode;
}

export const PracticeWizardShell: React.FC<PracticeWizardShellProps> = ({
  currentStep,
  children,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] justify-center overflow-y-auto bg-surface-base px-6 py-6 sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
        <nav
          aria-label={t('practice.wizard.stepperLabel')}
          className="shrink-0 lg:sticky lg:top-8 lg:w-[240px] lg:self-start"
        >
          <h1 className="sr-only">
            {t('practice.wizard.stepOf')
              .replace('{current}', String(currentStep + 1))
              .replace('{total}', String(WIZARD_STEP_KEYS.length))}
            {': '}
            {t(WIZARD_STEP_KEYS[currentStep])}
          </h1>

          <ol className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
            {WIZARD_STEP_KEYS.map((key, index) => {
              const isActive = index === currentStep;
              const isComplete = index < currentStep;
              const isLast = index === WIZARD_STEP_KEYS.length - 1;
              return (
                <li key={key} className="flex shrink-0 items-stretch gap-3 lg:w-full">
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
                          'mt-1 hidden w-px flex-1 min-h-6 lg:block',
                          isComplete ? 'bg-white/25' : 'bg-white/10',
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <div className={cn('min-w-0 pt-1.5', !isLast && 'lg:pb-6')}>
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

        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
};
