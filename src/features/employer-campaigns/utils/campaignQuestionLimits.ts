/** Shared helpers for campaign question count + server ID preservation. */

export const CAMPAIGN_QUESTION_HARD_MAX = 20;

export function effectiveMaxQuestions(maxQuestions: number | null | undefined): number {
  if (maxQuestions == null || maxQuestions <= 0) return CAMPAIGN_QUESTION_HARD_MAX;
  return Math.min(maxQuestions, CAMPAIGN_QUESTION_HARD_MAX);
}

export function defaultGenerateCount(maxQuestions: number | null | undefined): number {
  return Math.min(effectiveMaxQuestions(maxQuestions), 10);
}

export type QuestionCountValidationCode =
  | 'countRequired'
  | 'countPositive'
  | 'countInteger'
  | 'countMaximum'
  | 'countCampaignMax';

export function validateGenerateCount(
  raw: unknown,
  maxQuestions: number | null | undefined,
): { ok: true; count: number } | { ok: false; code: QuestionCountValidationCode; max?: number } {
  if (raw === '' || raw == null) {
    return { ok: false, code: 'countRequired' };
  }
  const num = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(num)) {
    return { ok: false, code: 'countInteger' };
  }
  if (!Number.isInteger(num)) {
    return { ok: false, code: 'countInteger' };
  }
  if (num <= 0) {
    return { ok: false, code: 'countPositive' };
  }
  const hardMax = CAMPAIGN_QUESTION_HARD_MAX;
  if (num > hardMax) {
    return { ok: false, code: 'countMaximum', max: hardMax };
  }
  const campaignMax = effectiveMaxQuestions(maxQuestions);
  if (num > campaignMax) {
    return { ok: false, code: 'countCampaignMax', max: campaignMax };
  }
  return { ok: true, count: num };
}

/**
 * True when the id looks like a server-issued GUID (an toàn để echo lên PUT).
 *
 * Dùng cho CẢ câu hỏi LẪN tiêu chí. Client tự đúc id theo nhiều kiểu
 * (`criterion-N`, `system-N`, `new-xxxxxxxx`, `technical-depth`…) và gửi kiểu nào
 * lên cũng làm server ném lỗi parse Guid ⇒ hỏng CẢ lượt tạo chiến dịch.
 * Nhận diện bằng HÌNH DẠNG GUID, KHÔNG bằng danh sách tiền tố cấm — danh sách
 * cấm luôn thiếu kiểu mới (đã hỏng đúng vì thế).
 */
export function isServerEntityId(id: string | undefined | null): boolean {
  if (!id?.trim()) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id.trim(),
  );
}

export function hasWizardJd(jd: {
  inputMethod: 'file' | 'text';
  jdText: string;
  serverUploaded: boolean;
  fileStatus: string;
}): boolean {
  if (jd.inputMethod === 'text') {
    return jd.jdText.trim().length > 0;
  }
  return jd.serverUploaded || jd.fileStatus === 'uploaded';
}

