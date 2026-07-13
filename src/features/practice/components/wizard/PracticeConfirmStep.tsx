import React from 'react';
import { useLanguage } from '@/shared/languages';
import { PRACTICE_RESERVE_ESTIMATE } from '@/features/payment/constants';
import type { PracticeDomain, PracticeLevel, PracticeRubricCriterion } from '../../types/practiceSetup.types';
import type { UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import { PracticeWizardNav } from './PracticeWizardNav';

interface PracticeConfirmStepProps {
  domain?: PracticeDomain;
  level: PracticeLevel | '';
  cvFile?: UploadedCvFile;
  questionCount: number;
  rubric: PracticeRubricCriterion[];
  isSubmitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export const PracticeConfirmStep: React.FC<PracticeConfirmStepProps> = ({
  domain,
  level,
  cvFile,
  questionCount,
  rubric,
  isSubmitting,
  onBack,
  onConfirm,
}) => {
  const { language, t } = useLanguage();
  const domainLabel = domain ? (language === 'vi' ? domain.nameVi : domain.name) : '—';

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('practice.wizard.confirm.title')}</h2>
      <p className="body-text mt-1 text-sm">{t('practice.wizard.confirm.description')}</p>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-subtle pb-3">
          <dt className="text-muted-foreground">{t('practice.wizard.confirm.domain')}</dt>
          <dd className="text-right font-medium text-foreground">{domainLabel}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-subtle pb-3">
          <dt className="text-muted-foreground">{t('practice.wizard.confirm.level')}</dt>
          <dd className="text-right font-medium text-foreground">
            {level ? t(`practice.wizard.level.${level}`) : '—'}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-subtle pb-3">
          <dt className="text-muted-foreground">{t('practice.wizard.confirm.cv')}</dt>
          <dd className="text-right font-medium text-foreground">{cvFile?.fileName ?? '—'}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-subtle pb-3">
          <dt className="text-muted-foreground">{t('practice.wizard.confirm.questions')}</dt>
          <dd className="text-right font-medium text-foreground">{questionCount}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-subtle pb-3">
          <dt className="text-muted-foreground">{t('practice.wizard.confirm.rubric')}</dt>
          <dd className="text-right font-medium text-foreground">
            {rubric.map((item) => item.name).join(', ')}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{t('practice.wizard.confirm.tokens')}</dt>
          <dd className="text-right font-medium text-foreground">
            {PRACTICE_RESERVE_ESTIMATE.toLocaleString()}
          </dd>
        </div>
      </dl>

      <PracticeWizardNav
        onBack={onBack}
        onNext={onConfirm}
        nextLabel={t('practice.wizard.confirm.start')}
        nextDisabled={isSubmitting}
        isLoading={isSubmitting}
      />
    </section>
  );
};
