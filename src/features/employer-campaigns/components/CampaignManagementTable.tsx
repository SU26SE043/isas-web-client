import { Link } from 'react-router-dom';
import { ArrowRight, Pencil } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../types/campaignManagement.types';
import { CampaignManagementStatusBadge } from './CampaignManagementStatusBadge';

function formatDate(value: string, language: 'vi' | 'en') {
  return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium' }).format(new Date(value));
}

export function CampaignManagementTable({ campaigns }: { campaigns: EmployerCampaign[] }) {
  const { t, language } = useLanguage();

  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardContent className="p-0">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-sm">
            <thead className="border-b border-subtle bg-surface-base text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t('employer.campaigns.list.campaign')}</th>
                <th className="px-4 py-3">{t('employer.campaigns.list.status')}</th>
                <th className="px-4 py-3">{t('employer.campaigns.list.deadline')}</th>
                <th className="px-4 py-3">{t('employer.campaigns.list.capacity')}</th>
                <th className="px-4 py-3">{t('employer.campaigns.list.updated')}</th>
                <th className="px-4 py-3">{t('employer.campaigns.list.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-subtle last:border-b-0">
                  <td className="px-4 py-4">
                    <p className="font-medium text-foreground">{campaign.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {campaign.location} · {t(`employer.campaigns.mode.${campaign.mode}`)}
                    </p>
                  </td>
                  <td className="px-4 py-4"><CampaignManagementStatusBadge status={campaign.status} /></td>
                  <td className="px-4 py-4 text-muted-foreground">{formatDate(campaign.deadline, language)}</td>
                  <td className="px-4 py-4 text-muted-foreground">{campaign.applicants}/{campaign.capacity}</td>
                  <td className="px-4 py-4 text-muted-foreground">{formatDate(campaign.updatedAt, language)}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Link to={`/employer/campaigns/${campaign.id}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                        {t('employer.campaigns.list.view')} <ArrowRight className="size-3" aria-hidden />
                      </Link>
                      {campaign.status === 'draft' ? (
                        <Link to={`/employer/campaigns/${campaign.id}/edit`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                          <Pencil className="size-3" aria-hidden /> {t('employer.campaigns.list.continueSetup')}
                        </Link>
                      ) : null}
                      {campaign.status === 'active' ? (
                        <Link to={`/employer/campaigns/${campaign.id}/invite`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                          {t('employer.campaigns.list.invite')}
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-4 md:hidden">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="rounded-xl border border-subtle bg-surface-overlay p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-foreground">{campaign.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{campaign.location}</p>
                </div>
                <CampaignManagementStatusBadge status={campaign.status} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{campaign.summary}</p>
              <Link to={`/employer/campaigns/${campaign.id}`} className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 w-full')}>
                {t('employer.campaigns.list.view')} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
