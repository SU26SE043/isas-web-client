import { useRef } from 'react';
import { FileText, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { JdAnalysisState } from '../../types/campaignWizard.types';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface CampaignJdStepProps {
  jd: JdAnalysisState;
  error?: string | null;
  onUpload: (file: File) => void;
  onChange: (patch: Partial<JdAnalysisState>) => void;
  onRetryAnalyze: () => void;
  onManualEntry: () => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

const ACCEPT = '.pdf,.doc,.docx,.txt,application/pdf,text/plain';

export function CampaignJdStep({
  jd,
  error,
  onUpload,
  onChange,
  onRetryAnalyze,
  onManualEntry,
  onBack,
  onNext,
  onSaveDraft,
  isSaving,
}: CampaignJdStepProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = jd.status === 'uploading' || jd.status === 'analyzing';

  const onFile = (file: File | undefined) => {
    if (!file || busy) return;
    onUpload(file);
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
          onSaveDraft={onSaveDraft}
          isSaving={isSaving}
        />
      }
    >
      <div className="space-y-5">
        {error ? <FieldError message={error} /> : null}

        <div
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-satin bg-surface-overlay/60 px-6 py-10 text-center',
            busy && 'opacity-70',
          )}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files?.[0]);
          }}
        >
          <Upload className="size-6 text-muted-foreground" aria-hidden />
          <p className="text-sm text-foreground">{t('employer.campaigns.wizard.jdDropzone')}</p>
          <p className="text-xs text-muted-foreground">{t('employer.campaigns.wizard.jdFormats')}</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <button
            type="button"
            className="btn-secondary"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {t('employer.campaigns.wizard.jdBrowse')}
          </button>
          <button type="button" className="btn-ghost text-sm" disabled={busy} onClick={onManualEntry}>
            {t('employer.campaigns.wizard.jdManual')}
          </button>
        </div>

        <div className="rounded-lg border border-satin bg-surface-overlay px-4 py-3 text-sm">
          <p className="font-medium text-foreground">
            {t(`employer.campaigns.wizard.jdStatus.${jd.status}`)}
          </p>
          {jd.fileName ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {jd.fileName}
              {jd.fileSize != null ? ` · ${Math.round(jd.fileSize / 1024)} KB` : ''}
            </p>
          ) : null}
          {jd.status === 'failed' ? (
            <button type="button" className="btn-secondary mt-3" onClick={onRetryAnalyze}>
              {t('employer.campaigns.wizard.jdRetry')}
            </button>
          ) : null}
        </div>

        {jd.status === 'ready' || jd.status === 'idle' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jd-job-title">{t('employer.campaigns.form.jobTitle')}</Label>
              <Input
                id="jd-job-title"
                value={jd.jobTitle}
                onChange={(e) => onChange({ jobTitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jd-years">{t('employer.campaigns.form.yearsExperience')}</Label>
              <Input
                id="jd-years"
                value={jd.yearsExperience}
                onChange={(e) => onChange({ yearsExperience: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="jd-summary">{t('employer.campaigns.form.jdSummary')}</Label>
              <textarea
                id="jd-summary"
                rows={4}
                className="w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm"
                value={jd.summary}
                onChange={(e) => onChange({ summary: e.target.value, status: 'ready' })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="jd-resp">{t('employer.campaigns.form.responsibilities')}</Label>
              <textarea
                id="jd-resp"
                rows={3}
                className="w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm"
                value={jd.responsibilities}
                onChange={(e) => onChange({ responsibilities: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jd-req">{t('employer.campaigns.form.requiredQualifications')}</Label>
              <textarea
                id="jd-req"
                rows={3}
                className="w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm"
                value={jd.requiredQualifications}
                onChange={(e) => onChange({ requiredQualifications: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jd-pref">{t('employer.campaigns.form.preferredQualifications')}</Label>
              <textarea
                id="jd-pref"
                rows={3}
                className="w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm"
                value={jd.preferredQualifications}
                onChange={(e) => onChange({ preferredQualifications: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="jd-skills">{t('employer.campaigns.form.technicalSkills')}</Label>
              <Input
                id="jd-skills"
                value={jd.technicalSkills.join(', ')}
                onChange={(e) =>
                  onChange({
                    technicalSkills: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          </div>
        ) : null}
      </div>
    </SectionPanel>
  );
}
