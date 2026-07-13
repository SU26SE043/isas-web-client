import { Link } from 'react-router-dom';
import { BadgeCheck, Building2, FileCheck2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { UserRole } from '@/features/auth/types/auth.types';
import { useLanguage } from '@/shared/languages';
import { EmployerActivityList } from '../components/EmployerActivityList';
import { EmployerMetricCard } from '../components/EmployerMetricCard';
import { EmployerStatusBadge } from '../components/EmployerStatusBadge';
import { useEmployerWorkspace } from '../hooks/useEmployerWorkspace';

export function EmployerDashboardPage() {
  const { t } = useLanguage();
  const user = useAuthStore((state) => state.user);
  const canManageOrg = user?.role === UserRole.ORGANIZE || user?.role === UserRole.ADMIN;
  const { workspace, isLoading } = useEmployerWorkspace();

  if (isLoading || !workspace) {
    return (
      <div className="h-full overflow-y-auto bg-surface-base">
        <div className="page-container page-section mx-auto max-w-7xl space-y-5">
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32" />)}
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-label text-muted-foreground">{t('employer.dashboard.eyebrow')}</p>
            <h1 className="heading-primary text-3xl text-foreground">{t('employer.dashboard.title')}</h1>
            <p className="body-text max-w-3xl text-sm text-muted-foreground">{t('employer.dashboard.subtitle')}</p>
          </div>
          {canManageOrg ? (
            <div className="flex flex-wrap gap-2">
              <Button render={<Link to="/employer/company" />}>{t('employer.dashboard.completeProfile')}</Button>
              <Button variant="outline" render={<Link to="/employer/company/verify" />}>
                {t('employer.dashboard.submitVerification')}
              </Button>
            </div>
          ) : null}
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <EmployerMetricCard
            label={t('employer.dashboard.profileCompleteness')}
            value={`${workspace.profile.completeness}%`}
            hint={workspace.profile.name}
            icon={<Building2 className="size-5" aria-hidden />}
          />
          <EmployerMetricCard
            label={t('employer.dashboard.verification')}
            value={t(`employer.status.${workspace.verification.status}`)}
            hint={workspace.profile.emailDomain}
            icon={<BadgeCheck className="size-5" aria-hidden />}
          />
          <EmployerMetricCard
            label={t('employer.dashboard.activeCampaigns')}
            value={workspace.activeCampaigns}
            hint={`${workspace.draftCampaigns} ${t('employer.dashboard.drafts')}`}
            icon={<FileCheck2 className="size-5" aria-hidden />}
          />
          <EmployerMetricCard
            label={t('employer.dashboard.capacity')}
            value={workspace.candidateCapacity}
            hint={`${workspace.roleSeats} ${t('employer.dashboard.seats')}`}
            icon={<Users className="size-5" aria-hidden />}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <Card className="border border-subtle bg-surface-raised">
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{t('employer.dashboard.readiness')}</CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">{t('employer.dashboard.readinessCopy')}</p>
                </div>
                <EmployerStatusBadge status={workspace.verification.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[t('employer.dashboard.stepProfile'), t('employer.dashboard.stepVerify'), t('employer.dashboard.stepCampaign')].map(
                (step, index) => (
                  <div key={step} className="flex gap-3 rounded-xl border border-subtle bg-surface-overlay p-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
                      {index + 1}
                    </span>
                    <p className="text-sm text-foreground">{step}</p>
                  </div>
                ),
              )}
            </CardContent>
          </Card>
          <EmployerActivityList activities={workspace.activities} />
        </div>
      </div>
    </div>
  );
}
