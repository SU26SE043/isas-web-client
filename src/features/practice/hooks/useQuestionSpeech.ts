import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiStatusCode } from '@/shared/api/apiError';
import { getQuestionSpeech } from '../services/b2cPracticeSession.service';
import { attachSpeechAudio, detachSpeechAudio } from '../utils/interviewerSpeechBus';
import { waitForSpeechEnd } from '../utils/speechPlaybackWatchdog';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';

export const SPEECH_LOAD_TIMEOUT_MS = 9_000;

interface UseQuestionSpeechOptions {
  /** Tải trước ngay khi có câu hỏi; chỉ phát khi gate này mở. */
  enabled?: boolean;
  /** Nội dung render độc lập; dùng cho giọng đọc trình duyệt khi API TTS bị chậm/hỏng. */
  text?: string | null;
  language?: 'vi' | 'en' | null;
  onPlaybackStart?: () => void;
  onPlaybackComplete?: () => void;
}

type PreparedSpeech =
  | { questionId: string; kind: 'audio'; blob: Blob }
  | { questionId: string; kind: 'browser'; text: string; language: 'vi' | 'en' };

class SpeechLoadTimeoutError extends Error {
  constructor() {
    super('speech-load-timeout');
    this.name = 'SpeechLoadTimeoutError';
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, onTimeout: () => void): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      onTimeout();
      reject(new SpeechLoadTimeoutError());
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== null) clearTimeout(timer);
  });
}

