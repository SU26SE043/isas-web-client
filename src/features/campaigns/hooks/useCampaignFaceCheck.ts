import { useCallback, useEffect, useRef } from 'react';
import { campaignCandidateService } from '../services/campaignCandidate.service';
import type { FaceCheckResponse } from '../types/campaignCandidate.types';
import type { CampaignFaceSignal } from '../types/campaignViolation.types';
import { captureVideoFrameAsJpegFile } from '../utils/captureJpegFile';
import { enqueueCampaignFlag } from '../utils/campaignFlagQueue';

export const FACE_CHECK_INTERVAL_MS = 30_000;
export const FACE_CHECK_ALERT_INTERVAL_MS = 10_000;

interface UseCampaignFaceCheckOptions {
  campaignId: string;
  sessionId: string;
  enabled: boolean;
  videoEl: HTMLVideoElement | null;
  completed?: boolean;
  uploadInFlight?: boolean;
  onSignal: (signal: CampaignFaceSignal) => void;
}

function resolveSignals(result: FaceCheckResponse): CampaignFaceSignal[] {
  const supported = result.signals.filter((signal): signal is CampaignFaceSignal =>
    signal === 'no_face'
      || signal === 'multiple_faces'
      || signal === 'face_mismatch'
      || signal === 'identity_unverified',
  );
  if (supported.length > 0) return supported;
  if (result.faceCount === 0) return ['no_face'];
  if (result.faceCount > 1) return ['multiple_faces'];
  if (!result.match) return ['face_mismatch'];
  return [];
}

export function useCampaignFaceCheck({
  campaignId,
  sessionId,
  enabled,
  videoEl,
  completed = false,
  uploadInFlight = false,
  onSignal,
}: UseCampaignFaceCheckOptions) {
  const inFlight = useRef(false);
  const aborted = useRef(false);
  const activeSignals = useRef(new Set<CampaignFaceSignal>());
  const timer = useRef<number | null>(null);
  const deferred = useRef(false);
  const uploadRef = useRef(uploadInFlight);
  const scheduledInterval = useRef(FACE_CHECK_INTERVAL_MS);
  const lastSuccessfulCheckAt = useRef<number | null>(null);
  const cleanStreak = useRef(0);

  useEffect(() => {
    aborted.current = false;
    return () => {
      aborted.current = true;
    };
  }, []);

  const sendFlag = useCallback((signalType: 'monitoring_gap', note: string) => {
    if (!enabled || aborted.current || !campaignId || !sessionId) return;
    enqueueCampaignFlag(campaignId, sessionId, signalType, note);
  }, [campaignId, enabled, sessionId]);

  const runCheck = useCallback(async (scheduledIntervalMs?: number) => {
    if (
      !enabled
      || aborted.current
      || inFlight.current
      || completed
      || uploadRef.current
      || document.visibilityState === 'hidden'
      || !videoEl
    ) return null;
    inFlight.current = true;
    try {
      let file = await captureVideoFrameAsJpegFile(
        videoEl,
        `face-check-${sessionId}-${Date.now()}.jpg`,
      );
      if (!file) {
        const freshVideoEl = document.querySelector<HTMLVideoElement>(
          '[data-campaign-interview] video',
        );
        if (freshVideoEl && freshVideoEl !== videoEl) {
          file = await captureVideoFrameAsJpegFile(
            freshVideoEl,
            `face-check-${sessionId}-${Date.now()}.jpg`,
          );
        }
      }
      if (!file || aborted.current) return null;
      const result = await campaignCandidateService.checkCampaignFace(
        campaignId,
        sessionId,
        file,
      );
      if (!result) {
        activeSignals.current.clear();
      }
      const signals = result ? resolveSignals(result) : [];
      const now = Date.now();
      if (
        scheduledIntervalMs != null
        && lastSuccessfulCheckAt.current != null
        && now - lastSuccessfulCheckAt.current > scheduledIntervalMs * 2
      ) {
        const elapsedSeconds = Math.round((now - lastSuccessfulCheckAt.current) / 1000);
        const normalSeconds = Math.round(scheduledIntervalMs / 1000);
        sendFlag(
          'monitoring_gap',
          `Khoảng cách giữa 2 lần kiểm tra khuôn mặt ~${elapsedSeconds}s (nhịp bình thường ${normalSeconds}s)`,
        );
      }
      lastSuccessfulCheckAt.current = now;
      for (const signal of signals) {
        if (!activeSignals.current.has(signal)) onSignal(signal);
      }
      activeSignals.current = new Set(signals);
      if (signals.length > 0) cleanStreak.current = 0;
      else cleanStreak.current += 1;
      scheduledInterval.current = signals.length > 0
        ? FACE_CHECK_ALERT_INTERVAL_MS
        : cleanStreak.current >= 2
          ? FACE_CHECK_INTERVAL_MS
          : scheduledIntervalMs ?? FACE_CHECK_INTERVAL_MS;
      return { safe: signals.length === 0, signals };
    } catch {
      return null;
    } finally {
      inFlight.current = false;
    }
  }, [campaignId, completed, enabled, onSignal, sendFlag, sessionId, videoEl]);

  const checkNow = useCallback(() => runCheck(), [runCheck]);

  const runScheduledCheck = useCallback(async (intervalMs: number) => {
    if (uploadRef.current || document.visibilityState === 'hidden') {
      deferred.current = true;
      return;
    }
    await runCheck(intervalMs);
    if (!aborted.current) scheduleNextRef.current(scheduledInterval.current);
  }, [runCheck]);

  const scheduleNextRef = useRef<(intervalMs: number) => void>(() => undefined);
  const runScheduledCheckRef = useRef(runScheduledCheck);
  runScheduledCheckRef.current = runScheduledCheck;
  const flushDeferredCheck = useCallback(async () => {
    if (uploadRef.current || document.visibilityState === 'hidden' || !deferred.current) return;
    deferred.current = false;
    await runCheck(scheduledInterval.current);
    if (!aborted.current) scheduleNextRef.current(scheduledInterval.current);
  }, [runCheck]);
  const flushDeferredCheckRef = useRef(flushDeferredCheck);
  flushDeferredCheckRef.current = flushDeferredCheck;

  useEffect(() => {
    if (!enabled || completed || !campaignId || !sessionId) return undefined;
    const scheduleNext = (intervalMs: number) => {
      if (timer.current != null) window.clearTimeout(timer.current);
      scheduledInterval.current = intervalMs;
      timer.current = window.setTimeout(() => {
        timer.current = null;
        void runScheduledCheckRef.current(intervalMs);
      }, intervalMs);
    };
    scheduleNextRef.current = scheduleNext;
    scheduleNext(FACE_CHECK_INTERVAL_MS);
    return () => {
      activeSignals.current.clear();
      if (timer.current != null) window.clearTimeout(timer.current);
      timer.current = null;
      scheduleNextRef.current = () => undefined;
    };
  }, [campaignId, completed, enabled, sessionId]);

  useEffect(() => {
    uploadRef.current = uploadInFlight;
    if (!uploadInFlight) void flushDeferredCheckRef.current();
  }, [flushDeferredCheck, uploadInFlight]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void flushDeferredCheckRef.current();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return { checkNow };
}
