import type { InterviewFlowProgress } from '../types/interviewFlow.types';

const storageKey = (sessionId: string) => `isas-interview-flow:${sessionId}`;

export function loadFlowProgress(sessionId: string): Partial<InterviewFlowProgress> | null {
  try {
    const raw = sessionStorage.getItem(storageKey(sessionId));
    if (!raw) return null;
    return JSON.parse(raw) as Partial<InterviewFlowProgress>;
  } catch {
    return null;
  }
}

export function saveFlowProgress(sessionId: string, progress: InterviewFlowProgress) {
  try {
    sessionStorage.setItem(storageKey(sessionId), JSON.stringify(progress));
  } catch {
    // sessionStorage may be unavailable in private mode
  }
}

export function clearFlowProgress(sessionId: string) {
  try {
    sessionStorage.removeItem(storageKey(sessionId));
  } catch {
    // ignore
  }
}
