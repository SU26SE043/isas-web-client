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
import type {
  CampaignHardFiltersState,
  JobDescriptionState,
  JobDescriptionMethod,
} from '../../types/campaignWizard.types';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';
import { CampaignCriteriaTextField } from './jd/CampaignCriteriaTextField';
import { CampaignHardFilterSection } from './CampaignHardFilterSection';
import { CampaignFilePanel } from './jd/CampaignFilePanel';
import { JobDescriptionMethodTabs } from './jd/JobDescriptionMethodTabs';
import { JobDescriptionTextEditor } from './jd/JobDescriptionTextEditor';

interface CampaignJdStepProps {
  jd: JobDescriptionState;
  hardFilters: CampaignHardFiltersState;
  isDraft: boolean;
  error?: string | null;
  canReplace?: boolean;
  onChange: (patch: Partial<JobDescriptionState>) => void;
  onHardFiltersChange: (patch: Partial<CampaignHardFiltersState>) => void;
  onSelectFile: (file: File | null) => void;
  onRetryUpload?: () => void;
  onDownload?: () => void;
  onBack: () => void;
  onNext: () => void;
  isSaving?: boolean;
}

export function CampaignJdStep({
  jd,
  hardFilters,
  isDraft,
  error,
  canReplace = true,
  onChange,
  onHardFiltersChange,
  onSelectFile,
  onRetryUpload,
  onDownload,
  onBack,
  onNext,
  isSaving,
}: CampaignJdStepProps) {
  const { t } = useLanguage();
  const [pendingMethod, setPendingMethod] = useState<JobDescriptionMethod | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const fileBusy = jd.fileStatus === 'uploading' || jd.fileStatus === 'replacing';
  const localError =
    jd.inputMethod === 'file' && jd.fileError
      ? t(`employer.campaigns.wizard.jdFileError.${jd.fileError}`)
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

  return (
    <SectionPanel
      icon={<FileText className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.jd')}
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onNext={onNext}
          isSaving={isSaving}
          nextDisabled={isSaving || fileBusy}
          backDisabled={isSaving || fileBusy}
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
          disabled={fileBusy}
        />

        {jd.inputMethod === 'file' ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">
              {t('employer.campaigns.files.jd.title')}
            </h3>
            <CampaignFilePanel
              file={jd.jdFile}
              fileName={jd.fileName}
              fileSize={jd.fileSize}
              status={jd.fileStatus}
              progress={jd.uploadProgress}
              error={localError}
              isDownloading={jd.isDownloading}
              canReplace={canReplace}
              replaceDisabledReason={t('employer.campaigns.files.errors.draftOnly')}
              dropTitle={t('employer.campaigns.wizard.jdDropzone')}
              dropSecondary={t('employer.campaigns.wizard.jdDropSecondary')}
              chooseFileLabel={t('employer.campaigns.files.jd.select')}
              replaceLabel={t('employer.campaigns.files.jd.replace')}
              downloadLabel={t('employer.campaigns.files.jd.download')}
              downloadingLabel={t('employer.campaigns.files.status.downloading')}
              uploadingLabel={t('employer.campaigns.files.status.uploading')}
              replacingLabel={t('employer.campaigns.files.status.replacing')}
              successLabel={t('employer.campaigns.files.status.uploaded')}
              failureLabel={t('employer.campaigns.wizard.jdUploadFailed')}
              retryLabel={t('employer.campaigns.wizard.jdRetryUpload')}
              chooseOtherLabel={t('employer.campaigns.wizard.jdChooseOther')}
              supportLabel={t('employer.campaigns.wizard.jdFormats')}
              onFileSelect={onSelectFile}
              onRetry={onRetryUpload}
              onDownload={onDownload}
              disabled={fileBusy}
            />
          </div>
        ) : (
          <JobDescriptionTextEditor
            value={jd.jdText}
            onChange={(jdText) => onChange({ jdText, inputMethod: 'text' })}
            label={t('employer.campaigns.wizard.jdTextLabel')}
            placeholder={t('employer.campaigns.wizard.jdTextPlaceholder')}
            clearLabel={t('employer.campaigns.wizard.jdTextClear')}
            charsLabel={t('employer.campaigns.wizard.jdCharCount')}
            wordsLabel={t('employer.campaigns.wizard.jdWordCount')}
            onClear={() => {
              if (jd.jdText.trim()) setClearConfirmOpen(true);
              else onChange({ jdText: '' });
            }}
          />
        )}

        <CampaignCriteriaTextField
          value={jd.criteriaText}
          onChange={(criteriaText) => onChange({ criteriaText })}
        />
        {isDraft ? (
          <CampaignHardFilterSection value={hardFilters} onChange={onHardFiltersChange} />
        ) : null}
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
