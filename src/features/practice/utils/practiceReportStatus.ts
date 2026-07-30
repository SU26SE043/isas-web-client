import type { PracticeSessionResponse } from '../types/b2cPracticeSession.types';

const FAILED_REPORT_STATUSES = new Set(['failed', 'sessionabandoned', 'abandoned']);

export function isPracticeReportFailed(status: string): boolean {
  return FAILED_REPORT_STATUSES.has(status.trim().toLowerCase().replaceAll('_', ''));
}

export function isPracticeReportReady(session: PracticeSessionResponse): boolean {
  return session.status.trim().toLowerCase() === 'scored' && session.result != null;
}

export function isPracticeReportPending(session: PracticeSessionResponse): boolean {
  return !isPracticeReportReady(session) && !isPracticeReportFailed(session.status);
}

export function shouldPollPracticeReport(session: PracticeSessionResponse): boolean {
  const status = session.status.trim().toLowerCase();
  return status !== 'scored' && !isPracticeReportFailed(status);
}
