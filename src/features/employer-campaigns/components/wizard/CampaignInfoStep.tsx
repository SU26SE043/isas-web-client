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

export function CampaignInfoStep({
  info,
  error,
  onChange,
  onNext,
  onCancel,
  isSaving,
}: CampaignInfoStepProps) {
  const { t } = useLanguage();

  return (
    <SectionPanel
      icon={<Briefcase className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.info')}
      description={t('employer.campaigns.form.timezoneNote')}
      footer={
        <CampaignWizardNav
          onCancel={onCancel}
          onNext={onNext}
          isSaving={isSaving}
          nextDisabled={isSaving}
          backDisabled={isSaving}
        />
      }
    >
      <div className="space-y-6">
        {error ? <FieldError message={error} /> : null}

        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            {t('employer.campaigns.form.section.general')}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="campaign-title">{t('employer.campaigns.form.title')}</Label>
              <Input
                id="campaign-title"
                value={info.title}
                maxLength={255}
                placeholder={t('employer.campaigns.form.titlePlaceholder')}
                onChange={(e) => onChange({ title: e.target.value })}
                aria-invalid={!!error && !info.title.trim()}
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

            <div className="space-y-2">
              <Label htmlFor="campaign-language">{t('employer.campaigns.form.interviewLanguage')}</Label>
              <select
                id="campaign-language"
                className={selectClass}
                value={info.language ?? ''}
                onChange={(e) => onChange({ language: e.target.value as CampaignLanguage | '' })}
                aria-describedby="campaign-language-help"
              >
                <option value="">{t('employer.campaigns.form.interviewLanguagePlaceholder')}</option>
                <option value="vi">{t('employer.campaigns.form.interviewLanguage.vi')}</option>
                <option value="en">{t('employer.campaigns.form.interviewLanguage.en')}</option>
              </select>
              <p id="campaign-language-help" className="text-xs text-muted-foreground">
                {t('employer.campaigns.form.interviewLanguageHelp')}
              </p>
            </div>

            <details className="rounded-lg border border-satin bg-surface-overlay md:col-span-2">
              <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-foreground">
                {t('employer.campaigns.form.optionalSettings')}
              </summary>
              <div className="grid gap-4 border-t border-satin p-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="campaign-max">{t('employer.campaigns.form.maxCandidates')}</Label>
                  <Input
                    id="campaign-max"
                    type="number"
                    min={1}
                    step={1}
                    value={info.maxCandidates ?? ''}
                    placeholder={t('employer.campaigns.form.maxCandidatesPlaceholder')}
                    onChange={(e) => {
                      const raw = e.target.value;
                      onChange({ maxCandidates: raw === '' ? null : Math.max(1, Number(raw) || 1) });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-pass-score">{t('employer.campaigns.form.passScorePct')}</Label>
                  <div className="relative">
                    <Input
                      id="campaign-pass-score"
                      className="pr-8"
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={info.passScorePct ?? ''}
                      placeholder={t('employer.campaigns.form.passScorePlaceholder')}
                      onChange={(e) => {
                        const raw = e.target.value;
                        onChange({ passScorePct: raw === '' ? null : Number(raw) });
                      }}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                      {t('employer.campaigns.form.percentSuffix')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('employer.campaigns.form.passScoreHelp')}
                  </p>
                </div>
              </div>
            </details>
          </div>
        </section>

        <CampaignInfoScheduleSection info={info} onChange={onChange} />
      </div>
    </SectionPanel>
  );
}
