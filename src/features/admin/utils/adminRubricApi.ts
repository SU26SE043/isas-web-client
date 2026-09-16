import type { RubricPreviewRun } from '@/features/employer-campaigns/types/rubricPreview.types';
import { normalizeCriterionLevels } from '@/features/employer-campaigns/utils/criterionLevelRules';
import type {
  AdminDeliveryMetrics,
  AdminPreviewTranscribeResult,
  AdminRubricCriterion,
  AdminRubricJobCategory,
  AdminRubricLanguage,
  AdminRubricLevel,
  AdminRubricMatrixRow,
  AdminRubricPreviewRun,
  AdminRubricSet,
  AdminRubricUpsertInput,
  AdminRubricVersionItem,
  AdminSuggestedCriterionLevels,
  AdminSuggestLevelsResponse,
} from '../types/adminApi.types';

/**
 * Parse-first cho bộ chuẩn admin. Thiếu trường BẮT BUỘC ⇒ NÉM, không điền rỗng: bản trước đọc
 * `level.description` (BE trả `descriptor`) rồi rơi về `''` nên mọi ô trống mà không lỗi nào
 * nổ suốt gần một tháng. Hợp đồng lệch phải ĐỔ ở màn hình, không phải im.
 */
export class AdminRubricContractError extends Error {
  constructor(field: string) {
    super(`Phản hồi bộ chuẩn thiếu trường "${field}" — hợp đồng FE/BE lệch.`);
    this.name = 'AdminRubricContractError';
  }
}

const JOB_CATEGORIES: readonly AdminRubricJobCategory[] = ['FE', 'BE', 'BA'];
const LANGUAGES: readonly AdminRubricLanguage[] = ['vi', 'en'];

function record(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new AdminRubricContractError(field);
  return value as Record<string, unknown>;
}
function str(r: Record<string, unknown>, key: string): string {
  const v = r[key];
  if (typeof v !== 'string') throw new AdminRubricContractError(key);
  return v;
}
function optStr(r: Record<string, unknown>, key: string): string | null {
  const v = r[key];
  return typeof v === 'string' ? v : null;
}
function num(r: Record<string, unknown>, key: string): number {
  const v = r[key];
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new AdminRubricContractError(key);
  return v;
}
function optNum(r: Record<string, unknown>, key: string): number | null {
  const v = r[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}
function bool(r: Record<string, unknown>, key: string): boolean {
  const v = r[key];
  if (typeof v !== 'boolean') throw new AdminRubricContractError(key);
  return v;
}
function arr(r: Record<string, unknown>, key: string): unknown[] {
  const v = r[key];
  if (!Array.isArray(v)) throw new AdminRubricContractError(key);
  return v;
}
function jobCategory(r: Record<string, unknown>, key = 'jobCategory'): AdminRubricJobCategory {
  const v = str(r, key);
  if (!JOB_CATEGORIES.includes(v as AdminRubricJobCategory)) throw new AdminRubricContractError(key);
  return v as AdminRubricJobCategory;
}
function language(r: Record<string, unknown>, key = 'language'): AdminRubricLanguage {
  const v = str(r, key);
  if (!LANGUAGES.includes(v as AdminRubricLanguage)) throw new AdminRubricContractError(key);
  return v as AdminRubricLanguage;
}

export function parseAdminRubricLevel(raw: unknown): AdminRubricLevel {
  const r = record(raw, 'levels[]');
  return { score: num(r, 'score'), descriptor: str(r, 'descriptor') };
}

export function parseAdminRubricCriterion(raw: unknown): AdminRubricCriterion {
  const r = record(raw, 'criteria[]');
  return {
    id: str(r, 'id'),
    name: str(r, 'name'),
    description: optStr(r, 'description'),
    weight: num(r, 'weight'),
    maxScore: num(r, 'maxScore'),
    scoringScope: str(r, 'scoringScope'),
    // Chỉ nhận đúng 2 giá trị BE khai; thiếu/lạ ⇒ `Ai` (đòi mốc thừa còn hơn bỏ sót — chiều an toàn).
    scoringMethod: r.scoringMethod === 'DeliveryMetrics' ? 'DeliveryMetrics' : 'Ai',
    // `null` từ BE = chưa khai mốc — chuẩn hoá về `[]` để UI chỉ có MỘT cách nói "chưa có mốc".
    levels: Array.isArray(r.levels) ? r.levels.map(parseAdminRubricLevel) : [],
  };
}

export function parseAdminRubricSet(raw: unknown): AdminRubricSet {
  const r = record(raw, 'rubric');
  return {
    jobCategory: jobCategory(r),
    language: language(r),
    version: num(r, 'version'),
    changed: typeof r.changed === 'boolean' ? r.changed : false,
    criteria: arr(r, 'criteria').map(parseAdminRubricCriterion),
    sampleQuestions: Array.isArray(r.sampleQuestions)
      ? r.sampleQuestions.map((item) => { const q = record(item, 'sampleQuestions[]'); return { id: str(q, 'id'), text: str(q, 'text') }; })
      : [],
  };
}

export function parseAdminRubricMatrix(raw: unknown): AdminRubricMatrixRow[] {
  if (!Array.isArray(raw)) throw new AdminRubricContractError('matrix');
  return raw.map((item) => {
    const r = record(item, 'matrix[]');
    return { jobCategory: jobCategory(r), language: language(r), version: num(r, 'version'), criteriaCount: num(r, 'criteriaCount'), withLevelsCount: num(r, 'withLevelsCount') };
  });
}

export function parseAdminRubricHistory(raw: unknown): AdminRubricVersionItem[] {
  if (!Array.isArray(raw)) throw new AdminRubricContractError('history');
  return raw.map((item) => {
    const r = record(item, 'history[]');
    return { version: num(r, 'version'), isActive: bool(r, 'isActive'), criteriaCount: num(r, 'criteriaCount'), withLevelsCount: num(r, 'withLevelsCount') };
  });
}

export function parseAdminSuggestLevels(raw: unknown): AdminSuggestLevelsResponse {
  const r = record(raw, 'suggest');
  return {
    jobCategory: jobCategory(r),
    language: language(r),
    rubricVersion: num(r, 'rubricVersion'),
    criteria: arr(r, 'criteria').map((item) => {
      const c = record(item, 'criteria[]');
      return { criterionId: str(c, 'criterionId'), name: str(c, 'name'), maxScore: num(c, 'maxScore'), levels: arr(c, 'levels').map(parseAdminRubricLevel) };
    }),
  };
}

/** Số đo cách nói: mọi trường số đều có thể thiếu/null (bản ghi cũ, đường degrade) — không ném, để `null`. */
export function parseAdminDeliveryMetrics(raw: unknown): AdminDeliveryMetrics | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const breakdown = r.fillerBreakdown && typeof r.fillerBreakdown === 'object' && !Array.isArray(r.fillerBreakdown)
    ? Object.fromEntries(Object.entries(r.fillerBreakdown as Record<string, unknown>).filter((entry): entry is [string, number] => typeof entry[1] === 'number'))
    : {};
  return {
    metricsVersion: optNum(r, 'metricsVersion'), audioSec: optNum(r, 'audioSec'), speechSec: optNum(r, 'speechSec'),
    wordCount: optNum(r, 'wordCount'), speechRateWpm: optNum(r, 'speechRateWpm'), longestPauseSec: optNum(r, 'longestPauseSec'),
    pauseCount: optNum(r, 'pauseCount'), silenceRatio: optNum(r, 'silenceRatio'), fillerCount: optNum(r, 'fillerCount'),
    fillerPer100Words: optNum(r, 'fillerPer100Words'), fillerBreakdown: breakdown,
  };
}

