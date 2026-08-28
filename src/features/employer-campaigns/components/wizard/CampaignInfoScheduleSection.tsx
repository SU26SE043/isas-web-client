import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { CampaignInfoState } from '../../types/campaignWizard.types';

interface CampaignInfoScheduleSectionProps {
  info: CampaignInfoState;
  onChange: (patch: Partial<CampaignInfoState>) => void;
}

export function CampaignInfoScheduleSection({ info, onChange }: CampaignInfoScheduleSectionProps) {
  const { t } = useLanguage();

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        {t('employer.campaigns.form.section.schedule')}
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="campaign-starts">{t('employer.campaigns.form.startsAt')}</Label>
          <Input
            id="campaign-starts"
            type="datetime-local"
            value={info.startsAt}
            onChange={(e) => onChange({ startsAt: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaign-expires">{t('employer.campaigns.form.expiresAt')}</Label>
          <Input
            id="campaign-expires"
            type="datetime-local"
            value={info.expiresAt}
            onChange={(e) => onChange({ expiresAt: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('employer.campaigns.form.timezone')}</Label>
          <p className="rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm text-muted-foreground">
            {info.timezone || 'UTC'}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('employer.campaigns.form.timezoneHelp')}
          </p>
        </div>
      </div>
    </section>
  );
}
