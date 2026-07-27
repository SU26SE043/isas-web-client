import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/shared/languages';
import { MY_CAMPAIGNS_QUERY_KEY } from '../hooks/useMyCampaigns';
import { myCampaignDetailQueryKey } from '../hooks/useMyCampaignDetail';
import {
  clearCampaignInterviewSession,
  readCampaignInterviewSession,
} from '../utils/campaignInterviewSession';

export function CampaignInterviewCompletedPage() {
  const { campaignId = '', sessionId = '' } = useParams();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const stored = readCampaignInterviewSession(sessionId);
  const resolvedCampaignId = campaignId || stored?.campaignId || '';

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: MY_CAMPAIGNS_QUERY_KEY });
    if (resolvedCampaignId) {
      void queryClient.invalidateQueries({
        queryKey: myCampaignDetailQueryKey(resolvedCampaignId),
      });
    }
    if (sessionId) clearCampaignInterviewSession(sessionId);
  }, [queryClient, resolvedCampaignId, sessionId]);

  return (
    <div className="page-container page-section mx-auto max-w-2xl space-y-6 py-12 text-center">
      <h1 className="heading-primary text-3xl text-foreground">{t('campaigns.flow.completedTitle')}</h1>
      <p className="text-sm text-muted-foreground">{t('campaigns.flow.completedBody')}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to={`/candidate/campaigns/${encodeURIComponent(resolvedCampaignId)}`}
          className="btn-secondary inline-flex"
        >
          {t('campaigns.flow.backToCampaign')}
        </Link>
        <Link to="/candidate/campaigns" className="btn-primary inline-flex">
          {t('campaigns.my.backToList')}
        </Link>
      </div>
    </div>
  );
}
