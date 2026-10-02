import { ClipboardCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { PracticeJobCategory } from '../../types/b2cPracticeSession.types';
import type { PracticeRubricCriterion } from '../../types/practiceSetup.types';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

interface PracticeGradingCriteriaStepProps {
  jobCategory: PracticeJobCategory | null;
  criteria: PracticeRubricCriterion[];
  isCustom: boolean;
  language: 'vi' | 'en';
  isLoading: boolean;
  isError: boolean;
  disabled?: boolean;
  editDisabled?: boolean;
  draftError?: string | null;
  onEdit: () => void;
  onRetry: () => void;
  onBack: () => void;
  onBackToDomain?: () => void;
  onNext: () => void;
}

export function PracticeGradingCriteriaStep({
  jobCategory, criteria, isCustom, language, isLoading, isError, disabled,
  editDisabled, draftError, onEdit, onRetry, onBack, onBackToDomain, onNext,
}: PracticeGradingCriteriaStepProps) {
  const { t } = useLanguage();
  const validCriteria = criteria.filter((criterion) => criterion.id && criterion.name.trim());
  const canNext = Boolean(jobCategory) && !isLoading && !isError && validCriteria.length > 0;

  return (
    <PracticeWizardStepCard
      icon={<ClipboardCheck className="size-4" aria-hidden />}
      title={t('practice.setup.gradingCriteria.title')}
      description={t('practice.setup.gradingCriteria.description')}
      footer={<PracticeWizardNav onBack={onBack} onNext={onNext} nextDisabled={Boolean(disabled || !canNext)} backDisabled={disabled} />}
    >
      {!jobCategory ? (
        <div className="frame-satin rounded-xl border border-satin bg-surface-overlay/50 p-5 text-center">
          <p className="text-sm text-muted-foreground">{t('practice.setup.gradingCriteria.noDomain')}</p>
          {onBackToDomain ? <Button type="button" variant="secondary" className="mt-4" onClick={onBackToDomain}>{t('practice.setup.gradingCriteria.backToDomain')}</Button> : null}
        </div>
      ) : isLoading ? (
        <div className="space-y-3" aria-label={t('practice.setup.gradingCriteria.loading')}>
          {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-xl border border-satin bg-surface-overlay" />)}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-error/30 bg-error/10 p-5 text-center">
          <p className="text-sm text-error">{t('practice.setup.gradingCriteria.loadError')}</p>
          <Button type="button" variant="secondary" className="mt-4" onClick={onRetry}><RefreshCw className="size-4" aria-hidden />{t('practice.setup.gradingCriteria.retry')}</Button>
        </div>
      ) : validCriteria.length === 0 ? (
        <p className="frame-satin rounded-xl border border-satin bg-surface-overlay/50 p-5 text-sm text-muted-foreground">
          {t('practice.setup.gradingCriteria.empty')}
        </p>
      ) : (
        <div className="frame-satin space-y-4 rounded-xl border border-satin bg-surface-overlay/50 p-4 sm:p-5">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {t('practice.setup.gradingCriteria.source')}{' '}
              <span className="font-semibold">{t(isCustom ? 'practice.setup.gradingCriteria.custom' : 'practice.setup.gradingCriteria.default')}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {t(`rubrics.domain.${jobCategory}`)} · {t(`practice.setup.gradingCriteria.language.${language}`)} · {t('practice.setup.gradingCriteria.count').replace('{count}', String(validCriteria.length))}
            </p>
          </div>
          <details className="rounded-lg border border-satin bg-surface-base/60 px-3 py-2 text-sm">
            <summary className="cursor-pointer font-medium text-foreground">{t('practice.setup.gradingCriteria.names')}</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              {validCriteria.map((criterion) => <li key={criterion.id}>{criterion.name}</li>)}
            </ul>
          </details>
          <Button type="button" variant="secondary" onClick={onEdit} disabled={Boolean(disabled || editDisabled)}>
            {t('practice.setup.gradingCriteria.edit')}
          </Button>
          {draftError ? <p role="alert" className="text-sm text-error">{draftError}</p> : null}
        </div>
      )}
    </PracticeWizardStepCard>
  );
}
