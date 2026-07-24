import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { B2cPracticeInterviewRoom } from '@/features/practice/components/B2cPracticeInterviewRoom';
import { useLanguage } from '@/shared/languages';
import { useCampaignAntiCheat } from '../hooks/useCampaignAntiCheat';
import { useCampaignFaceCheck } from '../hooks/useCampaignFaceCheck';
import { readCampaignInterviewSession } from '../utils/campaignInterviewSession';

export function CampaignInterviewPage() {
  const { campaignId = '', sessionId = '' } = useParams();
  const { t } = useLanguage();
  const stored = readCampaignInterviewSession(sessionId);
  const resolvedCampaignId = campaignId || stored?.campaignId || '';
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    const findVideo = () => {
      const el = document.querySelector<HTMLVideoElement>('[data-campaign-interview] video');
      setVideoEl(el);
    };
    findVideo();
    const timer = window.setInterval(findVideo, 2000);
    return () => window.clearInterval(timer);
  }, []);

  useCampaignAntiCheat({
    campaignId: resolvedCampaignId,
    sessionId,
    enabled: Boolean(stored?.antiCheatEnabled ?? true),
    videoEl,
  });

  const { softWarning } = useCampaignFaceCheck({
    campaignId: resolvedCampaignId,
    sessionId,
    enabled: Boolean(stored?.antiCheatEnabled ?? true),
    videoEl,
    completed: false,
  });

  if (!sessionId) {
    return (
      <div className="page-container page-section py-10">
        <p className="text-sm text-rose-400">{t('campaigns.flow.missingSession')}</p>
        <Link to="/candidate/campaigns" className="btn-secondary mt-4 inline-flex">
          {t('campaigns.my.backToList')}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" data-campaign-interview>
      {softWarning ? (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-4">
          <p className="rounded-lg border border-amber-500/30 bg-zinc-950/90 px-4 py-2 text-sm text-amber-300">
            {softWarning === 'multiple_faces'
              ? t('campaigns.faceCheck.multipleFaces')
              : softWarning === 'no_face'
                ? t('campaigns.faceCheck.noFace')
                : t('campaigns.faceCheck.adjust')}
          </p>
        </div>
      ) : null}

      <div className="border-b border-zinc-800 bg-zinc-950/80 px-4 py-2 text-center text-xs text-zinc-400">
        {t('campaigns.flow.monitoringHint')}
      </div>

      <B2cPracticeInterviewRoom
        sessionId={sessionId}
        completePath={`/candidate/campaigns/${encodeURIComponent(resolvedCampaignId)}/completed/${encodeURIComponent(sessionId)}`}
      />
    </div>
  );
}
