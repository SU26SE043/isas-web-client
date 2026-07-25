import { Fragment, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value),
    );

  const toggleCampaign = (campaignId: string) => {
    const next = expandedId === campaignId ? null : campaignId;
    setExpandedId(next);
    if (next && !sessionsByCampaign[campaignId]) onExpand(campaignId);
  };

  if (campaigns.length === 0) {
    return (
      <div className="rounded-xl border border-satin bg-surface-overlay px-4 py-8 text-center">
        <p className="text-sm font-medium text-foreground">
          {t('employerBilling.usage.campaignEmptyTitle')}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('employerBilling.usage.campaignEmptyDescription')}
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12" aria-hidden />
          <TableHead>{t('employerBilling.usage.campaign')}</TableHead>
          <TableHead>{t('employerBilling.usage.sessions')}</TableHead>
          <TableHead>{t('employerBilling.usage.tokensAccrued')}</TableHead>
          <TableHead>{t('employerBilling.usage.lastSession')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => {
          const expanded = expandedId === campaign.campaignId;
          const sessions = sessionsByCampaign[campaign.campaignId] ?? [];
          const loading = loadingCampaignId === campaign.campaignId;
          return (
            <Fragment key={campaign.campaignId}>
              <TableRow>
                <TableCell className="px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-expanded={expanded}
                    aria-label={t('employerBilling.usage.toggleSessions')}
                    onClick={() => toggleCampaign(campaign.campaignId)}
                  >
                    {expanded ? (
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    ) : (
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {language === 'vi' ? campaign.campaignNameVi : campaign.campaignName}
                </TableCell>
                <TableCell className="text-foreground">{campaign.sessionCount}</TableCell>
                <TableCell className="font-semibold text-foreground">
                  {campaign.tokensAccrued.toLocaleString()}
                </TableCell>
                <TableCell>{formatDate(campaign.lastSessionAt)}</TableCell>
              </TableRow>
              {expanded ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="bg-surface-overlay/60 py-3">
                    {loading ? (
                      <p className="text-sm text-muted-foreground">
                        {t('employerBilling.usage.loadingSessions')}
                      </p>
                    ) : sessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t('employerBilling.usage.noSessions')}
                      </p>
                    ) : (
                      <Table framed={false} className="min-w-full">
                        <TableHeader className="bg-transparent">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="h-8 px-0 pb-2">
                              {t('employerBilling.usage.candidate')}
                            </TableHead>
                            <TableHead className="h-8 px-0 pb-2">
                              {t('employerBilling.usage.completedAt')}
                            </TableHead>
                            <TableHead className="h-8 px-0 pb-2">
                              {t('employerBilling.usage.tokensUsed')}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sessions.map((session) => (
                            <TableRow key={session.id} className="hover:bg-transparent">
                              <TableCell className="px-0 py-1 text-foreground">
                                {session.candidateLabel}
                              </TableCell>
                              <TableCell className="px-0 py-1">
                                {formatDate(session.completedAt)}
                              </TableCell>
                              <TableCell className="px-0 py-1 font-medium text-foreground">
                                {session.tokensUsed.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
