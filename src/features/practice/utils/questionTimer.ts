import type { TimerSeverity } from '../types/interviewSession.types';

const WARNING_THRESHOLD_SECONDS = 30;
const CRITICAL_THRESHOLD_SECONDS = 10;

export function getTimerSeverity(remainingSeconds: number): TimerSeverity {
  if (remainingSeconds <= CRITICAL_THRESHOLD_SECONDS) return 'critical';
  if (remainingSeconds <= WARNING_THRESHOLD_SECONDS) return 'warning';
  return 'normal';
}

export function getTimerColorClass(severity: TimerSeverity): string {
  switch (severity) {
    case 'critical':
      return 'text-error';
    case 'warning':
      return 'text-warning';
    default:
      return 'text-foreground';
  }
}

export function formatTimerSeconds(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getQuestionTimeLimit(question?: { timeLimitSeconds?: number }): number {
  return question?.timeLimitSeconds ?? 120;
}
