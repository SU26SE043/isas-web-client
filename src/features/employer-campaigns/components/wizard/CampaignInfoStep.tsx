import { Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignInfoState } from '../../types/campaignWizard.types';
import type { CampaignLanguage } from '../../types/campaign.api.types';
import { CAMPAIGN_DOMAIN_OPTIONS, type CampaignDomainOption } from './campaignWizard.steps';
import { CampaignInfoScheduleSection } from './CampaignInfoScheduleSection';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';
import { WizardSection } from './WizardSection';

interface CampaignInfoStepProps {
  info: CampaignInfoState;
  error?: string | null;
  onChange: (patch: Partial<CampaignInfoState>) => void;
  onNext: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const selectClass =
  'h-9 w-full rounded-lg border border-satin bg-surface-overlay px-3 text-sm text-foreground outline-none focus-visible:border-[var(--border-focus)]';

export function CampaignInfoStep({ info, error, onChange, onNext, onCancel, isSaving }: CampaignInfoStepProps) {
  const { t } = useLanguage();
  const f = 'employer.campaigns.form';

  return (
    <SectionPanel
      icon={<Briefcase className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.info')}
      description={t(`${f}.timezoneNote`)}
      footer={
        <CampaignWizardNav onCancel={onCancel} onNext={onNext} isSaving={isSaving} nextDisabled={isSaving} backDisabled={isSaving} />
      }
    >
      <div className="space-y-5">
        {error ? <FieldError message={error} /> : null}

        <WizardSection title={t(`${f}.group.position`)} hint={t(`${f}.group.positionHint`)}>
          <div className="grid gap-4 @xs:grid-cols-2">
            <div className="space-y-1.5 @xs:col-span-2">
              <Label htmlFor="campaign-title">{t(`${f}.title`)}</Label>
              <Input
                id="campaign-title"
                value={info.title}
                maxLength={255}
                placeholder={t(`${f}.titlePlaceholder`)}
                onChange={(e) => onChange({ title: e.target.value })}
                aria-invalid={!!error && !info.title.trim()}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campaign-domain">{t(`${f}.domain`)}</Label>
              <select
                id="campaign-domain"
                className={selectClass}
                value={info.domain}
                onChange={(e) => onChange({ domain: e.target.value as CampaignDomainOption | '' })}
              >
                <option value="">{t(`${f}.domainPlaceholder`)}</option>
                {CAMPAIGN_DOMAIN_OPTIONS.map((domain) => (
                  <option key={domain} value={domain}>{t(`${f}.domain.${domain}`)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campaign-language">{t(`${f}.interviewLanguage`)}</Label>
              <select
                id="campaign-language"
                className={selectClass}
                value={info.language ?? ''}
                onChange={(e) => onChange({ language: e.target.value as CampaignLanguage | '' })}
              >
                <option value="">{t(`${f}.interviewLanguagePlaceholder`)}</option>
                <option value="vi">{t(`${f}.interviewLanguage.vi`)}</option>
                <option value="en">{t(`${f}.interviewLanguage.en`)}</option>
              </select>
            </div>
          </div>
        </WizardSection>

        <CampaignInfoScheduleSection info={info} onChange={onChange} />
      </div>
    </SectionPanel>
  );
}
