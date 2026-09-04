import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { CampaignCandidateError, campaignCandidateService } from '../services/campaignCandidate.service';
import { saveCampaignInterviewSession } from '../utils/campaignInterviewSession';

export function useInvitationStart(campaignId: string, enabled: boolean) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const start = useCallback(async () => {
    if (!enabled || !campaignId || isStarting) return;
    setIsStarting(true);
    setStartError(null);
    try {
      const started = await campaignCandidateService.startCampaignInterview(campaignId);
      saveCampaignInterviewSession(started);
      navigate(`/interview/${encodeURIComponent(started.sessionId)}/prepare`);
    } catch (error) {
      const message = error instanceof CampaignCandidateError
        ? error.message || t('campaigns.detail.startUnknown')
        : t('campaigns.detail.startUnknown');
      if (error instanceof CampaignCandidateError && error.slotStartsAt) {
        const openingTime = new Date(error.slotStartsAt).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
        setStartError(`${message} ${t('campaigns.detail.startOpeningTime').replace('{time}', openingTime)}`);
      } else {
        setStartError(message);
      }
    } finally {
      setIsStarting(false);
    }
  }, [campaignId, enabled, isStarting, navigate, t]);

  return { isStarting, startError, start };
}
