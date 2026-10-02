import { submitPracticeAnswer } from '../services/b2cPracticeSession.service';
import type {
  SubmitPracticeAnswerInput,
  SubmitPracticeAnswerResponse,
} from '../types/b2cPracticeSession.types';
import { getPracticeApiErrorCode } from '../utils/practiceApiErrorCode';
import { beginSessionOnce } from './enterExamRoom';

/**
 * ATT1 [I3] — nộp câu trả lời; server báo 409 `SESSION_NOT_BEGUN` (đề còn khoá — buổi chưa "vào phòng")
 * ⇒ begin [I1] rồi thử lại ĐÚNG 1 lần. Lần thử lại lỗi nữa ⇒ ném nguyên lỗi đó, không vòng lặp.
 * Mọi lỗi khác (kể cả `SESSION_TIME_UP`) ném ngay, không begin.
 */
export async function submitAnswerWithBeginRetry(
  input: SubmitPracticeAnswerInput,
): Promise<SubmitPracticeAnswerResponse> {
  try {
    return await submitPracticeAnswer(input);
  } catch (error) {
    if (getPracticeApiErrorCode(error) !== 'SESSION_NOT_BEGUN') throw error;
    await beginSessionOnce(input.sessionId);
    return submitPracticeAnswer(input);
  }
}
