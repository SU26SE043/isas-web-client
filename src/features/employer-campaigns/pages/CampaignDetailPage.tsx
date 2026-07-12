import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { CampaignManagementStatusBadge } from '../components/CampaignManagementStatusBadge';
import { InviteCandidatesDialog } from '../components/InviteCandidatesDialog';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';

export function CampaignDetailPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { campaign, isLoading, publish, invite } = useEmployerCampaign(id);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [published, setPublished] = useState(false);

  const handlePublish = async () => {
    if (!campaign) return;
    const result = await publish(campaign.id);
    setWarnings(result.warnings);
    setPublished(result.warnings.length === 0);
  };

  if (isLoading || !campaign) {
    return (
      <div className="h-full overflow-y-auto bg-surface-base">
        <div className="page-container page-section mx-auto max-w-6xl"><Skeleton className="h-96 w-full" /></div>
      </div>
    );
  }

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
              <p className="text-label text-muted-foreground">SCR-EMP-056</p>
            </div>
            <h1 className="heading-primary text-3xl text-foreground">{campaign.title}</h1>
            <p className="body-text max-w-3xl text-sm text-muted-foreground">{campaign.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {campaign.status === 'draft' ? (
              <Button variant="outline" render={<Link to={`/employer/campaigns/${campaign.id}/edit`} />}>
                {t('employer.campaigns.detail.edit')}
              </Button>
            ) : null}
            <Button onClick={handlePublish} disabled={campaign.status !== 'draft'}>{t('employer.campaigns.detail.publish')}</Button>
            <InviteCandidatesDialog onInvite={(emails) => invite(campaign.id, emails).then(() => undefined)} />
          </div>
        </header>

        {published ? <Alert variant="success"><AlertDescription>{t('employer.campaigns.detail.publishSuccess')}</AlertDescription></Alert> : null}
        {warnings.length > 0 ? (
          <Alert variant="warning">
            <AlertDescription>
              <p className="font-medium">{t('employer.campaigns.detail.publishBlocked')}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {warnings.map((warning) => <li key={warning}>{t(`employer.campaigns.detail.warning.${warning}`)}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <Card className="border border-subtle bg-surface-raised">
            <CardHeader><CardTitle>{t('employer.campaigns.detail.overview')}</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{campaign.jobDescription}</p>
              <div className="grid gap-3 md:grid-cols-3">
                <Info label={t('employer.campaigns.list.capacity')} value={`${campaign.applicants}/${campaign.capacity}`} />
                <Info
                  label={t('employer.campaigns.detail.duration')}
                  value={`${campaign.durationMinutes} ${t('employer.campaigns.detail.minutes')}`}
                />
                <Info label={t('employer.campaigns.detail.invited')} value={campaign.invitedEmails.length} />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-subtle bg-surface-raised">
            <CardHeader><CardTitle>{t('employer.campaigns.detail.settings')}</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <Info label={t('employer.campaigns.form.location')} value={campaign.location} />
              <Info label={t('employer.campaigns.form.deadline')} value={campaign.deadline} />
              <Info label={t('employer.campaigns.detail.locale')} value={campaign.locale.toUpperCase()} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border border-subtle bg-surface-raised">
            <CardHeader><CardTitle>{t('employer.campaigns.detail.rubric')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {campaign.rubric.map((item) => (
                <div key={item.id} className="rounded-xl border border-subtle bg-surface-overlay p-4">
                  <div className="flex justify-between gap-3 text-sm font-medium text-foreground">
                    <span>{item.name}</span><span>{item.weight}%</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border border-subtle bg-surface-raised">
            <CardHeader><CardTitle>{t('employer.campaigns.detail.questions')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {campaign.questions.map((question) => (
                <div key={question.id} className="flex gap-3 rounded-xl border border-subtle bg-surface-overlay p-4">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <p className="text-sm text-foreground">{question.prompt}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-subtle bg-surface-overlay p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}
