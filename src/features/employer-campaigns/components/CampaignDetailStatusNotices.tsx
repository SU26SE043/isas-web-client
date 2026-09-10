import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../types/campaignManagement.types';

interface CampaignDetailStatusNoticesProps {
  campaign: EmployerCampaign;
  published: boolean;
  warnings: string[];
  formattedStart: string;
  onStartNow?: () => Promise<void>;
  startingNow?: boolean;
}

export function CampaignDetailStatusNotices({ campaign, published, warnings, formattedStart, onStartNow, startingNow = false }: CampaignDetailStatusNoticesProps) {
  const { t } = useLanguage();
  const start = campaign.startsAt ? new Date(campaign.startsAt) : null;
  const hasFutureStart = Boolean(start && !Number.isNaN(start.getTime()) && start.getTime() > Date.now());
  const daysLeft = start ? Math.max(0, Math.ceil((start.getTime() - Date.now()) / 86_400_000)) : 0;
  return <>
    {campaign.status === 'draft' ? <p className="rounded-lg border border-satin bg-surface-overlay px-4 py-3 text-sm text-muted-foreground">{t('employer.campaigns.detail.inviteAfterPublish')}</p> : null}
    {hasFutureStart ? <Alert variant="info"><AlertDescription className="flex flex-wrap items-center justify-between gap-3"><span>{t('employer.campaigns.detail.startsFuture').replace('{{time}}', formattedStart).replace('{{days}}', String(daysLeft))}</span>{campaign.status === 'active' && onStartNow ? <Button type="button" size="sm" variant="outline" disabled={startingNow} loading={startingNow} onClick={() => void onStartNow()}>{t('employer.campaigns.detail.startNow')}</Button> : null}</AlertDescription></Alert> : null}
    {published ? <Alert variant="success"><AlertDescription>{t('employer.campaigns.detail.publishSuccess')}</AlertDescription></Alert> : null}
    {warnings.length > 0 ? <Alert variant="warning"><AlertTitle>{t('employer.campaigns.detail.publishBlocked')}</AlertTitle><AlertDescription><ul className="mt-2 list-disc space-y-1 pl-5">{warnings.map((warning) => <li key={warning}>{warningText(warning, t)}</li>)}</ul></AlertDescription></Alert> : null}
  </>;
}

function warningText(warning: string, t: (key: string) => string): string {
  const key = `employer.campaigns.detail.warning.${warning}`;
  const translated = t(key);
  return translated === key ? warning : translated;
}
