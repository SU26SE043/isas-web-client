import { CalendarClock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DateTimeLocalInput } from '@/components/ui/date-time-local-input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { CampaignInfoState } from '../../types/campaignWizard.types';
import { WizardSection } from './WizardSection';

interface CampaignInfoScheduleSectionProps {
  info: CampaignInfoState;
  onChange: (patch: Partial<CampaignInfoState>) => void;
}

/** Số ngày chiến dịch mở. `null` khi chưa đủ hai mốc hoặc mốc sau không lớn hơn mốc trước. */
export function campaignOpenDays(startsAt: string, expiresAt: string): number | null {
  if (!startsAt || !expiresAt) return null;
  const from = new Date(startsAt).getTime();
  const to = new Date(expiresAt).getTime();
  if (Number.isNaN(from) || Number.isNaN(to) || to <= from) return null;
  return Math.max(1, Math.round((to - from) / 86_400_000));
}

export function CampaignInfoScheduleSection({ info, onChange }: CampaignInfoScheduleSectionProps) {
  const { t } = useLanguage();
  const f = 'employer.campaigns.form';
  const days = campaignOpenDays(info.startsAt, info.expiresAt);

  return (
    <WizardSection divided title={t(`${f}.group.schedule`)} hint={t(`${f}.group.scheduleHint`)}>
      <div className="grid gap-4 @xs:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="campaign-starts">{t(`${f}.startsAt`)}</Label>
          <DateTimeLocalInput
            id="campaign-starts"
            value={info.startsAt}
            datePlaceholder={t(`${f}.datePlaceholder`)}
            dateAriaLabel={t(`${f}.dateAriaLabel`)}
            timeAriaLabel={t(`${f}.timeAriaLabel`)}
            dateErrorMessage={t(`${f}.dateInvalid`)}
            onChange={(value) => onChange({ startsAt: value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="campaign-expires">{t(`${f}.expiresAt`)}</Label>
          <DateTimeLocalInput
            id="campaign-expires"
            value={info.expiresAt}
            datePlaceholder={t(`${f}.datePlaceholder`)}
            dateAriaLabel={t(`${f}.dateAriaLabel`)}
            timeAriaLabel={t(`${f}.timeAriaLabel`)}
            dateErrorMessage={t(`${f}.dateInvalid`)}
            onChange={(value) => onChange({ expiresAt: value })}
          />
        </div>
      </div>

      {/* Số ngày là thứ SUY RA được, và là thứ HR thật sự muốn biết. Bắt họ tự trừ hai mốc
          để phát hiện "lỡ đặt 3 ngày" là đẩy phép tính sang phía người dùng. */}
      {days != null ? (
        <Alert variant="info">
          <AlertDescription className="flex items-center gap-2 text-xs">
            <CalendarClock className="size-4 shrink-0" aria-hidden />
            <span>{t(`${f}.openDays`).replace('{days}', String(days))}</span>
          </AlertDescription>
        </Alert>
      ) : null}
    </WizardSection>
  );
}
