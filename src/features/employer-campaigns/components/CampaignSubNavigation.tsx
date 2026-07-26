import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../types/campaignManagement.types';

interface CampaignSubNavigationProps {
  campaign: EmployerCampaign;
}

export function CampaignSubNavigation({ campaign }: CampaignSubNavigationProps) {
  const { t } = useLanguage();
  const base = `/employer/campaigns/${campaign.id}`;
  const canOperate = campaign.status === 'active';
  const canViewHistory = campaign.status !== 'draft';
  const items = [
    { label: t('employer.campaigns.workspace.detail'), to: base, enabled: true, end: true },
    {
      label: t('employer.campaigns.workspace.screening'),
      to: `${base}/cv-screening`,
      enabled: canOperate,
    },
    {
      label: t('employer.campaigns.workspace.invite'),
      to: `${base}/invitations/new`,
      enabled: canOperate,
    },
    {
      label: t('employer.campaigns.workspace.invitations'),
      to: `${base}/invitations`,
      enabled: canViewHistory,
    },
    {
      label: t('employer.campaigns.workspace.results'),
      to: `${base}/results`,
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
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
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