export function parseAdminPreviewTranscribe(raw: unknown): AdminPreviewTranscribeResult {
  const r = record(raw, 'transcribe');
  return { transcript: str(r, 'transcript'), deliveryMetrics: parseAdminDeliveryMetrics(r.deliveryMetrics), transcriptEngine: optStr(r, 'transcriptEngine'), noSpeech: bool(r, 'noSpeech') };
}

export function parseAdminRubricPreviewRun(raw: unknown): AdminRubricPreviewRun {
  const r = record(raw, 'preview');
  const status = str(r, 'status');
  if (status !== 'Running' && status !== 'Succeeded' && status !== 'Failed') throw new AdminRubricContractError('status');
  return {
    id: str(r, 'id'),
    status,
    jobCategory: jobCategory(r),
    language: language(r),
    rubricVersion: num(r, 'rubricVersion'),
    questionText: str(r, 'questionText'),
    rubricFingerprint: str(r, 'rubricFingerprint'),
    promptVersion: optNum(r, 'promptVersion'),
    deliveryMetricsAvailable: bool(r, 'deliveryMetricsAvailable'),
    lengthParityWarning: bool(r, 'lengthParityWarning'),
    freeRunsRemaining: num(r, 'freeRunsRemaining'),
    rubric: arr(r, 'rubric').map((item) => {
      const c = record(item, 'rubric[]');
      return { criterionId: str(c, 'criterionId'), name: str(c, 'name'), weight: num(c, 'weight'), maxScore: num(c, 'maxScore'), levels: Array.isArray(c.levels) ? c.levels.map(parseAdminRubricLevel) : [] };
    }),
    samples: arr(r, 'samples').map((item) => {
      const s = record(item, 'samples[]');
      const band = str(s, 'band');
      if (band !== 'Weak' && band !== 'Good' && band !== 'Excellent' && band !== 'Custom') throw new AdminRubricContractError('band');
      return {
        band,
        answerText: str(s, 'answerText'),
        wordCount: num(s, 'wordCount'),
        expectedPct: num(s, 'expectedPct'),
        actualPct: num(s, 'actualPct'),
        scores: arr(s, 'scores').map((score) => {
          const sc = record(score, 'scores[]');
          return { criterionId: str(sc, 'criterionId'), criterionName: str(sc, 'criterionName'), maxScore: num(sc, 'maxScore'), expectedLevel: num(sc, 'expectedLevel'), actualScore: num(sc, 'actualScore'), levelMatched: optNum(sc, 'levelMatched'), reasoning: optStr(sc, 'reasoning'), measured: sc.measured === true };
        }),
        deliveryMetrics: parseAdminDeliveryMetrics(s.deliveryMetrics),
      };
    }),
    errorReason: optStr(r, 'errorReason'),
    createdAt: str(r, 'createdAt'),
    completedAt: optStr(r, 'completedAt'),
  };
}

