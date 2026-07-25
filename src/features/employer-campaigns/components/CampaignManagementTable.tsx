import { Link } from 'react-router-dom';
import { ArrowRight, Pencil } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../types/campaignManagement.types';
import { CampaignManagementStatusBadge } from './CampaignManagementStatusBadge';

function formatDate(value: string, language: 'vi' | 'en') {
  return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function CampaignManagementTable({ campaigns }: { campaigns: EmployerCampaign[] }) {
  const { t, language } = useLanguage();

  return (
    <>
      <div className="hidden md:block">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead>{t('employer.campaigns.list.campaign')}</TableHead>
              <TableHead>{t('employer.campaigns.list.status')}</TableHead>
              <TableHead>{t('employer.campaigns.list.deadline')}</TableHead>
              <TableHead>{t('employer.campaigns.list.capacity')}</TableHead>
              <TableHead>{t('employer.campaigns.list.updated')}</TableHead>
              <TableHead>{t('employer.campaigns.list.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <p className="font-medium text-foreground">{campaign.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {campaign.location} · {t(`employer.campaigns.mode.${campaign.mode}`)}
                  </p>
                </TableCell>
                <TableCell>
                  <CampaignManagementStatusBadge status={campaign.status} />
                </TableCell>
                <TableCell>{formatDate(campaign.deadline, language)}</TableCell>
                <TableCell>
                  {campaign.applicants}/{campaign.capacity}
                </TableCell>
                <TableCell>{formatDate(campaign.updatedAt, language)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/employer/campaigns/${campaign.id}`}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                    >
                      {t('employer.campaigns.list.view')}{' '}
                      <ArrowRight className="size-3" aria-hidden />
                    </Link>
                    {campaign.status === 'draft' ? (
                      <Link
                        to={`/employer/campaigns/${campaign.id}/edit`}
                        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                      >
                        <Pencil className="size-3" aria-hidden />{' '}
                        {t('employer.campaigns.list.continueSetup')}
                      </Link>
                    ) : null}
                    {campaign.status === 'active' ? (
                      <Link
                        to={`/employer/campaigns/${campaign.id}/invite`}
                        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                      >
                        {t('employer.campaigns.list.invite')}
                      </Link>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {campaigns.map((campaign) => (
          <article
            key={campaign.id}
            className="frame-satin rounded-xl bg-surface-raised p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-foreground">{campaign.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{campaign.location}</p>
              </div>
              <CampaignManagementStatusBadge status={campaign.status} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{campaign.summary}</p>
            <Link
              to={`/employer/campaigns/${campaign.id}`}
              className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 w-full')}
            >
              {t('employer.campaigns.list.view')} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
