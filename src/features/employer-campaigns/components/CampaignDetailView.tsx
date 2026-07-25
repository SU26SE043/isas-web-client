/* Hallmark · pre-emit critique: P4 H5 E4 S5 R4 V4 */
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
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
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import { CampaignDetailActions } from './CampaignDetailActions';
import { CampaignTalentTabs } from './screening/CampaignTalentTabs';
import { CampaignManagementStatusBadge } from './CampaignManagementStatusBadge';
import type { CampaignStatusUpdateRequest } from '../types/campaign.api.types';
import type { EmployerCampaign, InviteResolution } from '../types/campaignManagement.types';

interface CampaignDetailViewProps {
  campaign: EmployerCampaign;
  published: boolean;
  warnings: string[];
  onPublish: () => Promise<void>;
  onChangeStatus: (status: CampaignStatusUpdateRequest['status']) => Promise<void>;
  onDelete?: () => Promise<void>;
  onInvite?: (emails: string[]) => Promise<InviteResolution>;
}

export function CampaignDetailView({
  campaign,
  published,
  warnings,
  onPublish,
  onChangeStatus,
  onDelete,
}: CampaignDetailViewProps) {
  const { t, language } = useLanguage();
  const isActive = campaign.status === 'active';
  const isDraft = campaign.status === 'draft';
  const formattedDeadline = new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(campaign.deadline));

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-[1440px] space-y-4">
        <Link
          to="/employer/campaigns"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t('employer.campaigns.detail.back')}
        </Link>

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <CampaignManagementStatusBadge status={campaign.status} />
              {isDraft ? (
                <span className="text-xs text-muted-foreground">
                  {t('employer.campaigns.detail.previewHint')}
                </span>
              ) : null}
            </div>
            <h1 className="heading-primary max-w-4xl text-3xl text-foreground sm:text-4xl">
              {campaign.title}
            </h1>
            <p className="max-w-3xl text-sm font-medium leading-relaxed text-foreground/90">
              {campaign.summary || campaign.jobDescription.slice(0, 180)}
            </p>
          </div>

          <CampaignDetailActions
            campaign={campaign}
            onPublish={onPublish}
            onChangeStatus={onChangeStatus}
            onDelete={onDelete}
          />
        </header>

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
              <p className="font-medium leading-relaxed text-foreground/90">
                {campaign.jobDescription || t('employer.campaigns.detail.noJobDescription')}
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <Info
                  icon={UsersRound}
                  label={t('employer.campaigns.list.capacity')}
                  value={`${campaign.applicants}/${campaign.capacity}`}
                />
                <Info
                  icon={Clock3}
                  label={t('employer.campaigns.form.duration')}
                  value={`${campaign.durationMinutes}`}
                />
                <Info
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
                <span>{t('employer.campaigns.form.deadline')}:</span>
                <strong className="font-semibold text-foreground">{formattedDeadline}</strong>
              </p>
              <p className="flex items-center gap-2">
                <Building2 className="size-4 shrink-0 text-info-light" aria-hidden />
                <span>{t('employer.campaigns.form.company')}:</span>
                <strong className="font-semibold text-foreground">{campaign.company}</strong>
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="frame-satin bg-chart-cat-6/[0.035]">
          <CardHeader className="pb-3">
            <IconTitle icon={Trophy} tone="violet">
              {t('employer.campaigns.detail.rubric')}
            </IconTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>

        <Card className="frame-satin bg-chart-cat-6/[0.025]">
          <CardHeader className="pb-3">
            <IconTitle icon={ListChecks} tone="violet">
              {t('employer.campaigns.detail.questions')}
            </IconTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {campaign.questions.map((item, index) => (
              <p key={item.id} className="text-sm text-foreground">
                {index + 1}. {item.prompt}
              </p>
            ))}
          </CardContent>
        </Card>

        {!isDraft ? (
          <CampaignTalentTabs
            campaignId={campaign.id}
            isActive={isActive}
            passScorePct={campaign.passScorePct}
          />
        ) : null}
      </div>
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

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-info/15 bg-info/[0.05] px-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info-light">
        <Icon className="size-4" aria-hidden />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
