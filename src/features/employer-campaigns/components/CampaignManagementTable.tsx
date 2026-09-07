import { Link } from 'react-router-dom';
import { Eye, Send } from 'lucide-react';
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
        <Table className="min-w-[900px]">
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
              <TableRow key={campaign.id} className="group">
                <TableCell>
                  <p className="max-w-[320px] truncate font-semibold text-foreground">{campaign.title}</p>
                </TableCell>
                <TableCell>
                  <CampaignManagementStatusBadge status={campaign.status} />
                </TableCell>
                <TableCell>{formatDate(campaign.deadline, language)}</TableCell>
                <TableCell>
                  {campaign.cvCount ?? 0}/{campaign.capacity}
                </TableCell>
                <TableCell>{formatDate(campaign.updatedAt, language)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/employer/campaigns/${campaign.id}/overview?tab=candidates`}
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'border-foreground/30 bg-foreground/[0.06] text-foreground shadow-sm',
                        'hover:border-foreground/50 hover:bg-foreground/10',
                      )}
                    >
                      <Eye className="size-3.5" aria-hidden />
                      {t('employer.campaigns.list.view')}{' '}
                    </Link>
                    <Link
                        to={`/employer/campaigns/${campaign.id}/invitations?tab=cv-screening`}
                        className={cn(
                          buttonVariants({ size: 'sm' }),
                          'bg-foreground text-background shadow-sm',
                          'hover:bg-foreground/85',
                        )}
                      >
                        <Send className="size-3.5" aria-hidden />
                        {t('employer.campaigns.list.invite')}
                      </Link>
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
              </div>
              <CampaignManagementStatusBadge status={campaign.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-subtle py-3 text-xs">
              <div>
                <dt className="text-muted-foreground">{t('employer.campaigns.list.deadline')}</dt>
                <dd className="mt-1 font-medium text-foreground">{formatDate(campaign.deadline, language)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t('employer.campaigns.list.capacity')}</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {campaign.cvCount ?? 0}/{campaign.capacity}
                </dd>
              </div>
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                to={`/employer/campaigns/${campaign.id}/overview?tab=candidates`}
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
              >
                <Eye className="size-4" aria-hidden />
                {t('employer.campaigns.list.view')}
              </Link>
              <Link
                to={`/employer/campaigns/${campaign.id}/invitations?tab=cv-screening`}
                className={cn(buttonVariants(), 'w-full')}
              >
                <Send className="size-4" aria-hidden />
                {t('employer.campaigns.list.invite')}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
