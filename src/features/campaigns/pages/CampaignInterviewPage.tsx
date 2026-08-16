import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  B2cPracticeInterviewRoom,
  type B2cRoomMediaContext,
} from '@/features/practice/components/B2cPracticeInterviewRoom';
import { useLanguage } from '@/shared/languages';
import { CampaignViolationDialog } from '../components/CampaignViolationDialog';
import { useCampaignAntiCheat } from '../hooks/useCampaignAntiCheat';
import { useCampaignFaceCheck } from '../hooks/useCampaignFaceCheck';
import { useCampaignFullscreen } from '../hooks/useCampaignFullscreen';
import { useCampaignViolationQueue } from '../hooks/useCampaignViolationQueue';
import { readCampaignInterviewSession } from '../utils/campaignInterviewSession';

function hasLiveCamera(stream: MediaStream | null | undefined) {
  return Boolean(stream?.getVideoTracks().some(
    (track) => track.readyState === 'live' && track.enabled,
  ));
}

export function CampaignInterviewPage() {
  const { campaignId = '', sessionId = '' } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const stored = readCampaignInterviewSession(sessionId);
  const resolvedCampaignId = campaignId || stored?.campaignId || '';
  const antiCheatEnabled = stored?.antiCheatEnabled === true;
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [media, setMedia] = useState<B2cRoomMediaContext | null>(null);
  const [violationPaused, setViolationPaused] = useState(false);
  const [interviewActive, setInterviewActive] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const fullscreenExitRef = useRef<() => void>(() => undefined);
  const countdownStartedRef = useRef(false);
  const violations = useCampaignViolationQueue(antiCheatEnabled);

  // Interview is ACTIVE from the moment the start countdown finishes. That
  // includes the "reading" phase (TTS) and every later question hand-off, so
  // monitoring must not drop out between questions.
  const handlePhaseChange = useCallback((phase: string) => {
    if (phase === 'countdown') countdownStartedRef.current = true;
    setInterviewActive(
      countdownStartedRef.current && (phase === 'reading' || phase === 'answering'),
    );
  }, []);

  const handleViolationPause = useCallback(() => setViolationPaused(true), []);
  const handleFullscreenExit = useCallback(() => fullscreenExitRef.current(), []);
  const fullscreen = useCampaignFullscreen({
    enabled: Boolean(sessionId),
    onExit: antiCheatEnabled ? handleFullscreenExit : undefined,
  });
  const monitoringActive = antiCheatEnabled
    && interviewActive
    && fullscreen.isFullscreen
    && !violations.currentViolation;
  const antiCheat = useCampaignAntiCheat({
    campaignId: resolvedCampaignId,
    sessionId,
    enabled: monitoringActive,
    stream: media?.stream,
    onPause: handleViolationPause,
    onViolation: violations.enqueue,
  });
  fullscreenExitRef.current = antiCheat.reportFullscreenExit;

  const faceCheck = useCampaignFaceCheck({
    campaignId: resolvedCampaignId,
    sessionId,
    enabled: monitoringActive,
    videoEl,
    onSignal: violations.enqueue,
  });

  const handleMediaContext = useCallback((context: B2cRoomMediaContext) => {
    setMedia(context);
    const element = document.querySelector<HTMLVideoElement>('[data-campaign-interview] video');
    setVideoEl(element);
  }, []);

  const restoreCamera = useCallback(async () => {
    if (media?.state === 'ready' && hasLiveCamera(media.stream)) return true;
    const stream = await media?.restart();
    return hasLiveCamera(stream);
  }, [media]);

  const handleContinue = useCallback(async () => {
    const violation = violations.currentViolation;
    if (!violation || recovering) return;
    setRecovering(true);
    setRecoveryError(null);
    try {
      if (violation.kind === 'identity_unverified') {
        navigate(
          `/candidate/campaigns/${encodeURIComponent(resolvedCampaignId)}/face-enroll/${encodeURIComponent(sessionId)}?retry=1`,
          { replace: true },
        );
        return;
      }
      if (!fullscreen.isFullscreen) {
        const restored = await fullscreen.enterFullscreen();
        if (!restored) {
          setRecoveryError('campaigns.violation.fullscreenRecovery');
          return;
        }
      }
      if (violation.kind === 'camera_blocked') {
        const restored = await restoreCamera();
        if (!restored) {
          setRecoveryError('campaigns.violation.cameraRecovery');
          return;
        }
      }
      if (
        violation.kind === 'no_face'
        || violation.kind === 'multiple_faces'
        || violation.kind === 'face_mismatch'
      ) {
        if (!(await restoreCamera())) {
          setRecoveryError('campaigns.violation.cameraRecovery');
          return;
        }
        const result = await faceCheck.checkNow();
        if (!result?.safe) {
          setRecoveryError('campaigns.violation.faceRecovery');
          return;
        }
      }
      violations.resolveCurrent();
      setViolationPaused(false);
    } finally {
      setRecovering(false);
    }
  }, [
    faceCheck,
    fullscreen,
    navigate,
    recovering,
    resolvedCampaignId,
    restoreCamera,
    sessionId,
    violations,
  ]);

  if (!sessionId) {
    return (
      <div className="page-container page-section py-10">
        <p className="text-sm text-error">{t('campaigns.flow.missingSession')}</p>
        <Link to="/candidate/campaigns" className="btn-secondary mt-4 inline-flex">
          {t('campaigns.my.backToList')}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" data-campaign-interview>
      {/* Blocking overlays sit above the room's start countdown (z-100): the
          countdown freezes while the interview is paused, so a lower overlay
          would be covered by it and left unreachable. */}
      {!fullscreen.isFullscreen && !violations.currentViolation ? (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/90 px-4 backdrop-blur-sm">
          <section className="frame-satin w-full max-w-md rounded-2xl bg-surface-raised p-6 text-center shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby="fullscreen-required-title">
            <h1 id="fullscreen-required-title" className="text-xl font-semibold text-foreground">
              {t('campaigns.fullscreen.title')}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t(fullscreen.hasExited ? 'campaigns.fullscreen.exitWarning' : 'campaigns.fullscreen.required')}
            </p>
            <button type="button" className="btn-primary mt-6 w-full" onClick={() => void fullscreen.enterFullscreen()} disabled={!fullscreen.fullscreenSupported}>
              {t(fullscreen.fullscreenSupported ? 'campaigns.fullscreen.enter' : 'campaigns.fullscreen.unsupported')}
            </button>
          </section>
        </div>
      ) : null}

      <CampaignViolationDialog
        violation={violations.currentViolation}
        pendingCount={violations.pendingCount}
        recovering={recovering}
        recoveryError={recoveryError}
        onContinue={() => void handleContinue()}
      />

      <div className="border-b border-satin bg-surface-base/80 px-4 py-2 text-center text-xs text-muted-foreground">
        {t('campaigns.flow.monitoringHint')}
      </div>
      <B2cPracticeInterviewRoom
        sessionId={sessionId}
        startWithCountdown
        countdownReady={fullscreen.isFullscreen}
        deadlineAt={stored?.deadlineAt}
        completePath="/candidate/campaigns"
        violationPaused={violationPaused || Boolean(violations.currentViolation) || !fullscreen.isFullscreen}
        cameraAlwaysOn
        onMediaContextChange={handleMediaContext}
        onPhaseChange={handlePhaseChange}
      />
    </div>
  );
}
