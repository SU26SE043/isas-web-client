import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useMediaDevices } from '@/features/practice/hooks/useMediaDevices';
import { useLanguage } from '@/shared/languages';
import {
  CampaignCandidateError,
  campaignCandidateService,
} from '../services/campaignCandidate.service';
import { dataUrlToJpegFile, isUsableCameraFrame } from '../utils/captureJpegFile';
import { readCampaignInterviewSession } from '../utils/campaignInterviewSession';

export function CampaignFaceEnrollPage() {
  const { campaignId = '', sessionId = '' } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRetry = searchParams.get('retry') === '1';
  const stored = readCampaignInterviewSession(sessionId);
  const resolvedCampaignId = campaignId || stored?.campaignId || '';
  const { videoRef, state, startPreview, stopStream, captureSnapshot } = useMediaDevices();
  const [preview, setPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stored && !stored.faceEnrollRequired && !isRetry) {
      navigate(
        `/candidate/campaigns/${encodeURIComponent(resolvedCampaignId)}/interview/${encodeURIComponent(sessionId)}`,
        { replace: true },
      );
    }
  }, [isRetry, navigate, resolvedCampaignId, sessionId, stored]);

  useEffect(() => {
    void startPreview();
    return () => stopStream();
  }, [startPreview, stopStream]);

  const handleCapture = () => {
    // Never enroll a black frame: the camera can report valid dimensions before
    // it has actually exposed an image.
    const video = videoRef.current;
    if (!video || !isUsableCameraFrame(video)) {
      setPreview('');
      setError(t('campaigns.faceEnroll.badFrame'));
      return;
    }
    const snapshot = captureSnapshot();
    if (!snapshot) {
      setError(t('campaigns.faceEnroll.badFrame'));
      return;
    }
    setPreview(snapshot);
    setError(null);
  };

  const handleUsePhoto = async () => {
    if (!preview || !resolvedCampaignId || !sessionId) return;
    setIsUploading(true);
    setError(null);
    try {
      const file = await dataUrlToJpegFile(preview, `face-enroll-${sessionId}.jpg`);
      await campaignCandidateService.enrollCampaignFace(resolvedCampaignId, sessionId, file);
      stopStream();
      navigate(
        `/candidate/campaigns/${encodeURIComponent(resolvedCampaignId)}/interview/${encodeURIComponent(sessionId)}`,
      );
    } catch (uploadError) {
      if (uploadError instanceof CampaignCandidateError && uploadError.code === 'badRequest') {
        setError(t('campaigns.faceEnroll.badImage'));
      } else {
        setError(t('campaigns.faceEnroll.uploadError'));
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page-container page-section mx-auto max-w-4xl space-y-6 py-8">
      <header className="space-y-2">
        <h1 className="heading-primary text-2xl text-foreground">{t('campaigns.faceEnroll.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('campaigns.faceEnroll.hint')}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-satin bg-surface-highlight">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
            aria-label={t('campaigns.faceEnroll.liveLabel')}
          />
          <div className="pointer-events-none absolute inset-8 rounded-full border border-foreground/25" />
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">{t('campaigns.faceEnroll.captureLabel')}</p>
          <div className="flex-1 overflow-hidden rounded-xl border border-satin bg-surface-highlight">
            {preview ? (
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
                {t('campaigns.faceEnroll.empty')}
              </div>
            )}
          </div>
        </div>
      </div>

      <ul className="space-y-1 text-sm text-muted-foreground">
        <li>{t('campaigns.faceEnroll.guide1')}</li>
        <li>{t('campaigns.faceEnroll.guide2')}</li>
        <li>{t('campaigns.faceEnroll.guide3')}</li>
      </ul>

      {state !== 'ready' ? (
        <p className="text-sm text-amber-400">{t('campaigns.faceEnroll.cameraIssue')}</p>
      ) : null}
      {error ? (
        <p className="text-sm text-rose-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-secondary"
          disabled={state !== 'ready' || isUploading}
          onClick={handleCapture}
        >
          {preview ? t('campaigns.faceEnroll.retake') : t('campaigns.faceEnroll.capture')}
        </button>
        <button
          type="button"
          className="btn-primary inline-flex items-center gap-2"
          disabled={!preview || isUploading}
          onClick={() => void handleUsePhoto()}
        >
          {isUploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {isUploading ? t('campaigns.faceEnroll.uploading') : t('campaigns.faceEnroll.usePhoto')}
        </button>
        <Link
          to={`/candidate/campaigns/${encodeURIComponent(resolvedCampaignId)}`}
          className="btn-ghost inline-flex"
        >
          {t('campaigns.my.backToList')}
        </Link>
      </div>
    </div>
  );
}
