import { useCallback, useEffect, useRef, useState } from 'react';

export function useAnswerPlayback(audioFile: File | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
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

  const play = useCallback(async () => {
    if (!audioFile) return;
    stop();
    const url = URL.createObjectURL(audioFile);
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
      // Autoplay blocked or decode error — caller may show manual retry.
    } finally {
      setIsPlaying(false);
    }
  }, [audioFile, stop]);

  useEffect(() => () => stop(), [stop]);

  return { isPlaying, play, stop };
}
