import type { RubricLevel } from '@/features/rubrics/types/rubric.types';

/**
 * CAMP-19 — chấm thử thước đo. Hợp đồng khớp `RubricPreviewDtos.cs` (Campaign) — camelCase từ System.Text.Json.
 * `POST /api/v1/campaign/{id}/rubric-preview` (ĐỒNG BỘ, 20–60s, timeout BE 180s) · `GET …/rubric-preview` = 20 lượt mới nhất trước.
 * Mã lỗi BE: 400 chưa có tiêu chí / thiếu mốc (thân là chuỗi "Chưa khai mốc điểm cho tiêu chí: A, B. …") / chưa có câu hỏi ·
 * 402 ví org hết credit · 409 campaign Closed/Archived HOẶC đang có lượt Running · 502 AI lỗi · 404 ngoài org.
 */
export type RubricPreviewStatus = 'Running' | 'Succeeded' | 'Failed';
export type RubricPreviewBand = 'Weak' | 'Good' | 'Excellent' | 'Custom';

export interface RubricPreviewRequest {
  /** null = BE lấy câu đầu tiên của chiến dịch. Phải là id câu hỏi ĐÃ LƯU server. */
  questionId?: string | null;
  /** Bài thứ 4 HR tự dán — bài duy nhất không do bộ chấm viết, là đối chứng cho self-scoring bias. */
  customAnswer?: string | null;
}

export interface RubricPreviewCriterion {
  criterionId: string;
  name: string;
  weight: number;
  maxScore: number;
  levels: RubricLevel[];
}

export interface RubricPreviewSampleScore {
  criterionId: string;
  criterionName: string;
  maxScore: number;
  /** Mức CODE chọn trước khi AI viết bài (Custom = 0, không có nghĩa). */
  expectedLevel: number;
  actualScore: number;
  levelMatched: number | null;
  reasoning: string | null;
}

export interface RubricPreviewSample {
  band: RubricPreviewBand;
  answerText: string;
  wordCount: number;
  expectedWeightedPct: number;
  actualWeightedPct: number;
  scores: RubricPreviewSampleScore[];
}

export interface RubricPreviewRun {
  id: string;
  status: RubricPreviewStatus;
  questionId: string | null;
  questionText: string;
  rubricFingerprint: string;
  rubricVersion: number;
  promptVersion: number | null;
  /** v1 LUÔN false — bài mẫu là văn bản nên tiêu chí về cách nói chấm khác bài thật. Hiện banner, không giấu. */
  deliveryMetricsAvailable: boolean;
  lengthParityWarning: boolean;
  billed: boolean;
  freeRunsRemaining: number;
  /** Bộ thước đo ĐÃ DÙNG (snapshot), không phải bộ hiện tại. */
  rubric: RubricPreviewCriterion[];
  samples: RubricPreviewSample[];
  errorReason: string | null;
  createdAt: string;
  completedAt: string | null;
}

/** Lỗi đã phân loại để UI hiện LÝ DO thay vì toast chung. */
export type RubricPreviewError =
  | { code: 'missingLevels'; criteria: string[]; message: string }
  | { code: 'noQuestions' | 'noCriteria' | 'closed' | 'running' | 'noCredit' | 'aiFailed' | 'notFound' | 'unknown'; message: string };

/** Vì sao chưa chạy được — tính ở FE TRƯỚC khi gọi API (không đốt lượt để nhận 400). */
export type RubricPreviewBlocker =
  | { kind: 'noCampaign' }
  | { kind: 'noQuestions' }
  | { kind: 'missingLevels'; criteria: string[] }
  | { kind: 'closed' }
  | { kind: 'running' };

/**
 * Kết luận tầng 1 — suy từ dữ liệu, KHÔNG dùng |Δ| làm thước chính: mức kỳ vọng do code chọn trước khi AI viết,
 * nên Δ nhỏ chỉ chứng minh người viết và người chấm (cùng một model) đồng ý với nhau.
 */
export interface RubricPreviewVerdict {
  /** Weak < Good < Excellent theo điểm THẬT có giữ không. */
  ordering: 'ok' | 'broken';
  /** Excellent − Weak (điểm thật, %). Dưới 30 = thước đo không phân biệt. */
  range: number;
  /** Δ = thật − kỳ vọng trên 3 bài AI viết: cùng dấu cả 3 ⇒ thiên lệch một chiều. */
  bias: 'none' | 'positive' | 'negative';
  maxAbsDelta: number;
  verdict: 'discriminates' | 'weak' | 'inconclusive';
  /** Chồng ngưỡng Đạt (passScorePct) lên từng bài — kiểm luôn ngưỡng HR đặt. */
  threshold: { pct: number; failing: RubricPreviewBand[] } | null;
  /**
   * "Nén về giữa": bài Yếu bị chấm CAO hơn mốc kỳ vọng ở ≥ nửa số tiêu chí VÀ bài Xuất sắc bị chấm THẤP hơn ở ≥ nửa
   * ⇒ mốc thấp quá dễ đạt, mốc cao quá khó — đây là chẩn đoán HR sửa được (viết lại mốc), khác `bias` (cả 3 cùng dấu).
   * `null` = không nén (hoặc không đủ dữ liệu tiêu chí để kết luận).
   */
  compression: { weakOver: number; excellentUnder: number; total: number } | null;
}

/** Badge so hai lượt: chỉ "cùng thước đo" khi CẢ fingerprint LẪN promptVersion trùng (admin đổi prompt chấm cũng đổi điểm). */
export type RubricPreviewComparability = 'same' | 'rubricChanged' | 'promptChanged' | 'bothChanged';

/** Bề mặt hook W1 cung cấp, W2 tiêu thụ — KHÔNG thêm/bớt field mà không sửa cả hai phía. */
export interface UseRubricPreviewApi {
  runs: RubricPreviewRun[];
  latest: RubricPreviewRun | null;
  isLoadingHistory: boolean;
  /** POST đang bay HOẶC lượt mới nhất còn `Running` (poll GET mỗi 5s). */
  isRunning: boolean;
  freeRunsRemaining: number | null;
  error: RubricPreviewError | null;
  /** Gọi `beforeRun` (lưu thước đo + câu hỏi) rồi POST. Trả null khi lỗi (error đã set). */
  run: (input: RubricPreviewRequest) => Promise<RubricPreviewRun | null>;
  clearError: () => void;
}
