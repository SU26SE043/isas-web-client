/**
 * ATT1 — "Luật làm bài" của chiến dịch: thời lượng cả buổi (server áp) + số lần làm tối đa.
 * Biên khớp hợp đồng ATT1 [C1]/[C4]: `timeLimitMinutes` ngoài [5,180] ⇒ 400; `maxAttempts` ngoài [1,3] ⇒ 400.
 */
export const CAMPAIGN_TIME_LIMIT_MIN_MINUTES = 5;
export const CAMPAIGN_TIME_LIMIT_MAX_MINUTES = 180;

export const CAMPAIGN_MAX_ATTEMPT_OPTIONS = [1, 2, 3] as const;
/** [C1] vắng `maxAttempts` = 1 — FE cũng mặc định 1 khi response cũ chưa mang field. */
export const CAMPAIGN_DEFAULT_MAX_ATTEMPTS = 1;

/** Thời gian trả lời mặc định mỗi câu = 120 giây ⇒ 2 phút cho ƯỚC TÍNH (không phải luật). */
export const CAMPAIGN_ESTIMATE_MINUTES_PER_QUESTION = 2;

export function isValidCampaignTimeLimit(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= CAMPAIGN_TIME_LIMIT_MIN_MINUTES &&
    value <= CAMPAIGN_TIME_LIMIT_MAX_MINUTES
  );
}

export interface CampaignSittingEstimate {
  /** ceil(K × (1 + d) × 2). */
  minutes: number;
  /** K — số câu gốc mỗi buổi (`questionsPerSession ?? số câu đã soạn`). */
  baseQuestionCount: number;
  /** d — số câu đào sâu tối đa mỗi câu gốc; 0 khi tắt phỏng vấn thích ứng. */
  depth: number;
}

/**
 * Ước tính thô thời lượng cần cho một buổi: K câu gốc, mỗi câu kéo theo tối đa d câu đào sâu (chỉ khi
 * bật adaptive), mỗi câu 2 phút. Chỉ để CẢNH BÁO — thời lượng thấp hơn ước tính KHÔNG bị chặn.
 */
export function estimateCampaignSitting(
  baseQuestionCount: number,
  adaptiveEnabled: boolean,
  maxDeepPerQuestion: number | null | undefined,
): CampaignSittingEstimate {
  const k = Number.isFinite(baseQuestionCount) ? Math.max(0, Math.floor(baseQuestionCount)) : 0;
  const d = adaptiveEnabled && Number.isFinite(maxDeepPerQuestion)
    ? Math.max(0, Math.floor(maxDeepPerQuestion ?? 0))
    : 0;
  return {
    minutes: Math.ceil(k * (1 + d) * CAMPAIGN_ESTIMATE_MINUTES_PER_QUESTION),
    baseQuestionCount: k,
    depth: d,
  };
}
