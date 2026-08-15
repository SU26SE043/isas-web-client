import type { PracticeSessionResponse } from '../types/b2cPracticeSession.types';

const FAILED_REPORT_STATUSES = new Set(['failed', 'sessionabandoned', 'abandoned']);

export function isPracticeReportFailed(status: string): boolean {
  return FAILED_REPORT_STATUSES.has(status.trim().toLowerCase().replaceAll('_', ''));
}

export function isPracticeReportReady(session: PracticeSessionResponse): boolean {
  // The report payload is the source of truth for the UI. The API contract
  // normally pairs it with `Scored`, but a completed job can be returned with
  // a transitional status while the status projection catches up. Waiting on
  // the enum alone makes the complete screen poll forever even though the
  // report is already available.
  return session.result != null;
}

export function isPracticeReportPending(session: PracticeSessionResponse): boolean {
  return !isPracticeReportReady(session) && !isPracticeReportFailed(session.status);
}

export function shouldPollPracticeReport(session: PracticeSessionResponse): boolean {
  return !isPracticeReportReady(session) && !isPracticeReportFailed(session.status);
}
