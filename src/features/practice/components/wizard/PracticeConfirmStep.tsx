import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { PRACTICE_RESERVE_ESTIMATE } from '@/features/payment/constants';
import { practiceLevelI18nKey } from '@/shared/domain/practiceLevels';
import type { PracticeDomain, PracticeLevel, PracticeRubricCriterion } from '../../types/practiceSetup.types';
import type { UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

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

  const rows = [
    { label: t('practice.wizard.confirm.domain'), value: domainLabel },
    { label: t('practice.wizard.confirm.level'), value: level ? t(`practice.wizard.level.${practiceLevelI18nKey(level)}`) : '—' },
    { label: t('practice.wizard.confirm.cv'), value: cvFile?.fileName ?? '—' },
    { label: t('practice.wizard.confirm.questions'), value: String(questionCount) },
    { label: t('practice.wizard.confirm.rubric'), value: rubric.map((item) => item.name).join(', ') || '—' },
    { label: t('practice.wizard.confirm.tokens'), value: PRACTICE_RESERVE_ESTIMATE.toLocaleString() },
  ];

  return (
    <PracticeWizardStepCard
      icon={<CheckCircle2 className="size-4" aria-hidden />}
      title={t('practice.wizard.confirm.title')}
      description={t('practice.wizard.confirm.description')}
      footer={
        <PracticeWizardNav
          onBack={onBack}
          onNext={onConfirm}
          nextLabel={t('practice.wizard.confirm.start')}
          nextDisabled={isSubmitting}
          isLoading={isSubmitting}
        />
      }
    >
      <dl className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="max-w-[60%] text-right font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </PracticeWizardStepCard>
  );
};
