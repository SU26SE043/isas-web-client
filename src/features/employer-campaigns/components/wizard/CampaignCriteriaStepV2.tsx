import { ClipboardList } from 'lucide-react';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { RubricCriterion } from '../../types/campaignManagement.types';
import type { CriteriaFileState } from '../../types/campaignWizard.types';
import { CampaignCriteriaManualList } from './CampaignCriteriaManualList';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';
import { CampaignRubricTotalWeight } from './criteria/CampaignRubricTotalWeight';
import { CampaignFilePanel } from './jd/CampaignFilePanel';

interface CampaignCriteriaStepV2Props {
  rubric: RubricCriterion[];
  criteria: CriteriaFileState;
  contextLabel: string;
  error?: string | null;
  canReplace?: boolean;
  onChangeRubric: (rubric: RubricCriterion[]) => void;
  onSelectFile: (file: File | null) => void;
  onRetryUpload?: () => void;
  onDownload?: () => void;
  onReset: () => void;
  onBack: () => void;
  onNext: () => void;
  isSaving?: boolean;
}

/** Manual rubric plus optional criteria PDF (uploaded immediately when selected). */
export function CampaignCriteriaStepV2({
  rubric,
  criteria,
  contextLabel,
  error,
  canReplace = true,
  onChangeRubric,
  onSelectFile,
  onRetryUpload,
  onDownload,
  onReset,
  onBack,
  onNext,
  isSaving,
}: CampaignCriteriaStepV2Props) {
  const { t } = useLanguage();
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  const totalMaxScore = rubric.reduce((sum, item) => sum + Number(item.maxScore || 0), 0);
  const weightValid = Math.round(totalWeight * 10) / 10 === 100;
  const maxScoreValid = rubric.every(
    (item) => Number.isFinite(item.maxScore) && item.maxScore >= 1 && item.maxScore <= 10,
  );
  const hasEmptyName = rubric.some((item) => !item.name.trim());
  const fileBusy = criteria.fileStatus === 'uploading' || criteria.fileStatus === 'replacing';
  const canNext =
    weightValid && maxScoreValid && rubric.length > 0 && !hasEmptyName && !isSaving && !fileBusy;
  const localError = criteria.fileError
    ? t(`employer.campaigns.wizard.criteriaFileError.${criteria.fileError}`)
    : null;

  return (
    <SectionPanel
      icon={<ClipboardList className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.criteria')}
      headerAside={
        <CampaignRubricTotalWeight
          totalWeight={totalWeight}
          totalMaxScore={totalMaxScore}
          weightValid={weightValid}
          maxScoreValid={maxScoreValid}
          resetDisabled={Boolean(isSaving) || fileBusy}
          onReset={onReset}
        />
      }
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onNext={onNext}
          isSaving={isSaving}
          nextDisabled={!canNext}
          backDisabled={Boolean(isSaving) || fileBusy}
        />
      }
    >
      <div className="space-y-6">
        {error ? <FieldError message={error} /> : null}

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            {t('employer.campaigns.files.criteria.title')}
          </h3>
          <CampaignFilePanel
            file={criteria.criteriaFile}
            fileName={criteria.fileName}
            fileSize={criteria.fileSize}
            status={criteria.fileStatus}
            progress={criteria.uploadProgress}
            error={localError}
            isDownloading={criteria.isDownloading}
            canReplace={canReplace}
            replaceDisabledReason={t('employer.campaigns.files.errors.draftOnly')}
            dropTitle={t('employer.campaigns.wizard.criteriaDropzone')}
            dropSecondary={t('employer.campaigns.wizard.criteriaDropSecondary')}
            chooseFileLabel={t('employer.campaigns.files.criteria.select')}
            replaceLabel={t('employer.campaigns.files.criteria.replace')}
            downloadLabel={t('employer.campaigns.files.criteria.download')}
            downloadingLabel={t('employer.campaigns.files.status.downloading')}
            uploadingLabel={t('employer.campaigns.files.status.uploading')}
            replacingLabel={t('employer.campaigns.files.status.replacing')}
            successLabel={t('employer.campaigns.files.status.uploaded')}
            failureLabel={t('employer.campaigns.wizard.criteriaUploadFailed')}
            retryLabel={t('employer.campaigns.wizard.jdRetryUpload')}
            chooseOtherLabel={t('employer.campaigns.wizard.jdChooseOther')}
            supportLabel={t('employer.campaigns.wizard.jdFormats')}
            onFileSelect={onSelectFile}
            onRetry={onRetryUpload}
            onDownload={onDownload}
            disabled={fileBusy}
          />
        </div>

        <CampaignCriteriaManualList
          rubric={rubric}
          contextLabel={contextLabel}
          disabled={Boolean(isSaving) || fileBusy}
          onChangeRubric={onChangeRubric}
        />
      </div>
    </SectionPanel>
  );
}
