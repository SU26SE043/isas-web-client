import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { CampaignInfoState } from '../../types/campaignWizard.types';

interface CampaignInfoScheduleSectionProps {
  info: CampaignInfoState;
  onChange: (patch: Partial<CampaignInfoState>) => void;
}

function scheduleDays(startsAt: string, expiresAt: string): number | null {
  if (!startsAt || !expiresAt) return null;
  const start = new Date(startsAt).getTime();
  const end = new Date(expiresAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

export function CampaignInfoScheduleSection({ info, onChange }: CampaignInfoScheduleSectionProps) {
  const { t } = useLanguage();
  const openDays = scheduleDays(info.startsAt, info.expiresAt);

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
          <Label htmlFor="campaign-tz">{t('employer.campaigns.form.timezone')}</Label>
          <Input
            id="campaign-tz"
            value={info.timezone}
            onChange={(e) => onChange({ timezone: e.target.value })}
          />
        </div>
      </div>
      <div className="rounded-lg border border-satin bg-surface-overlay px-4 py-3 text-sm">
        <p className="font-medium text-foreground">{t('employer.campaigns.form.deadlineSummary')}</p>
        <p className="mt-1 text-muted-foreground">
          {openDays != null
            ? t('employer.campaigns.form.openDays').replace('{days}', String(openDays))
            : t('employer.campaigns.form.openDaysPending')}
        </p>
      </div>
    </section>
  );
}
