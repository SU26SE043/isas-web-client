import { Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignInfoState } from '../../types/campaignWizard.types';
import {
  CAMPAIGN_DOMAIN_OPTIONS,
  CAMPAIGN_TARGET_LEVELS,
  type CampaignDomainOption,
  type CampaignTargetLevel,
} from './campaignWizard.steps';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface CampaignInfoStepProps {
  info: CampaignInfoState;
  error?: string | null;
  onChange: (patch: Partial<CampaignInfoState>) => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

const selectClass =
  'h-9 w-full rounded-lg border border-satin bg-surface-overlay px-3 text-sm text-foreground outline-none focus-visible:border-[var(--border-focus)]';

export function CampaignInfoStep({
  info,
  error,
  onChange,
  onNext,
  onSaveDraft,
  isSaving,
}: CampaignInfoStepProps) {
  const { t } = useLanguage();

  return (
    <SectionPanel
      icon={<Briefcase className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.info')}
      description={t('employer.campaigns.wizard.steps.infoDesc')}
      footer={
        <CampaignWizardNav
          backDisabled
          onNext={onNext}
          onSaveDraft={onSaveDraft}
          isSaving={isSaving}
        />
      }
    >
      <div className="space-y-4">
        {error ? <FieldError message={error} /> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="campaign-name">{t('employer.campaigns.form.name')}</Label>
            <Input
              id="campaign-name"
              value={info.name}
              onChange={(e) => onChange({ name: e.target.value })}
              aria-invalid={!!error && !info.name.trim()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-domain">{t('employer.campaigns.form.domain')}</Label>
            <select
              id="campaign-domain"
              className={selectClass}
              value={info.domain}
              onChange={(e) =>
                onChange({ domain: e.target.value as CampaignDomainOption | '' })
              }
            >
              <option value="">{t('employer.campaigns.form.domainPlaceholder')}</option>
              {CAMPAIGN_DOMAIN_OPTIONS.map((domain) => (
                <option key={domain} value={domain}>
                  {t(`employer.campaigns.form.domain.${domain}`)}
                </option>
              ))}
            </select>
          </div>

          {info.domain === 'other' ? (
            <div className="space-y-2">
              <Label htmlFor="campaign-custom-domain">
                {t('employer.campaigns.form.customDomain')}
              </Label>
              <Input
                id="campaign-custom-domain"
                value={info.customDomain}
                onChange={(e) => onChange({ customDomain: e.target.value })}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="campaign-level">{t('employer.campaigns.form.targetLevel')}</Label>
            <select
              id="campaign-level"
              className={selectClass}
              value={info.targetLevel}
              onChange={(e) =>
                onChange({ targetLevel: e.target.value as CampaignTargetLevel | '' })
              }
            >
              <option value="">{t('employer.campaigns.form.targetLevelPlaceholder')}</option>
              {CAMPAIGN_TARGET_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-job-title">{t('employer.campaigns.form.jobTitle')}</Label>
            <Input
              id="campaign-job-title"
              value={info.jobTitle}
              onChange={(e) => onChange({ jobTitle: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-hire-count">{t('employer.campaigns.form.hireCount')}</Label>
            <Input
              id="campaign-hire-count"
              type="number"
              min={1}
              value={info.hireCount}
              onChange={(e) => onChange({ hireCount: Math.max(1, Number(e.target.value) || 1) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-start">{t('employer.campaigns.form.startDate')}</Label>
            <Input
              id="campaign-start"
              type="date"
              value={info.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-end">{t('employer.campaigns.form.endDate')}</Label>
            <Input
              id="campaign-end"
              type="date"
              value={info.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-join">{t('employer.campaigns.form.joinDeadline')}</Label>
            <Input
              id="campaign-join"
              type="date"
              value={info.joinDeadline}
              onChange={(e) => onChange({ joinDeadline: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-tz">{t('employer.campaigns.form.timezone')}</Label>
            <Input
              id="campaign-tz"
              value={info.timezone}
              onChange={(e) => onChange({ timezone: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="campaign-desc">{t('employer.campaigns.form.description')}</Label>
            <textarea
              id="campaign-desc"
              rows={4}
              className="w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm"
              value={info.description}
              onChange={(e) => onChange({ description: e.target.value })}
            />
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
