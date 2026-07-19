import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { RubricCriterion } from '../../types/campaignManagement.types';
import type { CriteriaFileState, CriteriaInputMethod } from '../../types/campaignWizard.types';
import { CampaignCriteriaManualList } from './CampaignCriteriaManualList';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';
import { CampaignRubricTotalWeight } from './criteria/CampaignRubricTotalWeight';
import {
  JobDescriptionFilePanel,
  validateCampaignJdPdf,
} from './jd/JobDescriptionFilePanel';
import { JobDescriptionMethodTabs } from './jd/JobDescriptionMethodTabs';

interface CampaignCriteriaStepV2Props {
  rubric: RubricCriterion[];
  criteria: CriteriaFileState;
  contextLabel: string;
  error?: string | null;
  onChangeRubric: (rubric: RubricCriterion[]) => void;
  onChangeCriteria: (patch: Partial<CriteriaFileState>) => void;
  onUploadFile?: (file: File) => void;
  onRetryUpload?: () => void;
  onReset: () => void;
  onBack: () => void;
  onNext: () => void;
  isSaving?: boolean;
}

export function CampaignCriteriaStepV2({
  rubric,
  criteria,
  contextLabel,
  error,
  onChangeRubric,
  onChangeCriteria,
  onUploadFile,
  onRetryUpload,
  onReset,
  onBack,
  onNext,
  isSaving,
}: CampaignCriteriaStepV2Props) {
  const { t } = useLanguage();
  const [pendingMethod, setPendingMethod] = useState<CriteriaInputMethod | null>(null);
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  const totalMaxScore = rubric.reduce((sum, item) => sum + Number(item.maxScore || 0), 0);
  const weightValid = Math.round(totalWeight * 10) / 10 === 100;
  const maxScoreValid = rubric.every(
    (item) => Number.isFinite(item.maxScore) && item.maxScore >= 1 && item.maxScore <= 10,
  );
  const hasEmptyName = rubric.some((item) => !item.name.trim());
  const isFile = criteria.inputMethod === 'file';
  const canNext = isFile
    ? criteria.fileStatus === 'uploaded' && !isSaving
    : weightValid && maxScoreValid && rubric.length > 0 && !hasEmptyName && !isSaving;
  const localError =
    isFile && criteria.fileError
      ? t(`employer.campaigns.wizard.criteriaFileError.${criteria.fileError}`)
      : null;

  const requestMethodChange = (next: CriteriaInputMethod) => {
    if (next === criteria.inputMethod) return;
    const hasFile = Boolean(criteria.criteriaFile || criteria.fileName);
    const hasManual = rubric.some((item) => item.name.trim());
    if ((criteria.inputMethod === 'file' && hasFile) || (criteria.inputMethod === 'manual' && hasManual)) {
      setPendingMethod(next);
      return;
    }
    onChangeCriteria({ inputMethod: next });
  };

  const confirmMethodChange = () => {
    if (!pendingMethod) return;
    onChangeCriteria({ inputMethod: pendingMethod });
    setPendingMethod(null);
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      onChangeCriteria({
        criteriaFile: null,
        fileName: null,
        fileSize: null,
        fileStatus: 'idle',
        fileError: null,
        uploadProgress: null,
      });
      return;
    }
    const code = validateCampaignJdPdf(file);
    if (code) {
      onChangeCriteria({
        criteriaFile: null,
        fileName: file.name,
        fileSize: file.size,
        fileStatus: 'failed',
        fileError: code,
        uploadProgress: null,
      });
      return;
    }
    onChangeCriteria({
      criteriaFile: file,
      fileName: file.name,
      fileSize: file.size,
      fileStatus: 'selected',
      fileError: null,
      uploadProgress: null,
      inputMethod: 'file',
    });
    onUploadFile?.(file);
  };

  return (
    <SectionPanel
      icon={<ClipboardList className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.criteria')}
      description={t('employer.campaigns.wizard.steps.criteriaDesc')}
      headerAside={
        !isFile ? (
          <CampaignRubricTotalWeight
            totalWeight={totalWeight}
            totalMaxScore={totalMaxScore}
            weightValid={weightValid}
            maxScoreValid={maxScoreValid}
            resetDisabled={Boolean(isSaving)}
            onReset={onReset}
          />
        ) : null
      }
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onNext={onNext}
          isSaving={isSaving}
          nextDisabled={!canNext || criteria.fileStatus === 'uploading'}
          backDisabled={Boolean(isSaving) || criteria.fileStatus === 'uploading'}
        />
      }
    >
      <div className="space-y-4">
        {error ? <FieldError message={error} /> : null}

        <JobDescriptionMethodTabs
          active={isFile ? 'file' : 'text'}
          fileLabel={t('employer.campaigns.wizard.criteriaTab.file')}
          textLabel={t('employer.campaigns.wizard.criteriaTab.manual')}
          listLabel={t('employer.campaigns.wizard.criteriaTab.list')}
          onChange={(method) => requestMethodChange(method === 'file' ? 'file' : 'manual')}
          disabled={criteria.fileStatus === 'uploading'}
        />

        {isFile ? (
          <JobDescriptionFilePanel
            file={criteria.criteriaFile}
            fileName={criteria.fileName}
            fileSize={criteria.fileSize}
            status={criteria.fileStatus}
            progress={criteria.uploadProgress}
            error={localError}
            dropTitle={t('employer.campaigns.wizard.criteriaDropzone')}
            dropSecondary={t('employer.campaigns.wizard.criteriaDropSecondary')}
            chooseFileLabel={t('employer.campaigns.wizard.jdBrowse')}
            changeFileLabel={t('employer.campaigns.wizard.jdReplace')}
            removeLabel={t('employer.campaigns.wizard.jdRemove')}
            pendingLabel={t('employer.campaigns.wizard.jdPendingUpload')}
            uploadingLabel={t('employer.campaigns.wizard.jdUploading')}
            successLabel={t('employer.campaigns.wizard.jdUploadSuccess')}
            failureLabel={t('employer.campaigns.wizard.criteriaUploadFailed')}
            retryLabel={t('employer.campaigns.wizard.jdRetryUpload')}
            chooseOtherLabel={t('employer.campaigns.wizard.jdChooseOther')}
            supportLabel={t('employer.campaigns.wizard.jdFormats')}
            onFileSelect={handleFileSelect}
            onRetry={onRetryUpload}
            disabled={criteria.fileStatus === 'uploading'}
          />
        ) : (
          <CampaignCriteriaManualList
            rubric={rubric}
            contextLabel={contextLabel}
            disabled={Boolean(isSaving)}
            onChangeRubric={onChangeRubric}
          />
        )}
      </div>

      <Dialog open={pendingMethod != null} onOpenChange={(open) => !open && setPendingMethod(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('employer.campaigns.wizard.criteriaSwitchTitle')}</DialogTitle>
            <DialogDescription>
              {pendingMethod === 'manual'
                ? t('employer.campaigns.wizard.criteriaSwitchToManual')
                : t('employer.campaigns.wizard.criteriaSwitchToFile')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingMethod(null)}>
              {t('employer.campaigns.wizard.jdSwitchCancel')}
            </Button>
            <Button type="button" onClick={confirmMethodChange}>
              {pendingMethod === 'manual'
                ? t('employer.campaigns.wizard.criteriaTab.manual')
                : t('employer.campaigns.wizard.criteriaTab.file')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionPanel>
  );
}
