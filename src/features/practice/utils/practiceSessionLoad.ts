import { getApiStatusCode } from '@/shared/api/apiError';

export function normalizePracticeSessionId(value: string | undefined): string | null {
  const sessionId = value?.trim();
  if (!sessionId || sessionId === 'undefined' || sessionId === 'null') return null;
  return sessionId;
}

export function practiceSessionErrorMessageKey(error: unknown): string {
  switch (getApiStatusCode(error)) {
    case 401:
      return 'practice.session.unauthorized';
    case 403:
      return 'practice.session.forbidden';
    case 404:
      return 'practice.session.notFound';
    default:
      return 'practice.session.loadErrorDescription';
  }
}
