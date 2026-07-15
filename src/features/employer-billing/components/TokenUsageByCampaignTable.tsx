import { Fragment, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { CampaignTokenUsage, SessionTokenUsage } from '../types/employerBilling.types';

interface TokenUsageByCampaignTableProps {
  campaigns: CampaignTokenUsage[];
  sessionsByCampaign: Record<string, SessionTokenUsage[]>;
  loadingCampaignId: string | null;
  onExpand: (campaignId: string) => void;
}

export function TokenUsageByCampaignTable({
  campaigns,
  sessionsByCampaign,
  loadingCampaignId,
  onExpand,
}: TokenUsageByCampaignTableProps) {
  const { t, language } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

  const toggleCampaign = (campaignId: string) => {
    const next = expandedId === campaignId ? null : campaignId;
    setExpandedId(next);
    if (next && !sessionsByCampaign[campaignId]) onExpand(campaignId);
  };

  if (campaigns.length === 0) {
    return (
      <div className="rounded-xl border border-subtle bg-surface-overlay px-4 py-8 text-center">
        <p className="text-sm font-medium text-foreground">{t('employerBilling.usage.campaignEmptyTitle')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('employerBilling.usage.campaignEmptyDescription')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-subtle bg-surface-raised">
      <table className="min-w-full text-sm">
        <thead className="border-b border-subtle bg-surface-base text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3" aria-hidden />
            <th className="px-4 py-3">{t('employerBilling.usage.campaign')}</th>
            <th className="px-4 py-3">{t('employerBilling.usage.sessions')}</th>
            <th className="px-4 py-3">{t('employerBilling.usage.tokensAccrued')}</th>
            <th className="px-4 py-3">{t('employerBilling.usage.lastSession')}</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => {
            const expanded = expandedId === campaign.campaignId;
            const sessions = sessionsByCampaign[campaign.campaignId] ?? [];
            const loading = loadingCampaignId === campaign.campaignId;
            return (
              <Fragment key={campaign.campaignId}>
                <tr className="border-b border-subtle">
                  <td className="px-2 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-expanded={expanded}
                      aria-label={t('employerBilling.usage.toggleSessions')}
                      onClick={() => toggleCampaign(campaign.campaignId)}
                    >
                      {expanded ? <ChevronDown className="h-4 w-4" aria-hidden /> : <ChevronRight className="h-4 w-4" aria-hidden />}
                    </Button>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {language === 'vi' ? campaign.campaignNameVi : campaign.campaignName}
                  </td>
                  <td className="px-4 py-3 text-foreground">{campaign.sessionCount}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{campaign.tokensAccrued.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(campaign.lastSessionAt)}</td>
                </tr>
                {expanded ? (
                  <tr className="border-b border-subtle bg-surface-overlay">
                    <td colSpan={5} className="px-4 py-3">
                      {loading ? (
                        <p className="text-sm text-muted-foreground">{t('employerBilling.usage.loadingSessions')}</p>
                      ) : sessions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t('employerBilling.usage.noSessions')}</p>
                      ) : (
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                              <th className="pb-2 pr-4">{t('employerBilling.usage.candidate')}</th>
                              <th className="pb-2 pr-4">{t('employerBilling.usage.completedAt')}</th>
                              <th className="pb-2">{t('employerBilling.usage.tokensUsed')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sessions.map((session) => (
                              <tr key={session.id}>
                                <td className="py-1 pr-4 text-foreground">{session.candidateLabel}</td>
                                <td className="py-1 pr-4 text-muted-foreground">{formatDate(session.completedAt)}</td>
                                <td className="py-1 font-medium text-foreground">{session.tokensUsed.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
