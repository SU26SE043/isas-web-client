import type { CampaignQuestion, EmployerCampaignStatus, RubricCriterion } from '../types/campaignManagement.types';
import type {
  RubricPreviewBlocker,
  RubricPreviewComparability,
  RubricPreviewRun,
  RubricPreviewSample,
} from '../types/rubricPreview.types';

/**
 * 2026-10-03 — chấm thử CHỈ chấm câu trả lời người dùng tự nhập (band `Custom`); không còn 3 bài AI
 * Yếu/Khá/Xuất sắc. Lượt CŨ (trước mốc này) có thể chỉ có 3 bài AI ⇒ trả `null`, UI nói rõ là lượt cũ.
 */
export function customSampleOf(run: RubricPreviewRun): RubricPreviewSample | null {
  return run.samples.find((sample) => sample.band === 'Custom') ?? null;
}

/** Đạt khi điểm ≥ ngưỡng (cùng quy ước bảng xếp hạng); không có ngưỡng ⇒ `null` (không kết luận). */
export function passesThreshold(pct: number, passScorePct: number | null): boolean | null {
  if (passScorePct == null || !Number.isFinite(passScorePct)) return null;
  return pct >= passScorePct;
}

/**
 * "Cùng thước đo" chỉ khi CẢ fingerprint LẪN promptVersion trùng. `promptVersion` null so với số ⇒ không thể
 * khẳng định "cùng" (null = không biết — BK23), nên rơi về nhánh "đã đổi": thà báo đổi oan còn hơn báo cùng sai.
 */
export function compareRuns(a: RubricPreviewRun, b: RubricPreviewRun): RubricPreviewComparability {
  const rubricSame = a.rubricFingerprint === b.rubricFingerprint;
  const promptSame = a.promptVersion === b.promptVersion;
  if (rubricSame && promptSame) return 'same';
  if (!rubricSame && promptSame) return 'rubricChanged';
  if (rubricSame && !promptSame) return 'promptChanged';
  return 'bothChanged';
}

export interface ComputeBlockerInput {
  campaignId: string | null | undefined;
  /**
   * Wizard chế độ TẠO: draft chỉ được tạo lazily, nên `campaignId` null KHÔNG có nghĩa là không chạy được — chính
   * "Lưu & chấm thử" (`onBeforeRun`) sẽ tạo draft. Có đường lưu ⇒ vế `noCampaign` không áp; các vế sau vẫn áp.
   */
  canPersist?: boolean;
  campaignStatus: EmployerCampaignStatus | null | undefined;
  rubric: RubricCriterion[];
  /**
   * SC2 — tiêu chí THỰC SỰ sẽ được chấm cho câu đang test (Always ∪ targets của câu; câu không
   * nhãn/không truyền câu cụ thể ⇒ toàn bộ rubric). Tính bằng `scopedCriteriaForQuestion(rubric, question)`.
   * VẮNG ⇒ dùng nguyên `rubric` — hành vi TRƯỚC SC2, giữ tương thích ngược cho call site chưa truyền
   * câu hỏi cụ thể (chấm thử campaign-level, không phải per-question).
   */
  scopedCriteria?: RubricCriterion[];
  questions: CampaignQuestion[];
  isRunning: boolean;
}

/** Tiêu chí "có mốc" = ≥ 2 mốc (CAMP-17 đòi tối thiểu mốc 0 và mốc maxScore). */
export function criteriaMissingLevels(rubric: RubricCriterion[]): string[] {
  return rubric.filter((item) => (item.levels?.length ?? 0) < 2).map((item) => item.name);
}

/**
 * SC2 — tiêu chí thực sự chấm cho MỘT câu cụ thể: mọi tiêu chí `Always` (chấm mọi câu) cộng tiêu chí
 * `WhenTargeted` mà câu đó có nhãn. `question` null/`targetCriterionIds` null (chưa gắn nhãn) ⇒ KHÔNG
 * thu hẹp gì — trả nguyên `rubric` (khớp INT-18/Interview: `null` = chấm ĐỦ). `[]` (đã gắn nhãn rỗng)
 * ⇒ chỉ còn tiêu chí `Always`. Tiêu chí thiếu `scoringScope` (chưa từng đọc qua mapper) coi như `Always`.
 */
export function scopedCriteriaForQuestion(
  rubric: RubricCriterion[],
  question: CampaignQuestion | null | undefined,
): RubricCriterion[] {
  const targets = question?.targetCriterionIds;
  if (targets == null) return rubric;
  const targetSet = new Set(targets);
  return rubric.filter(
    (criterion) => (criterion.scoringScope ?? 'Always') === 'Always' || targetSet.has(criterion.id),
  );
}

/**
 * Lý do chưa chạy được, tính ở FE để không đốt lượt nhận 400. Thứ tự ưu tiên cố định:
 * noCampaign → closed → running → missingLevels → noQuestions — cái đứng trước là điều kiện tiên quyết của cái sau.
 */
export function computeBlocker({ campaignId, canPersist = false, campaignStatus, rubric, scopedCriteria, questions, isRunning }: ComputeBlockerInput): RubricPreviewBlocker | null {
  if (!campaignId && !canPersist) return { kind: 'noCampaign' };
  if (campaignStatus === 'closed' || campaignStatus === 'archived') return { kind: 'closed' };
  if (isRunning) return { kind: 'running' };
  // SC2 — chỉ đòi mốc cho tiêu chí TRONG PHẠM VI câu sắp test; tiêu chí WhenTargeted không câu nào
  // nhắm tới thì thiếu mốc cũng KHÔNG chặn (nó không bao giờ được chấm cho câu này).
  const missing = criteriaMissingLevels(scopedCriteria ?? rubric);
  if (missing.length > 0) return { kind: 'missingLevels', criteria: missing };
  if (questions.length === 0) return { kind: 'noQuestions' };
  return null;
}

