import { useCallback, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  B2cPracticeInterviewRoom,
  type B2cRoomMediaContext,
} from '@/features/practice/components/B2cPracticeInterviewRoom';
import { useLanguage } from '@/shared/languages';
import { CampaignViolationDialog } from '../components/CampaignViolationDialog';
import { ExamClockStillRunning } from '../components/ExamClockStillRunning';
import { useCampaignAntiCheat } from '../hooks/useCampaignAntiCheat';
import { useCampaignFaceCheck } from '../hooks/useCampaignFaceCheck';
import { useCampaignFullscreen } from '../hooks/useCampaignFullscreen';
import { useCampaignProctoringLifecycle } from '../hooks/useCampaignProctoringLifecycle';
import { useCampaignViolationQueue } from '../hooks/useCampaignViolationQueue';
import { MY_CAMPAIGNS_QUERY_KEY } from '../hooks/useMyCampaigns';
import { myCampaignDetailQueryKey } from '../hooks/useMyCampaignDetail';
import { readCampaignInterviewSession } from '../utils/campaignInterviewSession';

function hasLiveCamera(stream: MediaStream | null | undefined) {
  return Boolean(stream?.getVideoTracks().some(
    (track) => track.readyState === 'live' && track.enabled,
  ));
}

export function CampaignInterviewPage() {
  const { campaignId = '', sessionId = '' } = useParams();
  const { t } = useLanguage();
  const stored = readCampaignInterviewSession(sessionId);
  const resolvedCampaignId = campaignId || stored?.campaignId || '';
  const antiCheatEnabled = stored?.antiCheatEnabled === true;
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [media, setMedia] = useState<B2cRoomMediaContext | null>(null);
  const [violationPaused, setViolationPaused] = useState(false);
  const [answerUploadInFlight, setAnswerUploadInFlight] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [examClockRunning, setExamClockRunning] = useState(false);
  // ATT1-F5: phòng đã đóng (hết giờ / không vào được phòng) ⇒ không overlay nào được che màn hết giờ / bảng lỗi.
  const [roomClosed, setRoomClosed] = useState(false);
  const queryClient = useQueryClient();
  const fullscreenExitRef = useRef<() => void>(() => undefined);
  const violations = useCampaignViolationQueue(antiCheatEnabled);
  const { enqueue: enqueueViolation } = violations;
  const proctoring = useCampaignProctoringLifecycle(antiCheatEnabled);

  const handleViolationPause = useCallback(() => setViolationPaused(true), []);
  const handleBehaviorSignal = useCallback((kind: 'tab_switch' | 'paste' | 'focus_lost') => {
    setViolationPaused(true);
    enqueueViolation(kind);
  }, [enqueueViolation]);
  const handleFaceSignal = useCallback(() => undefined, []);
  // ATT1-F4: begin vừa mở khoá đề ⇒ bản cache của trang chuẩn bị (đề bị che) hết hiệu lực.
  const handleSessionBegun = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['practice', 'session', sessionId], refetchType: 'all' });
  }, [queryClient, sessionId]);
  const handleFullscreenExit = useCallback(() => fullscreenExitRef.current(), []);
  const handleEntryError = useCallback(() => setRoomClosed(true), []);
  const fullscreen = useCampaignFullscreen({
    enabled: Boolean(sessionId),
    onExit: antiCheatEnabled ? handleFullscreenExit : undefined,
  });
  // KHÔNG AND thêm điều kiện nào vào `proctoring.proctoringActive` ở đây —
  // `!currentViolation` và `isFullscreen` là hai lỗ AC1 vừa vá, và
  // `CampaignInterviewPage.test.tsx` khoá lại đúng hai vế đó.
  const antiCheat = useCampaignAntiCheat({
    campaignId: resolvedCampaignId,
    sessionId,
    enabled: proctoring.proctoringActive,
    recoveryActive: Boolean(violations.currentViolation),
    stream: media?.stream,
    onPause: handleViolationPause,
    onViolation: enqueueViolation,
    onBehaviorSignal: handleBehaviorSignal,
  });
  fullscreenExitRef.current = antiCheat.reportFullscreenExit;
  const { markCompleted } = proctoring;
  // Hết giờ: thôi giám sát, gỡ overlay; trang chiến dịch phải tải lại trạng thái lượt (bài đã nộp).
  const handleExamTimeUp = useCallback(() => {
    setRoomClosed(true);
    markCompleted();
    void queryClient.invalidateQueries({ queryKey: MY_CAMPAIGNS_QUERY_KEY });
    if (resolvedCampaignId) void queryClient.invalidateQueries({ queryKey: myCampaignDetailQueryKey(resolvedCampaignId) });
  }, [markCompleted, queryClient, resolvedCampaignId]);

  useCampaignFaceCheck({
    campaignId: resolvedCampaignId,
    sessionId,
    enabled: proctoring.proctoringActive,
    videoEl,
    uploadInFlight: answerUploadInFlight,
    onSignal: handleFaceSignal,
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
      violations.resolveCurrent();
      setViolationPaused(false);
    } finally {
      setRecovering(false);
    }
  }, [
    fullscreen,
    recovering,
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
      {!roomClosed && !fullscreen.isFullscreen && !violations.currentViolation ? (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/90 px-4 backdrop-blur-sm">
          <section className="frame-satin w-full max-w-md rounded-2xl bg-surface-raised p-6 text-center shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby="fullscreen-requierror-title">
            <h1 id="fullscreen-requierror-title" className="text-xl font-semibold text-foreground">
              {t('campaigns.fullscreen.title')}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t(fullscreen.hasExited ? 'campaigns.fullscreen.exitWarning' : 'campaigns.fullscreen.required')}
            </p>
            {examClockRunning ? <ExamClockStillRunning className="mt-3 justify-center" /> : null}
            <button type="button" className="btn-primary mt-6 w-full" onClick={() => void fullscreen.enterFullscreen()} disabled={!fullscreen.fullscreenSupported}>
              {t(fullscreen.fullscreenSupported ? 'campaigns.fullscreen.enter' : 'campaigns.fullscreen.unsupported')}
            </button>
          </section>
        </div>
      ) : null}

      <CampaignViolationDialog
        violation={roomClosed ? null : violations.currentViolation}
        pendingCount={violations.pendingCount}
        recovering={recovering}
        recoveryError={recoveryError}
        examClockRunning={examClockRunning}
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
        beginOnEnter
        onSessionBegun={handleSessionBegun}
        onExamClockChange={setExamClockRunning}
        onExamTimeUp={handleExamTimeUp}
        onEntryError={handleEntryError}
        examTimeUpBackPath={resolvedCampaignId ? `/candidate/campaigns/${resolvedCampaignId}` : undefined}
        completePath="/candidate/campaigns"
        violationPaused={violationPaused || Boolean(violations.currentViolation) || !fullscreen.isFullscreen}
        cameraAlwaysOn
        onMediaContextChange={handleMediaContext}
        onPhaseChange={proctoring.handlePhaseChange}
        onSessionSubmitting={proctoring.markCompleted}
        onAnswerUploadStateChange={setAnswerUploadInFlight}
      />
    </div>
  );
}

