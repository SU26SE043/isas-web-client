import { useRef } from 'react';

interface FrozenRecorderDuration {
  questionId: string;
  seconds: number;
}

export function useFrozenRecorderDuration(
  questionId: string | null,
  remainingSeconds: number,
  timeLimitSec?: number,
) {
  const durationRef = useRef<FrozenRecorderDuration | null>(null);
  const liveDuration = Math.max(
    1,
    Math.min(
      remainingSeconds || timeLimitSec || 120,
      timeLimitSec || remainingSeconds || 120,
    ),
  );

  if (!questionId) {
    durationRef.current = null;
  } else if (durationRef.current?.questionId !== questionId) {
    durationRef.current = { questionId, seconds: liveDuration };
  }

  return durationRef.current?.seconds ?? liveDuration;
}
