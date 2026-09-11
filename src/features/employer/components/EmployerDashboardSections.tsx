import { ArrowRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/patterns/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CampaignManagementStatusBadge } from '@/features/employer-campaigns/components/CampaignManagementStatusBadge';
import type { EmployerCampaign } from '@/features/employer-campaigns/types/campaignManagement.types';
import { useEmployerTeam } from '@/features/engagement/hooks/useEngagement';
import { useLanguage } from '@/shared/languages';
import type { EmployerNextStep } from '../utils/employerNextStep';

/** Thẻ Thành viên — tách component để hook `useEmployerTeam` (gọi API OrgAdmin-only) chỉ chạy khi được render. */
export function EmployerTeamStat() {
  const { t } = useLanguage();
  const { team, isLoading, errorKey } = useEmployerTeam();
  return (
    <StatCard
      label={t('employer.dashboard.members')}
      value={isLoading ? '…' : errorKey ? '—' : String(team.length)}
      hint={t('employer.dashboard.membersHint')}
      icon={<Users aria-hidden />}
      to="/employer/team"
    />
  );
}

export function EmployerNextStepCard({ step }: { step: EmployerNextStep }) {
  const { t } = useLanguage();
  const hint =
    step.kind === 'invite'
      ? t('employer.dashboard.next.inviteHint').replace('{title}', step.campaignTitle)
      : t(`employer.dashboard.next.${step.kind}Hint`);
  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardHeader>
        <CardTitle>{t('employer.dashboard.nextSteps')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground">{hint}</p>
        <Button render={<Link to={step.to} />} variant={step.kind === 'viewResults' ? 'outline' : 'default'}>
          {t(`employer.dashboard.next.${step.kind}`)}
          <ArrowRight aria-hidden />
        </Button>
      </CardContent>
    </Card>
  );
}

export function EmployerRecentCampaigns({ campaigns }: { campaigns: EmployerCampaign[] }) {
  const { t, language } = useLanguage();
  const formatDate = (value: string) => new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit' }).format(new Date(value));
  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{t('employer.dashboard.recentCampaigns')}</CardTitle>
        <Link to="/employer/campaigns" className="text-sm text-muted-foreground hover:text-foreground focus-ring">
          {t('employer.dashboard.viewAll')}
        </Link>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('employer.dashboard.recentEmpty')}</p>
        ) : (
          <ul className="divide-y divide-subtle">
            {campaigns.map((campaign) => (
              <li key={campaign.id}>
                <Link
                  to={`/employer/campaigns/${campaign.id}/overview`}
                  className="flex items-center justify-between gap-3 py-3 text-sm hover:text-foreground focus-ring"
                >
                  <span className="min-w-0 truncate font-medium text-foreground">{campaign.title}</span>
                  <span className="flex shrink-0 items-center gap-3 text-muted-foreground">
                    <span className="tabular-nums">{formatDate(campaign.updatedAt)}</span>
                    <CampaignManagementStatusBadge status={campaign.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
