import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../types/campaignManagement.types';
import { startNowBlocker } from '../utils/campaignStartNow';
import { StartCampaignNowDialog } from './StartCampaignNowDialog';

interface CampaignDetailStatusNoticesProps {
  campaign: EmployerCampaign;
  published: boolean;
  warnings: string[];
  formattedStart: string;
  onStartNow?: () => Promise<void>;
  startingNow?: boolean;
  /** Số ca thi của campaign — có ca ⇒ "Mở ngay" bị khoá (D-3), KHÔNG gọi API để nhận 409. */
  slotCount?: number;
}

export function CampaignDetailStatusNotices({ campaign, published, warnings, formattedStart, onStartNow, startingNow = false, slotCount = 0 }: CampaignDetailStatusNoticesProps) {
  const { t } = useLanguage();
  const start = campaign.startsAt ? new Date(campaign.startsAt) : null;
  const hasFutureStart = Boolean(start && !Number.isNaN(start.getTime()) && start.getTime() > Date.now());
  const daysLeft = start ? Math.max(0, Math.ceil((start.getTime() - Date.now()) / 86_400_000)) : 0;
  // Nút chỉ render khi Active + giờ mở còn ở tương lai (hai vế đã gác ở JSX) ⇒ blocker còn lại là CÓ CA.
  const blocker = startNowBlocker({ status: campaign.status, startsAt: campaign.startsAt, slotCount });
  const startNowReason = blocker === 'hasSlots'
    ? t('employer.campaigns.detail.startNowBlockedHasSlots').replace('{{n}}', String(slotCount))
    : null;
  return <>
    {campaign.status === 'draft' ? <p className="rounded-lg border border-satin bg-surface-overlay px-4 py-3 text-sm text-muted-foreground">{t('employer.campaigns.detail.inviteAfterPublish')}</p> : null}
    {hasFutureStart ? <Alert variant="info"><AlertDescription className="flex flex-wrap items-center justify-between gap-3"><span>{t('employer.campaigns.detail.startsFuture').replace('{{time}}', formattedStart).replace('{{days}}', String(daysLeft))}</span>{campaign.status === 'active' && onStartNow ? <StartCampaignNowDialog formattedStart={formattedStart} onConfirm={onStartNow} busy={startingNow} disabledReason={startNowReason} /> : null}</AlertDescription></Alert> : null}
    {published ? <Alert variant="success"><AlertDescription>{t('employer.campaigns.detail.publishSuccess')}</AlertDescription></Alert> : null}
    {warnings.length > 0 ? <Alert variant="warning"><AlertTitle>{t('employer.campaigns.detail.publishBlocked')}</AlertTitle><AlertDescription><ul className="mt-2 list-disc space-y-1 pl-5">{warnings.map((warning) => <li key={warning}>{warningText(warning, t)}</li>)}</ul></AlertDescription></Alert> : null}
  </>;
}

function warningText(warning: string, t: (key: string) => string): string {
  const key = `employer.campaigns.detail.warning.${warning}`;
  const translated = t(key);
  return translated === key ? warning : translated;
}
