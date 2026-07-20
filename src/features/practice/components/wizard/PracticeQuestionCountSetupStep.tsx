import { Hash } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import {
  PRACTICE_QUESTION_COUNT_MAX,
  PRACTICE_QUESTION_COUNT_MIN,
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
}

export function PracticeQuestionCountSetupStep({
  value,
  disabled,
  onChange,
  onBack,
  onNext,
}: PracticeQuestionCountSetupStepProps) {
  const { t } = useLanguage();
  const valid = isValidPracticeQuestionCount(value);

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
      <div className="flex flex-wrap gap-2">
        {QUICK.map((n) => (
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
          min={PRACTICE_QUESTION_COUNT_MIN}
          max={PRACTICE_QUESTION_COUNT_MAX}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full max-w-[160px] rounded-xl border border-satin bg-surface-overlay px-4 py-2.5 text-sm text-foreground"
        />
        <input
          type="range"
          min={PRACTICE_QUESTION_COUNT_MIN}
          max={PRACTICE_QUESTION_COUNT_MAX}
          value={Math.min(PRACTICE_QUESTION_COUNT_MAX, Math.max(PRACTICE_QUESTION_COUNT_MIN, value || 1))}
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
