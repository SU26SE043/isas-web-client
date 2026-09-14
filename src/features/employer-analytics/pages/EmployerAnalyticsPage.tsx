import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/patterns/PageHeader';
import { getApiStatusCode } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';
import { EmployerAnalyticsBandChart } from '../components/EmployerAnalyticsBandChart';
import { EmployerAnalyticsCampaignTable } from '../components/EmployerAnalyticsCampaignTable';
import { EmployerAnalyticsFilters } from '../components/EmployerAnalyticsFilters';
import { EmployerAnalyticsFlagsTable } from '../components/EmployerAnalyticsFlagsTable';
import { EmployerAnalyticsFunnelChart } from '../components/EmployerAnalyticsFunnelChart';
import { EmployerAnalyticsScreeningCard } from '../components/EmployerAnalyticsScreeningCard';
import { EmployerAnalyticsEmpty, EmployerAnalyticsError, EmployerAnalyticsSkeleton } from '../components/EmployerAnalyticsStates';
import { EmployerAnalyticsStats } from '../components/EmployerAnalyticsStats';
import { EmployerAnalyticsTrendChart } from '../components/EmployerAnalyticsTrendChart';
import { useEmployerAnalytics } from '../hooks/useEmployerAnalytics';
import type { EmployerAnalyticsGranularity, EmployerAnalyticsPreset } from '../types/employerAnalytics.types';
import { fillAnalyticsBuckets, resolveAnalyticsPeriod } from '../utils/employerAnalyticsMetrics';

/**
 * Phân tích tuyển dụng theo tổ chức — dữ liệu THẬT từ `GET /api/v1/campaign/analytics`.
 * Số tổng (thẻ · phễu · phân bố · sàng CV · cờ · từng chiến dịch) = trạng thái hiện tại của cả org;
 * chỉ "Hoạt động theo kỳ" đổi theo kỳ/nhóm đã chọn. Kỳ tính phía client theo UTC rồi gửi `from`/`to`.
 */
export function EmployerAnalyticsPage() {
  const { t, language } = useLanguage();
  const [preset, setPreset] = useState<EmployerAnalyticsPreset>('30d');
  const [groupBy, setGroupBy] = useState<EmployerAnalyticsGranularity>('day');
  // Tính một lần cho mỗi preset — khoá query phải ổn định giữa các render, không trôi theo `new Date()`.
  const period = useMemo(() => resolveAnalyticsPeriod(preset, new Date()), [preset]);
  const analytics = useEmployerAnalytics({ ...period, groupBy });
  const status = getApiStatusCode(analytics.error);
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value));

  const data = analytics.data;
  // Điền theo granularity CỦA DỮ LIỆU (không theo select): lúc đổi nhóm, `keepPreviousData` còn giữ bộ
  // bucket theo nhóm cũ — điền lưới mới lên bucket cũ sẽ ra biểu đồ trộn hai lưới trong vài trăm ms.
  const dataGranularity: EmployerAnalyticsGranularity = data?.granularity === 'month' ? 'month' : 'day';
  const buckets = useMemo(
    () => (data ? fillAnalyticsBuckets(data.buckets, data.from, data.to, dataGranularity) : []),
    [data, dataGranularity],
  );
  const isEmptyOrg = data != null && data.campaigns.total === 0;

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="app-page space-y-6">
        <PageHeader
          title={t('employerAnalytics.page.title')}
          description={t('employerAnalytics.page.description')}
          actions={
            <EmployerAnalyticsFilters
              preset={preset}
              groupBy={groupBy}
              isFetching={analytics.isFetching}
              onPresetChange={setPreset}
              onGroupByChange={setGroupBy}
              onRefresh={() => void analytics.refetch()}
            />
          }
        />

        {data ? (
          <p className="text-sm text-muted-foreground" data-testid="employer-analytics-range">
            {t('employerAnalytics.page.range').replace('{from}', formatDate(data.from)).replace('{to}', formatDate(data.to))}
            {analytics.isPlaceholderData ? ` · ${t('employerAnalytics.page.refreshing')}` : null}
          </p>
        ) : null}

        {analytics.isPending ? <EmployerAnalyticsSkeleton /> : null}
        {analytics.isError && !data ? (
          <EmployerAnalyticsError status={status} onRetry={() => void analytics.refetch()} />
        ) : null}
        {data && isEmptyOrg ? <EmployerAnalyticsEmpty /> : null}
        {data && !isEmptyOrg ? (
          <div className={analytics.isPlaceholderData ? 'space-y-6 opacity-60 transition-opacity' : 'space-y-6'} aria-busy={analytics.isPlaceholderData}>
            <section aria-label={t('employerAnalytics.page.title')} data-testid="employer-analytics-stats">
              <EmployerAnalyticsStats data={data} />
            </section>
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <EmployerAnalyticsFunnelChart data={data} />
              <EmployerAnalyticsScreeningCard data={data} />
              <EmployerAnalyticsFlagsTable flags={data.interviews.flagsBySignal} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <EmployerAnalyticsBandChart
                id="employer-analytics-interview-bands"
                title={t('employerAnalytics.distribution.interviewTitle')}
                description={t('employerAnalytics.distribution.interviewDescription')}
                bands={data.interviews.scoreDistribution}
                colorIndex={0}
              />
              <EmployerAnalyticsBandChart
                id="employer-analytics-fit-bands"
                title={t('employerAnalytics.distribution.fitTitle')}
                description={t('employerAnalytics.distribution.fitDescription')}
                bands={data.screening.fitDistribution}
                colorIndex={1}
              />
            </div>
            <EmployerAnalyticsTrendChart buckets={buckets} granularity={dataGranularity} />
            {/* Bảng 8 cột cần trọn chiều ngang; nhét vào lưới 2 cột ở 1280px là cắt mất Passed/Median sau thanh cuộn. */}
            <EmployerAnalyticsCampaignTable rows={data.perCampaign} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
