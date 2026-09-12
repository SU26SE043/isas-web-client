import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CampaignManagementStatusBadge } from '@/features/employer-campaigns/components/CampaignManagementStatusBadge';
import { useLanguage } from '@/shared/languages';
import type { EmployerAnalyticsCampaignRow } from '../types/employerAnalytics.types';
import { toCampaignStatusChip } from '../utils/employerAnalyticsMetrics';
import { AnalyticsCard } from './AnalyticsCard';

/** Đường tới trang tổng quan chiến dịch — nơi đã có xếp hạng + xuất CSV/PDF (không xuất toàn org ở đây). */
export function campaignOverviewPath(campaignId: string) {
  return `/employer/campaigns/${encodeURIComponent(campaignId)}/overview`;
}

const NUMERIC_COLUMNS = ['invited', 'joined', 'started', 'scored', 'passed'] as const;

export function EmployerAnalyticsCampaignTable({ rows }: { rows: EmployerAnalyticsCampaignRow[] }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));

  return (
    <AnalyticsCard title={t('employerAnalytics.campaigns.title')} description={t('employerAnalytics.campaigns.description')}>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('employerAnalytics.campaigns.empty')}</p>
      ) : (
        <Table className="min-w-[44rem]">
          <TableHeader>
            <TableRow>
              <TableHead>{t('employerAnalytics.campaigns.campaign')}</TableHead>
              <TableHead>{t('employerAnalytics.campaigns.status')}</TableHead>
              {NUMERIC_COLUMNS.map((column) => (
                <TableHead key={column} className="text-right">{t(`employerAnalytics.campaigns.${column}`)}</TableHead>
              ))}
              <TableHead className="text-right">{t('employerAnalytics.campaigns.median')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.campaignId}>
                <TableCell>
                  <Link to={campaignOverviewPath(row.campaignId)} className="font-medium text-foreground underline-offset-4 hover:underline focus-ring">
                    {row.title.trim() || t('employerAnalytics.campaigns.untitled')}
                  </Link>
                  <p className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</p>
                </TableCell>
                <TableCell>
                  <CampaignManagementStatusBadge status={toCampaignStatusChip(row.status)} />
                </TableCell>
                {NUMERIC_COLUMNS.map((column) => (
                  <TableCell key={column} className="text-right tabular-nums text-foreground">
                    {row[column].toLocaleString(locale)}
                  </TableCell>
                ))}
                <TableCell className="text-right tabular-nums text-foreground">
                  {row.medianScore == null ? '—' : row.medianScore.toLocaleString(locale, { maximumFractionDigits: 1 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </AnalyticsCard>
  );
}
