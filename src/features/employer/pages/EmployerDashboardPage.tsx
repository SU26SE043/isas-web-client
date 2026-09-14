import { Link } from 'react-router-dom';
import { CheckCircle2, Coins, FileCheck2, Plus, Send } from 'lucide-react';
import { PageHeader } from '@/components/patterns/PageHeader';
import { StatCard, StatGrid, StatGridSkeleton } from '@/components/patterns/StatCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { UserRole } from '@/features/auth/types/auth.types';
import { useEmployerPaymentAccount } from '@/features/employer-billing/hooks/useEmployerPaymentQueries';
import { PaymentMode } from '@/features/employer-billing/types/employerPayment.types';
import { useEmployerCampaigns } from '@/features/employer-campaigns/hooks/useEmployerCampaigns';
import { computeCampaignStats } from '@/features/employer-campaigns/utils/campaignStats';
import { useLanguage } from '@/shared/languages';
import { EmployerNextStepCard, EmployerRecentCampaigns, EmployerTeamStat } from '../components/EmployerDashboardSections';
import { computeEmployerNextStep, recentCampaigns } from '../utils/employerNextStep';

/**
 * Dashboard employer đọc DỮ LIỆU THẬT: danh sách chiến dịch (cùng công thức thống kê với trang chiến dịch), ví
 * credit của tổ chức, số thành viên (chỉ OrgAdmin — HR gọi endpoint này bị 403). Trước đây toàn bộ trang là
 * workspace mock (độ hoàn thiện hồ sơ 68%, xác minh, hoạt động tháng 7 cố định). Hai trang Hồ sơ công ty /
 * Xác minh vẫn còn route nhưng ẩn khỏi nav cho tới khi có backend hồ sơ công ty.
 */
export function EmployerDashboardPage() {
  const { t } = useLanguage();
  const user = useAuthStore((state) => state.user);
  const canManageOrg = user?.role === UserRole.ORG_ADMIN || user?.role === UserRole.ADMIN;
  const campaignsQuery = useEmployerCampaigns({ query: '', status: 'all' });
  const accountQuery = useEmployerPaymentAccount();

  const stats = computeCampaignStats(campaignsQuery.campaigns);
  const account = accountQuery.data;
  const isPrepaid = account ? account.paymentMode === PaymentMode.Prepaid : true;
  const remainingCredits = account ? (isPrepaid ? account.remainingCredits : (account.periodUsage ?? 0)) : null;
  const creditHint = account
    ? isPrepaid
      ? t('employer.dashboard.creditsPrepaid')
      : t('employer.dashboard.creditsPostpaid').replace('{limit}', String(account.creditLimit ?? '—'))
    : accountQuery.isError
      ? t('employer.dashboard.creditsUnavailable')
      : undefined;

  const description = user?.orgName
    ? t('employer.dashboard.subtitleOrg').replace('{org}', user.orgName)
    : t('employer.dashboard.subtitle');

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="app-page space-y-6">
        <PageHeader
          title={t('employer.dashboard.title')}
          description={description}
          actions={
            <Button render={<Link to="/employer/campaigns/new" />}>
              <Plus aria-hidden />
              {t('employer.dashboard.createCampaign')}
            </Button>
          }
        />

        {campaignsQuery.isLoading ? (
          <StatGridSkeleton columns={4} />
        ) : campaignsQuery.isError ? (
          <p className="rounded-xl border border-error/30 bg-error-bg px-4 py-3 text-sm text-error" role="alert">
            {t('employer.dashboard.loadError')}
          </p>
        ) : (
          <StatGrid columns={4}>
            <StatCard
              label={t('employer.dashboard.activeCampaigns')}
              value={stats.active}
              hint={t('employer.dashboard.draftsHint').replace('{count}', String(stats.draft))}
              icon={<FileCheck2 aria-hidden />}
              to="/employer/campaigns"
            />
            <StatCard
              label={t('employer.dashboard.invited')}
              value={stats.invited}
              hint={t('employer.dashboard.invitedHint')}
              icon={<Send aria-hidden />}
            />
            <StatCard
              label={t(isPrepaid ? 'employer.dashboard.credits' : 'employer.dashboard.periodUsage')}
              value={remainingCredits == null ? '—' : remainingCredits.toLocaleString()}
              hint={creditHint}
              icon={<Coins aria-hidden />}
              tone={isPrepaid && remainingCredits === 0 ? 'warning' : 'neutral'}
              to="/employer/billing"
            />
            {canManageOrg ? (
              <EmployerTeamStat />
            ) : (
              <StatCard
                label={t('employer.dashboard.completed')}
                value={stats.completed}
                hint={t('employer.dashboard.completedHint')}
                icon={<CheckCircle2 aria-hidden />}
              />
            )}
          </StatGrid>
        )}

        {campaignsQuery.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : campaignsQuery.isError ? null : (
          <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
            <EmployerNextStepCard step={computeEmployerNextStep(campaignsQuery.campaigns, account ? remainingCredits : null, isPrepaid)} />
            <EmployerRecentCampaigns campaigns={recentCampaigns(campaignsQuery.campaigns)} />
          </div>
        )}
      </div>
    </div>
  );
}
