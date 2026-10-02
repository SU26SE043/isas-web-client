import type {
  CampaignInterviewStatus,
  CandidateCampaignDetailResponse,
} from '../types/campaignCandidate.types';

/**
 * ATT1-F3 — trạng thái lượt làm bài của ứng viên (trang chi tiết + thẻ).
 *
 * Luật (hợp đồng [C6]): hết lượt CHỈ dựa trên attemptsUsed / maxAttempts — KHÔNG suy từ
 * interviewStatus, vì Backend hiện lượt bỏ ngang là NotStarted. Thiếu một trong hai số (Backend cũ)
 * ⇒ "không theo dõi lượt" ⇒ trang chạy y như trước ATT1 (nút Bắt đầu vẫn có).
 */
export interface CampaignAttemptCounts {
  used: number;
  max: number;
  remaining: number;
}

interface AttemptFields {
  interviewStatus: CampaignInterviewStatus;
  maxAttempts?: number;
  attemptsUsed?: number;
}

export function readAttemptCounts(fields: AttemptFields): CampaignAttemptCounts | null {
  const { maxAttempts, attemptsUsed } = fields;
  if (typeof maxAttempts !== 'number' || typeof attemptsUsed !== 'number') return null;
  return { used: attemptsUsed, max: maxAttempts, remaining: Math.max(0, maxAttempts - attemptsUsed) };
}

/** ④ hết lượt: đã dùng ≥ tối đa và không phải đang làm dở / đã hoàn thành. */
export function isOutOfAttempts(fields: AttemptFields): boolean {
  const counts = readAttemptCounts(fields);
  if (!counts) return false;
  if (fields.interviewStatus === 'InProgress' || fields.interviewStatus === 'Completed') return false;
  return counts.used >= counts.max;
}

export type CandidateAttemptView =
  | { kind: 'completed' }
  /** ② Đang làm dở → "Tiếp tục" (gọi lại start, không qua hộp thoại). */
  | { kind: 'continue'; tracked: boolean }
  /** ① Chưa làm (hoặc Backend cũ) → "Bắt đầu" qua hộp thoại. */
  | { kind: 'start' }
  /** ③ Lượt trước bỏ ngang, còn lượt → "Làm lại lượt n" qua hộp thoại. */
  | { kind: 'retry'; lastAttemptNo: number; attemptNo: number; remaining: number; max: number }
  /** ④ Hết lượt → không có nút. */
  | { kind: 'exhausted'; used: number; max: number };

export function resolveCandidateAttemptView(detail: CandidateCampaignDetailResponse): CandidateAttemptView {
  if (detail.interviewStatus === 'Completed') return { kind: 'completed' };

  const counts = readAttemptCounts(detail);
  if (!counts) {
    // Backend cũ: đúng logic trước ATT1.
    const canContinue = detail.started && Boolean(detail.sessionId);
    return canContinue ? { kind: 'continue', tracked: false } : { kind: 'start' };
  }

  if (detail.interviewStatus === 'InProgress') return { kind: 'continue', tracked: true };
  if (isOutOfAttempts(detail)) return { kind: 'exhausted', used: counts.used, max: counts.max };
  if (detail.lastAttemptAbandoned === true && counts.used > 0) {
    return {
      kind: 'retry',
      lastAttemptNo: counts.used,
      attemptNo: counts.used + 1,
      remaining: counts.remaining,
      max: counts.max,
    };
  }
  return { kind: 'start' };
}

/** Thay `{key}` trong chuỗi i18n (cùng kiểu `{date}` / `{count}` đang dùng trong feature này). */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.split(`{${key}}`).join(String(value)),
    template,
  );
}
