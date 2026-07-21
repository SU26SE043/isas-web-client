import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiStatusCode } from '@/shared/api/apiError';
import { getQuestionSpeech } from '../services/b2cPracticeSession.service';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';

export function useQuestionSpeech(sessionId: string | null, questionId: string | null) {
  const setSpeechWarning = useB2cPracticeInterviewStore((s) => s.setSpeechWarning);
  const setQuestionState = useB2cPracticeInterviewStore((s) => s.setQuestionState);
  const [isLoadingSpeech, setIsLoadingSpeech] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsManualPlay, setNeedsManualPlay] = useState(false);
  const cacheRef = useRef<Map<string, Blob>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const lastAutoQuestionRef = useRef<string | null>(null);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playBlob = useCallback(
    async (blob: Blob) => {
      stopPlayback();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      setIsPlaying(true);
      try {
        await audio.play();
        await new Promise<void>((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
        });
      } catch {
        setNeedsManualPlay(true);
      } finally {
        setIsPlaying(false);
      }
    },
    [stopPlayback],
  );

  const loadAndPlay = useCallback(
    async (opts?: { force?: boolean }) => {
      if (!sessionId || !questionId) return;
      setIsLoadingSpeech(true);
      setSpeechWarning(null);
      try {
        let blob = cacheRef.current.get(questionId);
        if (!blob) {
          blob = await getQuestionSpeech(sessionId, questionId);
          cacheRef.current.set(questionId, blob);
        }
        setQuestionState(questionId, 'reading_question');
        await playBlob(blob);
        setNeedsManualPlay(false);
        setQuestionState(questionId, 'not_started');
      } catch (error) {
        const status = getApiStatusCode(error);
        if (status === 403) {
          setSpeechWarning('practice.errors.speechForbidden');
        } else if (status === 404) {
          setSpeechWarning('practice.errors.speechNotFound');
        } else {
          setSpeechWarning('practice.speech.unavailable');
        }
        if (opts?.force) setNeedsManualPlay(true);
      } finally {
        setIsLoadingSpeech(false);
      }
    },
    [playBlob, questionId, sessionId, setQuestionState, setSpeechWarning],
  );

  useEffect(() => {
    if (!sessionId || !questionId) return;
    if (lastAutoQuestionRef.current === questionId) return;
    lastAutoQuestionRef.current = questionId;
    void loadAndPlay();
  }, [loadAndPlay, questionId, sessionId]);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  const replay = useCallback(async () => {
    if (!questionId) return;
    await loadAndPlay({ force: true });
  }, [loadAndPlay, questionId]);

  return {
    isLoadingSpeech,
    isPlaying,
    needsManualPlay,
    replay,
    playManual: () => void loadAndPlay({ force: true }),
    stopPlayback,
  };
}
