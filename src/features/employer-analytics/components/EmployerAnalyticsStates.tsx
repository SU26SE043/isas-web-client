import { BarChart3, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatGridSkeleton } from '@/components/patterns/StatCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';

export function EmployerAnalyticsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" data-testid="employer-analytics-skeleton">
      <StatGridSkeleton columns={6} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}

/** 403 = phiên không có tổ chức · 400 = kỳ sai · 401 = chưa đăng nhập · còn lại = lỗi tải. */
export function analyticsErrorKey(status: number | undefined) {
  if (status === 403) return 'employerAnalytics.errors.forbidden';
  if (status === 400) return 'employerAnalytics.errors.invalidRange';
  if (status === 401) return 'employerAnalytics.errors.unauthorized';
  return 'employerAnalytics.errors.load';
}

export function EmployerAnalyticsError({ status, onRetry }: { status: number | undefined; onRetry: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-3">
      <Alert variant="error">
        <AlertDescription>{t(analyticsErrorKey(status))}</AlertDescription>
      </Alert>
      {status !== 401 ? (
        <Button variant="outline" onClick={onRetry}>
          {t('employerAnalytics.errors.retry')}
        </Button>
      ) : null}
    </div>
  );
}

/** Org chưa có chiến dịch nào: BE trả 200 toàn 0 — không phải lỗi, chỉ chưa có gì để phân tích. */
export function EmployerAnalyticsEmpty() {
  const { t } = useLanguage();
  return (
    <div className="frame-satin flex flex-col items-center gap-3 rounded-2xl bg-surface-raised px-6 py-12 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg border border-satin bg-surface-overlay text-muted-foreground">
        <BarChart3 className="size-4" aria-hidden />
      </span>
      <h2 className="text-base font-semibold text-foreground">{t('employerAnalytics.empty.title')}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{t('employerAnalytics.empty.description')}</p>
      <Button render={<Link to="/employer/campaigns/new" />}>
        <Plus aria-hidden />
        {t('employerAnalytics.empty.cta')}
      </Button>
    </div>
  );
}
