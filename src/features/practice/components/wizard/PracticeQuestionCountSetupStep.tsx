import { Hash, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import {
  PRACTICE_QUESTION_COUNT_MAX,
  PRACTICE_QUESTION_COUNT_MIN,
  type PracticeSessionOptions,
} from '../../types/b2cPracticeSession.types';
import { isValidPracticeQuestionCount } from '../../utils/buildCreatePracticeSessionRequest';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

const QUICK = [5, 10, 15, 20] as const;

interface PracticeQuestionCountSetupStepProps {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  onBack: () => void;
  onNext: () => void;
  options?: PracticeSessionOptions | null;
  isLoadingOptions?: boolean;
  optionsError?: string | null;
  onRetryOptions?: () => void;
}

export function PracticeQuestionCountSetupStep({
  value,
  disabled,
  onChange,
  onBack,
  onNext,
  options,
  isLoadingOptions = false,
  optionsError,
  onRetryOptions,
}: PracticeQuestionCountSetupStepProps) {
  const { t } = useLanguage();
  const min = options?.questionCountMin ?? PRACTICE_QUESTION_COUNT_MIN;
  const max = options?.questionCountMax ?? PRACTICE_QUESTION_COUNT_MAX;
  const valid = isValidPracticeQuestionCount(value) && value >= min && value <= max;

  return (
    <PracticeWizardStepCard
      icon={<Hash className="size-4" aria-hidden />}
      title={t('practice.setup.questionCount.title')}
      description={t('practice.setup.questionCount.description')}
      footer={
        <PracticeWizardNav
          onBack={onBack}
          onNext={onNext}
          nextDisabled={!valid || disabled}
        />
      }
    >
      {isLoadingOptions ? (
        <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
          {t('practice.setup.questionCount.loadingOptions')}
        </p>
      ) : null}

      {optionsError ? (
        <div className="mb-4" role="alert">
          <p className="text-sm text-error">{t('practice.setup.questionCount.optionsError')}</p>
          {onRetryOptions ? (
            <button
              type="button"
              className="btn-secondary mt-3 inline-flex items-center gap-2"
              onClick={onRetryOptions}
              disabled={isLoadingOptions || disabled}
            >
              <RefreshCw className="size-4" aria-hidden />
              {t('practice.setup.questionCount.retryOptions')}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(options?.presets.length ? options.presets.map((preset) => preset.questionCount) : QUICK).map((n) => (
          <button
            key={n}
            type="button"
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-medium',
              value === n ? 'btn-primary' : 'btn-secondary',
            )}
            onClick={() => onChange(n)}
            disabled={disabled}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <label htmlFor="practice-question-count" className="text-sm text-muted-foreground">
          {t('practice.setup.questionCount.inputLabel')}
        </label>
        <input
          id="practice-question-count"
          type="number"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full max-w-[160px] rounded-xl border border-satin bg-surface-overlay px-4 py-2.5 text-sm text-foreground"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={Math.min(max, Math.max(min, value || min))}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
          aria-label={t('practice.setup.questionCount.inputLabel')}
        />
        {!valid ? (
          <p className="text-sm text-error" role="alert">
            {t('practice.errors.invalidQuestionCount')}
          </p>
        ) : null}
      </div>
    </PracticeWizardStepCard>
  );
}
