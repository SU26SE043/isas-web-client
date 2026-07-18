import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import { CampaignCandidateTable } from './CampaignCandidateTable';
import { CampaignManagementStatusBadge } from './CampaignManagementStatusBadge';
import { DeleteCampaignDialog } from './DeleteCampaignDialog';
import { PublishCampaignDialog } from './PublishCampaignDialog';
import type { EmployerCampaign, InviteResolution } from '../types/campaignManagement.types';

interface CampaignDetailViewProps {
  campaign: EmployerCampaign;
  published: boolean;
  warnings: string[];
  onPublish: () => Promise<void>;
  onDelete?: () => Promise<void>;
  onInvite?: (emails: string[]) => Promise<InviteResolution>;
}

export function CampaignDetailView({
  campaign,
  published,
  warnings,
  onPublish,
  onDelete,
}: CampaignDetailViewProps) {
  const { t } = useLanguage();
  const isActive = campaign.status === 'active';
  const isDraft = campaign.status === 'draft';

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-6">
        <Link to="/employer/campaigns" className="text-sm text-muted-foreground hover:text-foreground">
          {t('employer.campaigns.detail.back')}
        </Link>

        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <CampaignManagementStatusBadge status={campaign.status} />
              {isDraft ? (
                <span className="text-xs text-muted-foreground">
                  {t('employer.campaigns.detail.previewHint')}
                </span>
              ) : null}
            </div>
            <h1 className="heading-primary text-3xl text-foreground">{campaign.title}</h1>
            <p className="body-text max-w-3xl text-sm text-muted-foreground">
              {campaign.summary || campaign.jobDescription.slice(0, 180)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isDraft ? (
              <>
                <Button variant="outline" render={<Link to={`/employer/campaigns/${campaign.id}/edit`} />}>
                  {t('employer.campaigns.detail.edit')}
                </Button>
                <PublishCampaignDialog onPublish={onPublish} />
                {onDelete ? (
                  <DeleteCampaignDialog campaignTitle={campaign.title} onDelete={onDelete} />
                ) : null}
              </>
            ) : null}

            {isActive ? (
              <>
                <Button render={<Link to={`/employer/campaigns/${campaign.id}/invite`} />}>
                  {t('employer.campaigns.detail.inviteCandidates')}
                </Button>
                <Button
                  variant="outline"
                  render={<Link to={`/employer/campaigns/${campaign.id}/candidates`} />}
                >
                  {t('employer.campaigns.detail.pipeline')}
                </Button>
              </>
            ) : null}

            {!isActive && !isDraft ? (
              <Button
                variant="outline"
                render={<Link to={`/employer/campaigns/${campaign.id}/candidates`} />}
              >
                {t('employer.campaigns.detail.pipeline')}
              </Button>
            ) : null}
          </div>
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

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <Card className="border border-subtle bg-surface-raised">
            <CardHeader>
              <CardTitle>{t('employer.campaigns.detail.overview')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{campaign.jobDescription || t('employer.campaigns.detail.noJobDescription')}</p>
              <div className="grid gap-3 md:grid-cols-3">
                <Info
                  label={t('employer.campaigns.list.capacity')}
                  value={`${campaign.applicants}/${campaign.capacity}`}
                />
                <Info
                  label={t('employer.campaigns.form.duration')}
                  value={`${campaign.durationMinutes}`}
                />
                <Info
                  label={t('employer.campaigns.form.questionsUnit')}
                  value={`${campaign.questions.length}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-subtle bg-surface-raised">
            <CardHeader>
              <CardTitle>{t('employer.campaigns.detail.settings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                {t('employer.campaigns.form.deadline')}: {campaign.deadline}
              </p>
              <p>
                {t('employer.campaigns.form.company')}: {campaign.company}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-subtle bg-surface-raised">
          <CardHeader>
            <CardTitle>{t('employer.campaigns.detail.rubric')}</CardTitle>
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

        <Card className="border border-subtle bg-surface-raised">
          <CardHeader>
            <CardTitle>{t('employer.campaigns.detail.questions')}</CardTitle>
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
          <Card className="border border-subtle bg-surface-raised">
            <CardHeader>
              <CardTitle>{t('employer.campaigns.detail.candidates')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CampaignCandidateTable candidates={campaign.candidates} />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-satin bg-surface-overlay px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}
