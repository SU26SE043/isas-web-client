import { CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type { UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import type { FileRecord } from '@/features/cv-analysis/types/cvAnalysis.types';
import type {
  CreatePracticeSessionErrorCode,
  PracticeJobCategory,
  PracticeTimeLimitSec,
} from '../../types/b2cPracticeSession.types';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

const JOB_LABEL: Record<PracticeJobCategory, string> = {
  FE: 'practice.setup.jobCategory.FE',
  BE: 'practice.setup.jobCategory.BE',
  BA: 'practice.setup.jobCategory.BA',
};

const TIME_LABEL: Record<PracticeTimeLimitSec, string> = {
  60: 'practice.setup.timeLimit.60',
  120: 'practice.setup.timeLimit.120',
  240: 'practice.setup.timeLimit.240',
};

interface PracticeSetupSummaryStepProps {
  jobCategory: PracticeJobCategory | null;
  cvFile: UploadedCvFile | null;
  jdFile: FileRecord | null;
  jdText: string;
  jdTab: 'file' | 'text';
  timeLimitSec: PracticeTimeLimitSec;
  questionCount: number;
  canStart: boolean;
  isCreating: boolean;
  errorCode: CreatePracticeSessionErrorCode | null;
  errorMessage: string | null;
  onBack: () => void;
  onStart: () => void;
  onClearError: () => void;
}

function createErrorKey(code: CreatePracticeSessionErrorCode): string {
  switch (code) {
    case 'job_category_required':
      return 'practice.errors.jobCategoryRequired';
    case 'invalid_time_limit':
      return 'practice.errors.invalidTimeLimit';
    case 'invalid_question_count':
      return 'practice.errors.invalidQuestionCount';
    case 'jd_too_long':
      return 'practice.errors.jdTooLong';
    case 'insufficient_credit':
      return 'practice.errors.insufficientCredit';
    case 'ai_failed':
      return 'practice.errors.aiFailed';
    case 'platform_capacity':
      return 'practice.errors.platformCapacity';
    case 'create_failed':
      return 'practice.errors.createSessionFailed';
    default:
      return 'practice.errors.createSessionFailed';
  }
}

export function PracticeSetupSummaryStep({
  jobCategory,
  cvFile,
  jdFile,
  jdText,
  jdTab,
  timeLimitSec,
  questionCount,
  canStart,
  isCreating,
  errorCode,
  errorMessage,
  onBack,
  onStart,
  onClearError,
}: PracticeSetupSummaryStepProps) {
  const { t } = useLanguage();

  const jdSummary =
    jdTab === 'text' && jdText.trim()
      ? t('practice.setup.summary.jdText')
      : jdFile
        ? jdFile.originalName
        : t('practice.setup.summary.noJd');

  const rows = [
    {
      label: t('practice.setup.summary.jobCategory'),
      value: jobCategory ? t(JOB_LABEL[jobCategory]) : '—',
    },
    {
      label: t('practice.setup.summary.cv'),
      value: cvFile?.fileName ?? t('practice.setup.summary.noCv'),
    },
    { label: t('practice.setup.summary.jd'), value: jdSummary },
    {
      label: t('practice.setup.summary.questionCount'),
      value: String(questionCount),
    },
    {
      label: t('practice.setup.summary.timeLimit'),
      value: t(TIME_LABEL[timeLimitSec]),
    },
    {
      label: t('practice.setup.summary.credit'),
      value: t('practice.setup.summary.creditValue'),
    },
  ];

  if (errorCode === 'insufficient_credit') {
    return (
      <div className="frame-satin rounded-xl border border-satin bg-surface-raised p-6 text-center">
        <h2 className="heading-primary text-xl text-foreground">
          {t('practice.errors.insufficientCredit')}
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/candidate/credits" className="btn-primary">
            {t('practice.setup.buyCredit')}
          </Link>
          <button type="button" className="btn-secondary" onClick={onClearError}>
            {t('practice.setup.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <PracticeWizardStepCard
      icon={<CheckCircle2 className="size-4" aria-hidden />}
      title={t('practice.setup.summary.title')}
      description={t('practice.setup.summary.description')}
      footer={
        <PracticeWizardNav
          onBack={onBack}
          onNext={onStart}
          nextLabel={t('practice.setup.start')}
          nextDisabled={!canStart || isCreating}
          isLoading={isCreating}
          backDisabled={isCreating}
        />
      }
    >
      {isCreating ? (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl border border-satin bg-surface-overlay px-4 py-3 text-sm text-foreground"
          aria-live="polite"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t('practice.setup.creating')}
        </div>
      ) : null}

      {errorCode ? (
        <p className="mb-4 text-sm text-error" role="alert">
          {errorMessage?.trim() || t(createErrorKey(errorCode))}
        </p>
      ) : null}

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
}
