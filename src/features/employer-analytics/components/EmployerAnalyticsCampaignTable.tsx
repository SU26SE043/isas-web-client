import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CampaignManagementStatusBadge } from '@/features/employer-campaigns/components/CampaignManagementStatusBadge';
import { useLanguage } from '@/shared/languages';
import type { EmployerAnalyticsCampaignRow } from '../types/employerAnalytics.types';
import { hasCampaignActivity, toCampaignStatusChip } from '../utils/employerAnalyticsMetrics';
import { AnalyticsCard } from './AnalyticsCard';

/** Đường tới trang tổng quan chiến dịch — nơi đã có xếp hạng + xuất CSV/PDF (không xuất toàn org ở đây). */
export function campaignOverviewPath(campaignId: string) {
  return `/employer/campaigns/${encodeURIComponent(campaignId)}/overview`;
}

const NUMERIC_COLUMNS = ['invited', 'joined', 'started', 'scored', 'passed'] as const;

export function EmployerAnalyticsCampaignTable({ rows: allRows }: { rows: EmployerAnalyticsCampaignRow[] }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
  const [showIdle, setShowIdle] = useState(false);
  const idleCount = useMemo(() => allRows.filter((row) => !hasCampaignActivity(row)).length, [allRows]);
  // Mặc định chỉ chiến dịch có ứng viên trong phễu; bản nháp/trống mở bằng công tắc (xem hasCampaignActivity).
  const rows = useMemo(() => (showIdle ? allRows : allRows.filter(hasCampaignActivity)), [allRows, showIdle]);

  return (
    <AnalyticsCard title={t('employerAnalytics.campaigns.title')} description={t('employerAnalytics.campaigns.description')}>
      {idleCount > 0 ? (
        <label className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="size-4 rounded border-satin accent-foreground"
            checked={showIdle}
            onChange={(event) => setShowIdle(event.target.checked)}
          />
          {t('employerAnalytics.campaigns.showIdle').replace('{{count}}', idleCount.toLocaleString(locale))}
        </label>
      ) : null}
      {allRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('employerAnalytics.campaigns.empty')}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('employerAnalytics.campaigns.allIdle')}</p>
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