export function parseAdminRubricPreviewHistory(raw: unknown): AdminRubricPreviewRun[] {
  if (!Array.isArray(raw)) throw new AdminRubricContractError('previewHistory');
  return raw.map(parseAdminRubricPreviewRun);
}

/**
 * Body PUT chỉ mang ĐÚNG ba trường BE nhận. Không spread nguyên object đọc từ GET: bản trước làm
 * thế nên `descriptor` cũ đi lên nguyên xi ⇒ fingerprint bằng nhau ⇒ `changed:false`.
 */
export function toAdminRubricUpsertInput(criteria: AdminRubricCriterion[]): AdminRubricUpsertInput {
  return {
    criteria: criteria.map((c) => ({
      id: c.id,
      description: c.description?.trim() ? c.description.trim() : null,
      levels: c.levels.length ? normalizeCriterionLevels(c.levels) : null,
    })),
  };
}

export type AdminSuggestMergeMode = 'fillEmpty' | 'replaceAll';

/** Ghép mốc AI đề xuất theo `criterionId` (id ổn định trong một phiên bản) — không khớp theo tên. */
export function mergeAdminSuggestedLevels(
  criteria: AdminRubricCriterion[],
  suggested: AdminSuggestedCriterionLevels[],
  mode: AdminSuggestMergeMode,
): AdminRubricCriterion[] {
  const byId = new Map(suggested.filter((s) => s.levels.length > 0).map((s) => [s.criterionId, s]));
  return criteria.map((c) => {
    const match = byId.get(c.id);
    if (!match) return c;
    if (mode === 'fillEmpty' && c.levels.length > 0) return c;
    return { ...c, levels: normalizeCriterionLevels(match.levels) };
  });
}

/** Tên tiêu chí sẽ bị đề xuất chạm tới theo từng chế độ — để hộp thoại gọi tên, không nói "N tiêu chí". */
export function summarizeAdminSuggestion(criteria: AdminRubricCriterion[], suggested: AdminSuggestedCriterionLevels[]) {
  const byId = new Map(suggested.filter((s) => s.levels.length > 0).map((s) => [s.criterionId, s]));
  const matched = criteria.filter((c) => byId.has(c.id));
  return {
    matchedNames: matched.map((c) => c.name),
    matchedEmptyNames: matched.filter((c) => c.levels.length === 0).map((c) => c.name),
  };
}

/**
 * Adapter sang `RubricPreviewRun` của employer để tái dùng `RubricPreviewResult`/`RubricPreviewHistory`.
 * B2C không có trọng số khi cộng điểm (INT-10) nên `expectedWeightedPct := expectedPct`; không có
 * credit (`billed:false`) và không có câu hỏi định danh (`questionId:null`).
 */
export function toEmployerPreviewRun(run: AdminRubricPreviewRun): RubricPreviewRun {
  return {
    id: run.id,
    status: run.status,
    questionId: null,
    questionText: run.questionText,
    rubricFingerprint: run.rubricFingerprint,
    rubricVersion: run.rubricVersion,
    promptVersion: run.promptVersion,
    deliveryMetricsAvailable: run.deliveryMetricsAvailable,
    lengthParityWarning: run.lengthParityWarning,
    billed: false,
    freeRunsRemaining: run.freeRunsRemaining,
    rubric: run.rubric,
    samples: run.samples.map((s) => ({ band: s.band, answerText: s.answerText, wordCount: s.wordCount, expectedWeightedPct: s.expectedPct, actualWeightedPct: s.actualPct, scores: s.scores })),
    errorReason: run.errorReason,
    createdAt: run.createdAt,
    completedAt: run.completedAt,
    scopedCriterionIds: run.rubric.map((c) => c.criterionId),
  };
}