export function useQuestionSpeech(
  sessionId: string | null,
  questionId: string | null,
  options: UseQuestionSpeechOptions = {},
) {
  const setSpeechWarning = useB2cPracticeInterviewStore((s) => s.setSpeechWarning);
  const setQuestionState = useB2cPracticeInterviewStore((s) => s.setQuestionState);
  const [speechState, setSpeechState] = useState<{
    questionId: string | null;
    status: 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'failed';
  }>({ questionId: null, status: 'idle' });
  const [needsManualPlay, setNeedsManualPlay] = useState(false);
  const cacheRef = useRef<Map<string, Blob>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const preparedRef = useRef<PreparedSpeech | null>(null);
  const playedQuestionRef = useRef<string | null>(null);
  const pausedByViolationRef = useRef(false);
  const playbackSourceRef = useRef<'audio' | 'browser' | null>(null);
  const operationRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const enabledRef = useRef(options.enabled ?? true);
  const callbacksRef = useRef({
    onPlaybackStart: options.onPlaybackStart,
    onPlaybackComplete: options.onPlaybackComplete,
  });

  enabledRef.current = options.enabled ?? true;
  callbacksRef.current = {
    onPlaybackStart: options.onPlaybackStart,
    onPlaybackComplete: options.onPlaybackComplete,
  };

  const releasePlayer = useCallback(() => {
    pausedByViolationRef.current = false;
    playbackSourceRef.current = null;
    detachSpeechAudio();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stopPlayback = useCallback(() => {
    operationRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    preparedRef.current = null;
    releasePlayer();
    setSpeechState({ questionId: null, status: 'idle' });
  }, [releasePlayer]);

  const playBlob = useCallback(
    async (blob: Blob, activeQuestionId: string, operation: number, signal: AbortSignal) => {
      if (operationRef.current !== operation || signal.aborted) return;
      releasePlayer();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.src = url;
      playbackSourceRef.current = 'audio';
      setNeedsManualPlay(false);
      setQuestionState(activeQuestionId, 'reading_question');
      setSpeechState({ questionId: activeQuestionId, status: 'playing' });
      callbacksRef.current.onPlaybackStart?.();

      let played = false;
      try {
        await audio.play();
        played = true;
        await attachSpeechAudio(audio);
        await waitForSpeechEnd(audio, undefined, signal);
      } catch {
        if (operationRef.current !== operation || signal.aborted) return;
        setNeedsManualPlay(true);
        setSpeechWarning('practice.speech.unavailable');
      } finally {
        if (operationRef.current !== operation || signal.aborted) return;
        releasePlayer();
        setQuestionState(activeQuestionId, 'not_started');
        setSpeechState({ questionId: activeQuestionId, status: played ? 'ready' : 'failed' });
        callbacksRef.current.onPlaybackComplete?.();
      }
    },
    [releasePlayer, setQuestionState, setSpeechWarning],
  );

  const playBrowserSpeech = useCallback(
    async (
      text: string,
      language: 'vi' | 'en',
      activeQuestionId: string,
      operation: number,
      signal: AbortSignal,
    ) => {
      if (operationRef.current !== operation || signal.aborted) return;
      if (
        typeof window === 'undefined'
        || !('speechSynthesis' in window)
        || typeof SpeechSynthesisUtterance === 'undefined'
      ) {
        throw new Error('browser-speech-unavailable');
      }

      releasePlayer();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-US' : 'vi-VN';
      playbackSourceRef.current = 'browser';
      setNeedsManualPlay(false);
      setQuestionState(activeQuestionId, 'reading_question');
      setSpeechState({ questionId: activeQuestionId, status: 'playing' });
      callbacksRef.current.onPlaybackStart?.();

      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let rejectOnAbort: ((reason?: unknown) => void) | null = null;
      const abort = () => {
        window.speechSynthesis.cancel();
        rejectOnAbort?.(new DOMException('Aborted', 'AbortError'));
      };
      signal.addEventListener('abort', abort, { once: true });
      try {
        await new Promise<void>((resolve, reject) => {
          rejectOnAbort = reject;
          utterance.onend = () => resolve();
          utterance.onerror = () => reject(new Error('browser-speech-error'));
          timeoutId = setTimeout(() => reject(new Error('browser-speech-timeout')), 60_000);
          window.speechSynthesis.speak(utterance);
        });
      } catch {
        if (operationRef.current !== operation || signal.aborted) return;
        setNeedsManualPlay(true);
        setSpeechWarning('practice.speech.unavailable');
      } finally {
        signal.removeEventListener('abort', abort);
        rejectOnAbort = null;
        if (timeoutId !== null) clearTimeout(timeoutId);
        if (operationRef.current !== operation || signal.aborted) return;
        releasePlayer();
        setQuestionState(activeQuestionId, 'not_started');
        setSpeechState({ questionId: activeQuestionId, status: 'ready' });
        callbacksRef.current.onPlaybackComplete?.();
      }
    },
    [releasePlayer, setQuestionState, setSpeechWarning],
  );

  const playPrepared = useCallback(async () => {
    const prepared = preparedRef.current;
    if (!prepared || !enabledRef.current) return;
    if (playedQuestionRef.current === prepared.questionId) return;
    playedQuestionRef.current = prepared.questionId;
    const operation = operationRef.current;
    const controller = abortRef.current ?? new AbortController();
    abortRef.current = controller;
    if (prepared.kind === 'audio') {
      await playBlob(prepared.blob, prepared.questionId, operation, controller.signal);
      return;
    }
    await playBrowserSpeech(
      prepared.text,
      prepared.language,
      prepared.questionId,
      operation,
      controller.signal,
    );
  }, [playBlob, playBrowserSpeech]);

  const load = useCallback(
    async (activeSessionId: string, activeQuestionId: string, forcePlay = false) => {
      const operation = ++operationRef.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      preparedRef.current = null;
      if (forcePlay) playedQuestionRef.current = null;
      setNeedsManualPlay(false);
      setSpeechWarning(null);
      setSpeechState({ questionId: activeQuestionId, status: 'loading' });

      try {
        let blob = cacheRef.current.get(activeQuestionId);
        if (!blob) {
          blob = await withTimeout(
            getQuestionSpeech(activeSessionId, activeQuestionId, controller.signal),
            SPEECH_LOAD_TIMEOUT_MS,
            () => controller.abort(),
          );
          cacheRef.current.set(activeQuestionId, blob);
        }
        if (operationRef.current !== operation || controller.signal.aborted) return;
        preparedRef.current = { questionId: activeQuestionId, kind: 'audio', blob };
        setSpeechState({ questionId: activeQuestionId, status: 'ready' });
        if (enabledRef.current || forcePlay) await playPrepared();
      } catch (error) {
        if (operationRef.current !== operation) return;
        const status = getApiStatusCode(error);
        if (status === 403) setSpeechWarning('practice.errors.speechForbidden');
        else if (status === 404) setSpeechWarning('practice.errors.speechNotFound');
        else {
          const fallbackText = options.text?.trim();
          if (
            fallbackText
            && typeof window !== 'undefined'
            && 'speechSynthesis' in window
            && typeof SpeechSynthesisUtterance !== 'undefined'
          ) {
            const fallbackController = new AbortController();
            abortRef.current = fallbackController;
            preparedRef.current = {
              questionId: activeQuestionId,
              kind: 'browser',
              text: fallbackText,
              language: options.language === 'en' ? 'en' : 'vi',
            };
            setSpeechWarning(null);
            setSpeechState({ questionId: activeQuestionId, status: 'ready' });
            if (enabledRef.current || forcePlay) await playPrepared();
            return;
          }
          setSpeechWarning('practice.speech.unavailable');
        }
        setNeedsManualPlay(true);
        setSpeechState({ questionId: activeQuestionId, status: 'failed' });
        callbacksRef.current.onPlaybackComplete?.();
      }
    },
    [options.language, options.text, playPrepared, setSpeechWarning],
  );

  useEffect(() => {
    if (!sessionId || !questionId) {
      stopPlayback();
      return undefined;
    }
    playedQuestionRef.current = null;
    void load(sessionId, questionId);
    return () => {
      // StrictMode cố ý setup → cleanup → setup. Không giữ cờ "đã tự phát" qua
      // cleanup; lượt setup thứ hai phải được phép tải/phát lại.
      operationRef.current += 1;
      abortRef.current?.abort();
      abortRef.current = null;
      releasePlayer();
    };
  }, [load, questionId, releasePlayer, sessionId, stopPlayback]);

  useEffect(() => {
    if (!enabledRef.current) return;
    void playPrepared();
  }, [options.enabled, playPrepared, speechState.questionId, speechState.status]);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  const replay = useCallback(async () => {
    if (!sessionId || !questionId) return;
    const cached = cacheRef.current.get(questionId);
    if (cached) {
      preparedRef.current = { questionId, kind: 'audio', blob: cached };
      playedQuestionRef.current = null;
      enabledRef.current = true;
      await playPrepared();
      return;
    }
    await load(sessionId, questionId, true);
  }, [load, playPrepared, questionId, sessionId]);

  const pausePlayback = useCallback(() => {
    if (
      playbackSourceRef.current === 'browser'
      && typeof window !== 'undefined'
      && 'speechSynthesis' in window
    ) {
      pausedByViolationRef.current = true;
      window.speechSynthesis.pause();
      setSpeechState((current) => ({ ...current, status: 'paused' }));
      return;
    }
    const audio = audioRef.current;
    if (!audio || audio.paused) return;
    pausedByViolationRef.current = true;
    audio.pause();
    // Pause do violation/fullscreen exit vẫn là một lượt đọc chưa hoàn tất;
    // giữ mic khóa cho tới khi audio resume và kết thúc (hoặc watchdog mở khóa).
    setSpeechState((current) => ({ ...current, status: 'paused' }));
  }, []);

  const resumePlayback = useCallback(async () => {
    if (
      playbackSourceRef.current === 'browser'
      && pausedByViolationRef.current
      && typeof window !== 'undefined'
      && 'speechSynthesis' in window
    ) {
      pausedByViolationRef.current = false;
      window.speechSynthesis.resume();
      setSpeechState((current) => ({ ...current, status: 'playing' }));
      return;
    }
    const audio = audioRef.current;
    if (!audio || !pausedByViolationRef.current) return;
    pausedByViolationRef.current = false;
    try {
      await audio.play();
      setSpeechState((current) => ({ ...current, status: 'playing' }));
    } catch {
      setNeedsManualPlay(true);
      setSpeechState((current) => ({ ...current, status: 'failed' }));
    }
  }, []);

  const currentStatus = speechState.questionId === questionId ? speechState.status : 'loading';
  const isLoadingSpeech = currentStatus === 'loading';
  const isPlaying = currentStatus === 'playing';
  // `ready` chỉ thật sự rảnh sau khi câu này đã phát xong. Khi gate vừa mở,
  // blob đã preload có thể nằm ở `ready` đúng một render trước effect gọi
  // play(); coi render đó là busy để mic không chớp mở giữa hai trạng thái.
  const isQueuedToPlay =
    currentStatus === 'ready'
    && enabledRef.current
    && playedQuestionRef.current !== questionId;

  return {
    isLoadingSpeech,
    isPlaying,
    isBusy: Boolean(questionId)
      && (isLoadingSpeech || isPlaying || isQueuedToPlay || currentStatus === 'paused'),
    needsManualPlay,
    replay,
    playManual: () => void replay(),
    stopPlayback,
    pausePlayback,
    resumePlayback,
  };
}
