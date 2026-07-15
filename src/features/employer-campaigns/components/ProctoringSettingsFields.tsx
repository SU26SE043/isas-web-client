import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { CampaignProctoringConfig } from '../types/campaignManagement.types';

interface ProctoringSettingsFieldsProps {
  value: CampaignProctoringConfig;
  onChange: (next: CampaignProctoringConfig) => void;
}

export function ProctoringSettingsFields({ value, onChange }: ProctoringSettingsFieldsProps) {
  const { t } = useLanguage();

  return (
    <section className="space-y-4 rounded-xl border border-subtle bg-surface-overlay p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{t('employer.campaigns.form.proctoringTitle')}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{t('employer.campaigns.form.proctoringHelp')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="faceCaptureIntervalSeconds">{t('employer.campaigns.form.faceInterval')}</Label>
          <Input
            id="faceCaptureIntervalSeconds"
            type="number"
            min={30}
            value={value.faceCaptureIntervalSeconds}
            onChange={(event) =>
              onChange({ ...value, faceCaptureIntervalSeconds: Number(event.target.value) })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="faceSimilarityThreshold">{t('employer.campaigns.form.faceThreshold')}</Label>
          <Input
            id="faceSimilarityThreshold"
            type="number"
            min={0.1}
            max={1}
            step={0.05}
            value={value.faceSimilarityThreshold}
            onChange={(event) =>
              onChange({ ...value, faceSimilarityThreshold: Number(event.target.value) })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxViolations">{t('employer.campaigns.form.maxViolations')}</Label>
          <Input
            id="maxViolations"
            type="number"
            min={1}
            value={value.maxViolations}
            onChange={(event) => onChange({ ...value, maxViolations: Number(event.target.value) })}
          />
        </div>
      </div>
    </section>
  );
}
