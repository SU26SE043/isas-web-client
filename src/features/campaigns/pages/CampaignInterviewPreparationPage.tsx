import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InterviewPrepPage } from '@/features/practice/pages/InterviewPrepPage';
import { readCampaignInterviewSession } from '../utils/campaignInterviewSession';

/**
 * Campaign-only routing adapter. All preparation visuals and device behavior
 * remain in the B2C-owned InterviewPrepPage and DeviceCheckStep.
 */
export function CampaignInterviewPreparationPage() {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();

  const handleCampaignDeviceReady = useCallback(
    (readySessionId: string) => {
      const campaignSession = readCampaignInterviewSession(readySessionId);
      if (campaignSession?.faceEnrollRequired) {
        navigate(
          `/candidate/campaigns/${encodeURIComponent(campaignSession.campaignId)}/face-enroll/${encodeURIComponent(readySessionId)}`,
          { replace: true },
        );
        return;
      }
      navigate(`/interview/${encodeURIComponent(readySessionId)}/terms`, { replace: true });
    },
    [navigate],
  );

  return sessionId && readCampaignInterviewSession(sessionId) ? (
    <InterviewPrepPage onCampaignDeviceReady={handleCampaignDeviceReady} />
  ) : (
    <InterviewPrepPage />
  );
}
