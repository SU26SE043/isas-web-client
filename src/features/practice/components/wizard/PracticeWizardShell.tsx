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
    <div className="min-h-screen bg-surface-base px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-5 lg:items-start lg:gap-10">
        <nav
          aria-label={t('practice.wizard.stepperLabel')}
          className="lg:sticky lg:top-8 lg:col-span-1"
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
                  <div className={cn('pt-1.5', !isLast && 'lg:pb-6')}>
                    <span
                      className={cn(
                        'block text-sm font-medium',
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

        <div className="min-w-0 lg:col-span-4">{children}</div>
      </div>
    </div>
  );
};
