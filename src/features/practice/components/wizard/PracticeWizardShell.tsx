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
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const PracticeWizardShell: React.FC<PracticeWizardShellProps> = ({
  currentStep,
  title,
  description,
  children,
}) => {
  const { t } = useLanguage();
  const stepLabel = t('practice.wizard.stepOf')
    .replace('{current}', String(currentStep + 1))
    .replace('{total}', String(WIZARD_STEP_KEYS.length));

  return (
    <div className="min-h-screen bg-surface-base px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <nav aria-label={t('practice.wizard.stepperLabel')}>
          <ol className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-0">
            {WIZARD_STEP_KEYS.map((key, index) => {
              const isActive = index === currentStep;
              const isComplete = index < currentStep;
              const isLast = index === WIZARD_STEP_KEYS.length - 1;
              return (
                <li key={key} className="flex flex-1 items-center gap-3 sm:gap-0">
                  <div className="flex items-center gap-2 sm:w-full">
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
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isActive ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {t(key)}
                    </span>
                    {!isLast ? (
                      <div
                        className={cn(
                          'mx-3 hidden h-px flex-1 sm:block',
                          isComplete ? 'bg-white/25' : 'bg-white/10',
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        <header className="max-w-xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {stepLabel}
          </p>
          <h1 className="heading-primary text-3xl tracking-tight sm:text-4xl">{title}</h1>
          {description ? (
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
          ) : null}
        </header>

        {children}
      </div>
    </div>
  );
};
