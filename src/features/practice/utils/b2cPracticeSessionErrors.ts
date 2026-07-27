import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import type { CreatePracticeSessionErrorCode } from '../types/b2cPracticeSession.types';

export function mapCreatePracticeSessionError(error: unknown): {
  code: CreatePracticeSessionErrorCode;
  message: string;
  status?: number;
} {
  const status = getApiStatusCode(error);
  const message = getApiErrorMessage(error);

  if (status === 401) {
    return { code: 'unauthorized', message, status };
  }
  if (status === 402) {
    return { code: 'insufficient_credit', message, status };
  }
  if (status === 502) {
    return { code: 'ai_failed', message, status };
  }
  if (status === 400) {
    const lower = message.toLowerCase();
    if (lower.includes('jobcategory') || lower.includes('job category') || lower.includes('nhóm nghề')) {
      return { code: 'job_category_required', message, status };
    }
    if (lower.includes('timelimit') || lower.includes('time limit') || lower.includes('60')) {
      return { code: 'invalid_time_limit', message, status };
    }
    if (lower.includes('questioncount') || lower.includes('question count')) {
      return { code: 'invalid_question_count', message, status };
    }
    if (lower.includes('jdtext') || lower.includes('20') || lower.includes('ký tự') || lower.includes('character')) {
      return { code: 'jd_too_long', message, status };
    }
    return { code: 'create_failed', message, status };
  }

  return { code: 'generic', message, status };
}

export function mapSubmitPracticeAnswerErrorKey(status: number | undefined): string {
  if (status === 400) return 'practice.errors.audioRequired';
  if (status === 403) return 'practice.errors.forbidden';
  if (status === 404) return 'practice.errors.questionNotFound';
  if (status === 409) return 'practice.errors.conflict';
  if (status === 500) return 'practice.errors.submitAnswerFailed';
  return 'practice.errors.submitAnswerFailed';
}