/**
 * Có lượt `Succeeded` nào chấm trên bản thước đo hiện tại chưa. Không biết bản hiện tại (`null`) thì chỉ
 * hỏi "có lượt Succeeded nào không" — không suy "bản khác" từ "không biết".
 */
export function hasVerifiedRun(runs: RubricPreviewRun[], currentRubricVersion: number | null | undefined): boolean {
  return runs.some(
    (run) => run.status === 'Succeeded' && (currentRubricVersion == null || run.rubricVersion === currentRubricVersion),
  );
}

/** Câu hỏi mặc định để chấm thử: câu BẮT BUỘC đầu tiên, không có thì câu đầu tiên. */
export function defaultPreviewQuestion(questions: CampaignQuestion[]): CampaignQuestion | null {
  return questions.find((question) => question.isRequired) ?? questions[0] ?? null;
}

/** Số bản thước đo mới nhất mà các lượt đã thấy — thay cho bản hiện tại khi campaign không mang field đó. */
export function latestSeenRubricVersion(runs: RubricPreviewRun[]): number | null {
  return runs.length ? Math.max(...runs.map((run) => run.rubricVersion)) : null;
}

/** CAMP-19: 3 lượt `Succeeded` miễn phí cho MỖI (campaign, rubric_version). Chỉ dùng để hiện quota TRƯỚC lượt đầu. */
export const FREE_RUNS_PER_VERSION = 3;

/**
 * Số lượt miễn phí còn lại để hiện trên card. BE chỉ trả `freeRunsRemaining` KÈM một lượt, nên trước lượt đầu
 * (hoặc khi lượt mới nhất thuộc bản thước đo CŨ — quota đếm theo bản) card không có số nào để hiện; khi đó
 * quota của bản hiện tại chắc chắn còn nguyên. Không biết bản hiện tại (`null`) thì tin số của lượt mới nhất.
 */
export function freeRunsForVersion(
  reported: number | null,
  latest: RubricPreviewRun | null,
  currentRubricVersion: number | null,
): number | null {
  if (!latest) return reported ?? FREE_RUNS_PER_VERSION;
  if (currentRubricVersion != null && latest.rubricVersion !== currentRubricVersion) return FREE_RUNS_PER_VERSION;
  return reported;
}

/**
 * SC2 — quota nay tính THEO CÂU (campaign, rubricVersion, questionId), KHÔNG còn theo campaign
 * (`FREE_RUNS_PER_VERSION`/`freeRunsForVersion` ở trên là quota CŨ, giữ cho call site campaign-level
 * chưa chuyển sang chấm thử theo câu). 1 lượt `Succeeded` miễn phí cho MỖI (campaign, rubricVersion, câu).
 */
export const FREE_RUNS_PER_QUESTION = 1;

/** BE trả tối đa 20 lượt mới nhất — lượt của một câu có thể nằm NGOÀI cửa sổ này. */
export const RUBRIC_PREVIEW_HISTORY_WINDOW = 20;

export interface FreeRunsForQuestionOptions {
  freeRunsPerQuestion?: number;
  /** Lịch sử chưa về ⇒ không biết câu này đã dùng lượt chưa. */
  historyLoading?: boolean;
  /** Cửa sổ lịch sử (toàn campaign) đã đầy ⇒ lượt của câu này có thể bị đẩy ra ngoài. */
  historyWindowFull?: boolean;
}

/**
 * Số lượt miễn phí còn lại cho ĐÚNG câu hỏi này. `runs` là danh sách lượt (không cần lọc sẵn theo
 * câu — hàm tự tìm lượt MỚI NHẤT của đúng `questionId`, giả định `runs` đã sắp mới nhất trước, đúng
 * thứ tự `getRubricPreviewHistory` trả về). Không có `questionId` (chưa chọn câu cụ thể) ⇒ `null` —
 * quota là khái niệm PER-QUESTION, không có câu thì không có gì để đếm.
 *
 * R3(a) — KHÔNG THẤY lượt của câu này KHÔNG có nghĩa là "chưa dùng": lịch sử đang tải, hoặc cửa sổ 20 lượt đã đầy
 * toàn lượt câu khác (lượt của câu này rơi ra ngoài) ⇒ trả `null` = "không biết" ⇒ UI hỏi trước khi chạy, BE
 * mới là nơi đếm thật (409 nếu chưa xác nhận). Trước đây trả 1 ⇒ POST không confirm ⇒ trừ credit im lặng (I7).
 */
export function freeRunsForQuestion(
  runs: RubricPreviewRun[],
  rubricVersion: number | null,
  questionId: string | null,
  options: FreeRunsForQuestionOptions = {},
): number | null {
  const { freeRunsPerQuestion = FREE_RUNS_PER_QUESTION, historyLoading = false, historyWindowFull = false } = options;
  if (!questionId) return null;
  const latestForQuestion = runs.find((run) => run.questionId === questionId) ?? null;
  if (!latestForQuestion) {
    if (historyLoading || historyWindowFull) return null;
    return freeRunsPerQuestion;
  }
  if (rubricVersion != null && latestForQuestion.rubricVersion !== rubricVersion) return freeRunsPerQuestion;
  return latestForQuestion.freeRunsRemaining;
}
