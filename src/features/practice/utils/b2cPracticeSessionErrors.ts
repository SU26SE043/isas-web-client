import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import type { CreatePracticeSessionErrorCode } from '../types/b2cPracticeSession.types';
import { getPracticeApiErrorCode } from './practiceApiErrorCode';

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
  if (status === 429) {
    return { code: 'platform_capacity', message, status };
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

/**
 * ATT1 [I3]/[I1] — mã lỗi riêng của buổi thi tính giờ. Đọc `code` TRƯỚC `status`: cả ba đều là 409, nếu đọc
 * status trước thì ứng viên chỉ thấy câu chung chung "practice.errors.conflict" thay vì biết đã hết giờ.
 */
const SESSION_ERROR_CODE_KEYS: Readonly<Record<string, string>> = {
  SESSION_NOT_BEGUN: 'practice.errors.sessionNotBegun',
  SESSION_TIME_UP: 'practice.errors.sessionTimeUp',
  SESSION_ENDED: 'practice.errors.sessionEnded',
};

/** Khoá i18n cho lỗi nộp câu trả lời: `code` trong body (ATT1) trước, rồi mới tới HTTP status như cũ. */
export function mapSubmitPracticeAnswerErrorKey(error: unknown): string {
  const code = getPracticeApiErrorCode(error);
  const byCode = code ? SESSION_ERROR_CODE_KEYS[code] : undefined;
  if (byCode) return byCode;
  const status = getApiStatusCode(error);
  if (status === 400) return 'practice.errors.audioRequired';
  if (status === 403) return 'practice.errors.forbidden';
  if (status === 404) return 'practice.errors.questionNotFound';
  // 409 KHÔNG có code (Backend cũ / xung đột khác) giữ câu cũ.
  if (status === 409) return 'practice.errors.conflict';
  if (status === 500) return 'practice.errors.submitAnswerFailed';
  return 'practice.errors.submitAnswerFailed';
}

/**
 * Nộp bài (submit) trả 400 "đã nộp rồi" ⇒ coi như đã nộp. Tách từ `confirmFinish` để màn hết giờ (ATT1-F5)
 * dùng ĐÚNG cùng luật — không tự chế luật thứ hai.
 */
export function isSessionAlreadySubmittedError(error: unknown): boolean {
  if (getApiStatusCode(error) !== 400) return false;
  const message = getApiErrorMessage(error, '').toLowerCase();
  return (
    message.includes('already') ||
    message.includes('submitted') ||
    message.includes('đã submit') ||
    message.includes('da submit')
  );
}
