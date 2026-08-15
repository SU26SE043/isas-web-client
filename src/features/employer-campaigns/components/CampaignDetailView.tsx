/* Hallmark · pre-emit critique: P4 H5 E4 S5 R4 V4 */
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CalendarDays,
  Clock3,
  LayoutGrid,
  ListChecks,
  MessageSquareText,
  Settings,
  Trophy,
  UsersRound,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import { CampaignDetailActions } from './CampaignDetailActions';
import { CampaignAttachmentsCard } from './CampaignAttachmentsCard';
import { CampaignSlotsPanel } from './slots/CampaignSlotsPanel';
import { CampaignDetailMetric } from './CampaignDetailMetric';
import { CampaignOverviewDescription } from './CampaignOverviewDescription';
import { CollapsibleDetailCard } from './CollapsibleDetailCard';
import type { CampaignStatusUpdateRequest } from '../types/campaign.api.types';
import type { EmployerCampaign } from '../types/campaignManagement.types';
interface CampaignDetailViewProps {
  campaign: EmployerCampaign;
  published: boolean;
  warnings: string[];
  onPublish: () => Promise<void>;
  onChangeStatus: (status: CampaignStatusUpdateRequest['status']) => Promise<void>;
  onDelete?: () => Promise<void>;
  embedded?: boolean;
}

export function CampaignDetailView({
  campaign,
  published,
  warnings,
  onPublish,
  onChangeStatus,
  onDelete,
  embedded = false,
}: CampaignDetailViewProps) {
  const { t, language } = useLanguage();
  const isDraft = campaign.status === 'draft';
  const hasDetailActions =
    campaign.status === 'draft' ||
    campaign.status === 'closed' ||
    campaign.status === 'archived';
  const formattedDeadline = new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(campaign.deadline));
  const formattedStart = campaign.startsAt
    ? new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(campaign.startsAt))
    : '—';

  const content = (
    <div className="space-y-4">
        {hasDetailActions ? <div className="flex justify-end">
          <CampaignDetailActions
            campaign={campaign}
            onPublish={onPublish}
            onChangeStatus={onChangeStatus}
            onDelete={onDelete}
          />
        </div> : null}

        {isDraft ? (
          <p className="rounded-lg border border-satin bg-surface-overlay px-4 py-3 text-sm text-muted-foreground">
            {t('employer.campaigns.detail.inviteAfterPublish')}
          </p>
        ) : null}

        {published ? (
          <Alert variant="success">
            <AlertDescription>{t('employer.campaigns.detail.publishSuccess')}</AlertDescription>
          </Alert>
        ) : null}
        {warnings.length > 0 ? (
          <Alert variant="warning">
            <AlertDescription>
              <p className="font-medium">{t('employer.campaigns.detail.publishBlocked')}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {warnings.map((warning) => (
                  <li key={warning}>{t(`employer.campaigns.detail.warning.${warning}`)}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
          <Card className="frame-satin bg-info/[0.035]">
            <CardHeader className="pb-3">
              <IconTitle icon={LayoutGrid} tone="info">
                {t('employer.campaigns.detail.overview')}
              </IconTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <CampaignOverviewDescription
                description={
                  campaign.jobDescription || t('employer.campaigns.detail.noJobDescription')
                }
              />
              <div className="grid gap-3 md:grid-cols-3">
                <CampaignDetailMetric
                  icon={UsersRound}
                  label={t('employer.campaigns.list.capacity')}
                  value={`${campaign.applicants}/${campaign.capacity}`}
                />
                <CampaignDetailMetric
                  icon={Clock3}
                  label={t('employer.campaigns.form.duration')}
                  value={`${campaign.durationMinutes}`}
                />
                <CampaignDetailMetric
                  icon={MessageSquareText}
                  label={t('employer.campaigns.form.questionsUnit')}
                  value={`${campaign.questions.length}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="frame-satin bg-surface-raised">
            <CardHeader className="pb-3">
              <IconTitle icon={Settings} tone="info">
                {t('employer.campaigns.detail.settings')}
              </IconTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0 text-info-light" aria-hidden />
                <span>{t('employer.campaigns.form.startsAt')}:</span>
                <strong className="font-semibold text-foreground">{formattedStart}</strong>
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0 text-info-light" aria-hidden />
                <span>{t('employer.campaigns.form.deadline')}:</span>
                <strong className="font-semibold text-foreground">{formattedDeadline}</strong>
              </p>
              <p className="flex items-center gap-2">
                <Building2 className="size-4 shrink-0 text-info-light" aria-hidden />
                <span>{t('employer.campaigns.form.company')}:</span>
                <strong className="font-semibold text-foreground">{campaign.company}</strong>
              </p>
              <p className="text-muted-foreground">
                {t('employer.campaigns.form.passScorePct')}:{' '}
                <strong className="font-semibold text-foreground">
                  {campaign.passScorePct != null ? `${campaign.passScorePct}%` : '—'}
                </strong>
              </p>
              <p className="text-muted-foreground">
                {t('employer.campaigns.form.antiCheat')}:{' '}
                <strong className="font-semibold text-foreground">
                  {campaign.antiCheatEnabled
                    ? t('employer.campaigns.detail.enabled')
                    : t('employer.campaigns.detail.disabled')}
                </strong>
              </p>
              <p className="text-muted-foreground">
                {t('employer.campaigns.form.faceVerify')}:{' '}
                <strong className="font-semibold text-foreground">
                  {campaign.faceVerifyEnabled
                    ? t('employer.campaigns.detail.enabled')
                    : t('employer.campaigns.detail.disabled')}
                </strong>
              </p>
            </CardContent>
          </Card>
        </div>

        <CampaignSlotsPanel campaignId={campaign.id} editable={isDraft} />

        <CampaignAttachmentsCard campaignId={campaign.id} />

        <CollapsibleDetailCard
          title={t('employer.campaigns.detail.rubric')}
          icon={Trophy}
          className="frame-satin bg-chart-cat-6/[0.035]"
        >
          <div className="space-y-3">
            {campaign.rubric.map((item) => (
              <div key={item.id} className="rounded-lg border border-satin bg-surface-overlay px-3 py-2">
                <p className="text-sm font-medium text-foreground">
                  {item.name} ·{' '}
                  {Number(item.weight) <= 1
                    ? `${Math.round(Number(item.weight) * 100)}%`
                    : `${item.weight}%`}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </CollapsibleDetailCard>
        <CollapsibleDetailCard
          title={t('employer.campaigns.detail.questions')}
          icon={ListChecks}
          className="frame-satin bg-chart-cat-6/[0.025]"
        >
          <div className="space-y-2">
            {campaign.questions.map((item, index) => (
              <p key={item.id} className="text-sm text-foreground">
                {index + 1}. {item.prompt}
              </p>
            ))}
          </div>
        </CollapsibleDetailCard>
      </div>
  );

  if (embedded) return content;

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-[1440px]">{content}</div>
    </div>
  );
}

function IconTitle({
  children,
  icon: Icon,
  tone,
}: {
  children: React.ReactNode;
  icon: LucideIcon;
  tone: 'info' | 'violet';
}) {
  const toneClass =
    tone === 'info'
      ? 'border-info/30 bg-info/15 text-info-light'
      : 'border-chart-cat-6/30 bg-chart-cat-6/15 text-chart-cat-6';
  return (
    <CardTitle className="flex items-center gap-3">
      <span className={`flex size-9 items-center justify-center rounded-lg border ${toneClass}`}>
        <Icon className="size-4" aria-hidden />
      </span>
      {children}
    </CardTitle>
  );
}
