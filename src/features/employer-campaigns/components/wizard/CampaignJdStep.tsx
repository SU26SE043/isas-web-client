import { useState } from 'react';
import { FileText } from 'lucide-react';
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
import type { JobDescriptionState, JobDescriptionMethod } from '../../types/campaignWizard.types';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';
import {
  JobDescriptionFilePanel,
  validateCampaignJdPdf,
} from './jd/JobDescriptionFilePanel';
import { JobDescriptionMethodTabs } from './jd/JobDescriptionMethodTabs';
import { JobDescriptionTextEditor } from './jd/JobDescriptionTextEditor';

interface CampaignJdStepProps {
  jd: JobDescriptionState;
  error?: string | null;
  onChange: (patch: Partial<JobDescriptionState>) => void;
  onRetryUpload?: () => void;
  onBack: () => void;
  onNext: () => void;
  isSaving?: boolean;
}

export function CampaignJdStep({
  jd,
  error,
  onChange,
  onRetryUpload,
  onBack,
  onNext,
  isSaving,
}: CampaignJdStepProps) {
  const { t } = useLanguage();
  const [pendingMethod, setPendingMethod] = useState<JobDescriptionMethod | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const localError =
    jd.inputMethod === 'file'
      ? jd.fileError
        ? t(`employer.campaigns.wizard.jdFileError.${jd.fileError}`)
        : null
      : null;

  const requestMethodChange = (next: JobDescriptionMethod) => {
    if (next === jd.inputMethod) return;
    const hasFile = Boolean(jd.jdFile || jd.fileName);
    const hasText = Boolean(jd.jdText.trim());
    if ((jd.inputMethod === 'file' && hasFile) || (jd.inputMethod === 'text' && hasText)) {
      setPendingMethod(next);
      return;
    }
    onChange({ inputMethod: next });
  };

  const confirmMethodChange = () => {
    if (!pendingMethod) return;
    onChange({ inputMethod: pendingMethod });
    setPendingMethod(null);
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      onChange({
        jdFile: null,
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
      onChange({
        jdFile: null,
        fileName: file.name,
        fileSize: file.size,
        fileStatus: 'failed',
        fileError: code,
        uploadProgress: null,
      });
      return;
    }
    onChange({
      jdFile: file,
      fileName: file.name,
      fileSize: file.size,
      fileStatus: 'selected',
      fileError: null,
      uploadProgress: null,
      inputMethod: 'file',
    });
  };

  return (
    <SectionPanel
      icon={<FileText className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.jd')}
      description={t('employer.campaigns.wizard.steps.jdDesc')}
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onNext={onNext}
          isSaving={isSaving}
          nextDisabled={isSaving || jd.fileStatus === 'uploading'}
          backDisabled={isSaving || jd.fileStatus === 'uploading'}
        />
      }
    >
      <div className="mx-auto w-full max-w-[960px] space-y-5">
        {error ? <FieldError message={error} /> : null}

        <JobDescriptionMethodTabs
          active={jd.inputMethod}
          fileLabel={t('employer.campaigns.wizard.jdTab.file')}
          textLabel={t('employer.campaigns.wizard.jdTab.text')}
          listLabel={t('employer.campaigns.wizard.jdTab.list')}
          onChange={requestMethodChange}
          disabled={jd.fileStatus === 'uploading'}
        />

        {jd.inputMethod === 'file' ? (
          <JobDescriptionFilePanel
            file={jd.jdFile}
            fileName={jd.fileName}
            fileSize={jd.fileSize}
            status={jd.fileStatus}
            progress={jd.uploadProgress}
            error={localError}
            dropTitle={t('employer.campaigns.wizard.jdDropzone')}
            dropSecondary={t('employer.campaigns.wizard.jdDropSecondary')}
            chooseFileLabel={t('employer.campaigns.wizard.jdBrowse')}
            changeFileLabel={t('employer.campaigns.wizard.jdReplace')}
            removeLabel={t('employer.campaigns.wizard.jdRemove')}
            pendingLabel={t('employer.campaigns.wizard.jdPendingUpload')}
            uploadingLabel={t('employer.campaigns.wizard.jdUploading')}
            successLabel={t('employer.campaigns.wizard.jdUploadSuccess')}
            failureLabel={t('employer.campaigns.wizard.jdUploadFailed')}
            retryLabel={t('employer.campaigns.wizard.jdRetryUpload')}
            chooseOtherLabel={t('employer.campaigns.wizard.jdChooseOther')}
            supportLabel={t('employer.campaigns.wizard.jdFormats')}
            onFileSelect={handleFileSelect}
            onRetry={onRetryUpload}
            disabled={jd.fileStatus === 'uploading'}
          />
        ) : (
          <JobDescriptionTextEditor
            value={jd.jdText}
            onChange={(jdText) => onChange({ jdText, inputMethod: 'text' })}
            label={t('employer.campaigns.wizard.jdTextLabel')}
            placeholder={t('employer.campaigns.wizard.jdTextPlaceholder')}
            helper={t('employer.campaigns.wizard.jdTextHelp')}
            clearLabel={t('employer.campaigns.wizard.jdTextClear')}
            charsLabel={t('employer.campaigns.wizard.jdCharCount')}
            wordsLabel={t('employer.campaigns.wizard.jdWordCount')}
            onClear={() => {
              if (jd.jdText.trim()) setClearConfirmOpen(true);
              else onChange({ jdText: '' });
            }}
          />
        )}
      </div>

      <Dialog open={pendingMethod != null} onOpenChange={(open) => !open && setPendingMethod(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('employer.campaigns.wizard.jdSwitchTitle')}</DialogTitle>
            <DialogDescription>
              {pendingMethod === 'text'
                ? t('employer.campaigns.wizard.jdSwitchToText')
                : t('employer.campaigns.wizard.jdSwitchToFile')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingMethod(null)}>
              {t('employer.campaigns.wizard.jdSwitchCancel')}
            </Button>
            <Button type="button" onClick={confirmMethodChange}>
              {pendingMethod === 'text'
                ? t('employer.campaigns.wizard.jdSwitchConfirmText')
                : t('employer.campaigns.wizard.jdSwitchConfirmFile')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('employer.campaigns.wizard.jdClearTitle')}</DialogTitle>
            <DialogDescription>{t('employer.campaigns.wizard.jdClearDesc')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setClearConfirmOpen(false)}>
              {t('employer.campaigns.wizard.jdSwitchCancel')}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onChange({ jdText: '' });
                setClearConfirmOpen(false);
              }}
            >
              {t('employer.campaigns.wizard.jdTextClear')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionPanel>
  );
}
