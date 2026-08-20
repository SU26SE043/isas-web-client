import {
  PRACTICE_JD_TEXT_MAX_CHARS,
  PRACTICE_QUESTION_COUNT_MAX,
  PRACTICE_QUESTION_COUNT_MIN,
  PRACTICE_TIME_LIMIT_OPTIONS,
  type CreatePracticeSessionRequest,
  type PracticeJobCategory,
  type PracticeSetupState,
  type PracticeTimeLimitSec,
} from '../types/b2cPracticeSession.types';

export function isPracticeJobCategory(value: unknown): value is PracticeJobCategory {
  return value === 'BA' || value === 'BE' || value === 'FE';
}

export function isPracticeTimeLimitSec(value: unknown): value is PracticeTimeLimitSec {
  return (
    typeof value === 'number' &&
    (PRACTICE_TIME_LIMIT_OPTIONS as readonly number[]).includes(value)
  );
}

export function isValidPracticeQuestionCount(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= PRACTICE_QUESTION_COUNT_MIN &&
    value <= PRACTICE_QUESTION_COUNT_MAX
  );
}

export function canStartPracticeSession(state: PracticeSetupState): boolean {
  if (!state.jobCategory) return false;
  if (!isValidPracticeQuestionCount(state.questionCount)) return false;
  if (!isPracticeTimeLimitSec(state.timeLimitSec)) return false;
  if (state.jdText.trim().length > PRACTICE_JD_TEXT_MAX_CHARS) return false;
  return true;
}

/**
 * Build create-session payload: jdText wins over jdId; omit empty strings.
 */
export function buildCreatePracticeSessionRequest(
  state: PracticeSetupState,
): CreatePracticeSessionRequest {
  if (!state.jobCategory) {
    throw new Error('jobCategory is required');
  }

  const normalizedJdText = state.jdText.trim();

  return {
    jobCategory: state.jobCategory,
    cvId: state.cvId || undefined,
    jdText: normalizedJdText.length > 0 ? normalizedJdText : undefined,
    jdId: normalizedJdText.length > 0 ? undefined : state.jdId || undefined,
    timeLimitSec: state.timeLimitSec,
    questionCount: state.questionCount,
    language: state.language,
    seniority: state.seniority,
    // `false` = ứng viên xin buổi tĩnh. Chỉ gửi khi TẮT: `true` là mặc định của server và gửi nó
    // không bật được gì (server chỉ cho từ chối, không cho tự bật), nên gửi thừa chỉ làm payload
    // trông như đang điều khiển một thứ nó không điều khiển được.
    adaptiveEnabled: state.adaptiveEnabled ? undefined : false,
    // null = chưa biết dải server cho phép ⇒ KHÔNG gửi khoá, để server dùng mặc định của nó.
    // Tuyệt đối không gửi 0 thay cho "tắt": server từ chối 0, và 0 vốn có nghĩa khác (chế độ engine).
    maxDeepPerQuestion:
      state.adaptiveEnabled && state.maxDeepPerQuestion !== null
        ? state.maxDeepPerQuestion
        : undefined,
  };
}
