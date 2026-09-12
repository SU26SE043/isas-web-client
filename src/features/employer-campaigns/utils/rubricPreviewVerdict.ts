import type { CampaignQuestion, EmployerCampaignStatus, RubricCriterion } from '../types/campaignManagement.types';
import type {
  RubricPreviewBand,
  RubricPreviewBlocker,
  RubricPreviewComparability,
  RubricPreviewRun,
  RubricPreviewSample,
  RubricPreviewVerdict,
} from '../types/rubricPreview.types';

/**
 * Biên độ (Excellent − Weak, điểm %) tối thiểu để nói "thước đo phân biệt được 3 mức".
 * 30 vì đó là khoảng cách để một ngưỡng Đạt đặt ở giữa (vd 50–70%) còn tách được Yếu khỏi Xuất sắc
 * sau khi cộng nhiễu chấm ±5 mỗi bên (đo RAG2: dao động 0,0–0,15 ở temp 0, tới 2,0 điểm/tiêu chí ở temp 0,6).
 * Dưới 30, ba bài rơi vào cùng một dải nhãn dù thứ tự có đúng.
 */
export const DISCRIMINATION_RANGE_PCT = 30;

/**
 * Δ = thật − kỳ vọng phải vượt ±3 điểm % ở CẢ BA bài AI viết mới gọi là thiên lệch một chiều.
 * 3 là mức nhiễu làm tròn trọng số (weight 4 chữ số thập phân × maxScore nguyên ⇒ ±1–2 điểm là sai số tính,
 * không phải model tự khen). Một bài lệch không đủ: chỉ khi cả ba cùng dấu mới là xu hướng, không phải nhiễu.
 */
export const BIAS_DELTA_PCT = 3;

const AI_BANDS: readonly RubricPreviewBand[] = ['Weak', 'Good', 'Excellent'];

function findBand(run: RubricPreviewRun, band: RubricPreviewBand): RubricPreviewSample | undefined {
  return run.samples.find((sample) => sample.band === band);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Kết luận tầng 1. KHÔNG dùng |Δ| làm thước chính (xem `RubricPreviewVerdict`): người viết và người chấm
 * là cùng một model, Δ nhỏ chỉ chứng minh nó đồng ý với chính nó. Thứ tự + biên độ mới là phép đo.
 */
export function computeVerdict(run: RubricPreviewRun, passScorePct: number | null): RubricPreviewVerdict {
  const weak = findBand(run, 'Weak');
  const good = findBand(run, 'Good');
  const excellent = findBand(run, 'Excellent');
  const aiSamples = [weak, good, excellent].filter((sample): sample is RubricPreviewSample => Boolean(sample));

  // Nghiêm ngặt: bằng nhau cũng là "không giữ" — hai bài khác hẳn nhau mà cùng điểm thì thước đo không tách được.
  const ordering: RubricPreviewVerdict['ordering'] =
    weak && good && excellent && weak.actualWeightedPct < good.actualWeightedPct && good.actualWeightedPct < excellent.actualWeightedPct
      ? 'ok'
      : 'broken';
  const range = weak && excellent ? round1(excellent.actualWeightedPct - weak.actualWeightedPct) : 0;

  const deltas = aiSamples.map((sample) => sample.actualWeightedPct - sample.expectedWeightedPct);
  const bias: RubricPreviewVerdict['bias'] =
    deltas.length === AI_BANDS.length && deltas.every((delta) => delta > BIAS_DELTA_PCT)
      ? 'positive'
      : deltas.length === AI_BANDS.length && deltas.every((delta) => delta < -BIAS_DELTA_PCT)
        ? 'negative'
        : 'none';
  const maxAbsDelta = deltas.length ? round1(Math.max(...deltas.map((delta) => Math.abs(delta)))) : 0;

  const verdict: RubricPreviewVerdict['verdict'] =
    ordering === 'broken' ? 'weak' : range >= DISCRIMINATION_RANGE_PCT ? 'discriminates' : 'inconclusive';

  const threshold =
    passScorePct != null && Number.isFinite(passScorePct)
      ? {
          pct: passScorePct,
          failing: run.samples.filter((sample) => sample.actualWeightedPct < passScorePct).map((sample) => sample.band),
        }
      : null;

  return { ordering, range, bias, maxAbsDelta, verdict, threshold, compression: computeCompression(weak, excellent) };
}

/** Mức bộ chấm CHỌN so với mức code kỳ vọng — so theo mốc (levelMatched) vì mốc không cách đều; không có mốc thì so điểm. */
function levelDelta(score: RubricPreviewSample['scores'][number]): number {
  return (score.levelMatched ?? score.actualScore) - score.expectedLevel;
}

/**
 * Đếm theo TIÊU CHÍ chứ không theo điểm gộp: bias gộp có thể bằng 0 (Yếu +24, Xuất sắc −30 triệt tiêu nhau)
 * trong khi đúng ca đó là thứ HR cần thấy — mốc đầu thang mở quá rộng, mốc cuối thang đóng quá chặt.
 */
export function computeCompression(
  weak: RubricPreviewSample | undefined,
  excellent: RubricPreviewSample | undefined,
): RubricPreviewVerdict['compression'] {
  if (!weak || !excellent || weak.scores.length === 0 || excellent.scores.length === 0) return null;
  const total = Math.min(weak.scores.length, excellent.scores.length);
  const weakOver = weak.scores.filter((score) => levelDelta(score) > 0).length;
  const excellentUnder = excellent.scores.filter((score) => levelDelta(score) < 0).length;
  return weakOver * 2 >= total && excellentUnder * 2 >= total ? { weakOver, excellentUnder, total } : null;
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

/**
 * Số lượt miễn phí còn lại cho ĐÚNG câu hỏi này. `runs` là danh sách lượt (không cần lọc sẵn theo
 * câu — hàm tự tìm lượt MỚI NHẤT của đúng `questionId`, giả định `runs` đã sắp mới nhất trước, đúng
 * thứ tự `getRubricPreviewHistory` trả về). Không có `questionId` (chưa chọn câu cụ thể) ⇒ `null` —
 * quota là khái niệm PER-QUESTION, không có câu thì không có gì để đếm.
 */
export function freeRunsForQuestion(
  runs: RubricPreviewRun[],
  rubricVersion: number | null,
  questionId: string | null,
  freeRunsPerQuestion: number = FREE_RUNS_PER_QUESTION,
): number | null {
  if (!questionId) return null;
  const latestForQuestion = runs.find((run) => run.questionId === questionId) ?? null;
  if (!latestForQuestion) return freeRunsPerQuestion;
  if (rubricVersion != null && latestForQuestion.rubricVersion !== rubricVersion) return freeRunsPerQuestion;
  return latestForQuestion.freeRunsRemaining;
}
