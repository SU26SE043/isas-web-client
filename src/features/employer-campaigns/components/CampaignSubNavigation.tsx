import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../types/campaignManagement.types';

interface CampaignSubNavigationProps {
  campaign: EmployerCampaign;
  mode: 'overview' | 'invitations';
}

export function CampaignSubNavigation({ campaign, mode }: CampaignSubNavigationProps) {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const base = `/employer/campaigns/${campaign.id}`;
  const canOperate = campaign.status === 'active';
  const canViewHistory = campaign.status !== 'draft';
  const activeTab =
    searchParams.get('tab') ?? (mode === 'overview' ? 'details' : 'cv-screening');
  const items =
    mode === 'overview'
      ? [
          {
            id: 'details',
            label: t('employer.campaigns.workspace.detail'),
            to: `${base}/overview?tab=details`,
            enabled: true,
          },
          {
            id: 'candidates',
            label: t('employer.campaigns.workspace.invitations'),
            to: `${base}/overview?tab=candidates`,
            enabled: canViewHistory,
          },
          {
            id: 'results',
            label: t('employer.campaigns.workspace.results'),
            to: `${base}/overview?tab=results`,
            enabled: canViewHistory,
          },
        ]
      : [
          {
            id: 'cv-screening',
            label: t('employer.campaigns.workspace.screening'),
            to: `${base}/invitations?tab=cv-screening`,
            enabled: canOperate,
          },
          {
            id: 'invite',
            label: t('employer.campaigns.workspace.invite'),
            to: `${base}/invitations?tab=invite`,
            enabled: canOperate,
          },
          {
            id: 'invitation-list',
            label: t('employer.campaigns.workspace.invitations'),
            to: `${base}/invitations?tab=invitation-list`,
            enabled: canViewHistory,
          },
        ];

  return (
    <nav
      className="overflow-x-auto rounded-xl border border-satin bg-surface-raised p-1"
      aria-label={t('employer.campaigns.workspace.navigation')}
    >
      <div className="flex min-w-max gap-1">
        {items.map((item) =>
          item.enabled ? (
            <Link
              key={item.to}
              to={item.to}
              aria-current={activeTab === item.id ? 'page' : undefined}
              className={cn(
                'rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200',
                activeTab === item.id
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground',
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span
              key={item.to}
              aria-disabled="true"
              className="cursor-not-allowed rounded-lg px-4 py-2.5 text-sm text-muted-foreground/45"
            >
              {item.label}
            </span>
          ),
        )}
      </div>
    </nav>
  );
}
