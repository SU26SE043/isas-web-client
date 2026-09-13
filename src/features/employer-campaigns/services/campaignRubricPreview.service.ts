import axios from 'axios';
import { apiClient } from '@/shared/api/apiClient';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import type { RubricLevel } from '@/features/rubrics/types/rubric.types';
import {
  PREVIEW_BILLING_CONFIRM_REQUIRED,
  type RubricPreviewBand,
  type RubricPreviewCriterion,
  type RubricPreviewError,
  type RubricPreviewRequest,
  type RubricPreviewRun,
  type RubricPreviewSample,
  type RubricPreviewSampleScore,
  type RubricPreviewStatus,
} from '../types/rubricPreview.types';

/**
 * CAMP-19 — chấm thử thước đo. Hợp đồng kiểu ở `types/rubricPreview.types.ts` (khớp
 * `RubricPreviewDtos.cs`). BE serialize camelCase; parser nhận cả PascalCase để không rụng
 * im lặng nếu ai đó đổi naming policy (bẫy `focusCriteria`/`metricsVersion` đã cắn repo 3 lần).
 */
const CAMPAIGN_API_PREFIX = '/api/v1/campaign';

export const campaignRubricPreviewEndpoints = {
  run: (campaignId: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(campaignId)}/rubric-preview`,
  history: (campaignId: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(campaignId)}/rubric-preview`,
} as const;

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function nullableText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function number(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function list(camel: unknown, pascal: unknown): unknown[] {
  if (Array.isArray(camel)) return camel;
  if (Array.isArray(pascal)) return pascal;
  return [];
}

/** Mảng chuỗi (id tiêu chí); phần tử không phải chuỗi/rỗng bị bỏ. Vắng ⇒ `[]` (khớp docstring `scopedCriterionIds`). */
function stringList(camel: unknown, pascal: unknown): string[] {
  return list(camel, pascal).flatMap((item) => (typeof item === 'string' && item.trim() ? [item.trim()] : []));
}

/**
 * Trạng thái lạ → `Failed` (terminal), KHÔNG phải `Running`: `Running` làm hook poll GET mỗi 5s
 * vô hạn cho một lượt không bao giờ kết thúc.
 */
function status(value: unknown): RubricPreviewStatus {
  const raw = text(value).toLowerCase();
  if (raw === 'running') return 'Running';
  if (raw === 'succeeded') return 'Succeeded';
  return 'Failed';
}

function band(value: unknown): RubricPreviewBand {
  const raw = text(value).toLowerCase();
  if (raw === 'weak') return 'Weak';
  if (raw === 'good') return 'Good';
  if (raw === 'excellent') return 'Excellent';
  return 'Custom';
}

function parseLevels(value: unknown[]): RubricLevel[] {
  return value.flatMap((item) => {
    const row = record(item);
    const descriptor = text(row?.descriptor ?? row?.Descriptor);
    return descriptor ? [{ score: number(row?.score ?? row?.Score), descriptor }] : [];
  });
}

function parseCriterion(item: unknown): RubricPreviewCriterion[] {
  const row = record(item);
  if (!row) return [];
  return [{
    criterionId: text(row.criterionId ?? row.CriterionId),
    name: text(row.name ?? row.Name),
    weight: number(row.weight ?? row.Weight),
    maxScore: number(row.maxScore ?? row.MaxScore),
    levels: parseLevels(list(row.levels, row.Levels)),
  }];
}

function parseSampleScore(item: unknown): RubricPreviewSampleScore[] {
  const row = record(item);
  if (!row) return [];
  return [{
    criterionId: text(row.criterionId ?? row.CriterionId),
    criterionName: text(row.criterionName ?? row.CriterionName),
    maxScore: number(row.maxScore ?? row.MaxScore),
    expectedLevel: number(row.expectedLevel ?? row.ExpectedLevel),
    actualScore: number(row.actualScore ?? row.ActualScore),
    levelMatched: nullableNumber(row.levelMatched ?? row.LevelMatched),
    reasoning: nullableText(row.reasoning ?? row.Reasoning),
  }];
}

function parseSample(item: unknown): RubricPreviewSample[] {
  const row = record(item);
  if (!row) return [];
  return [{
    band: band(row.band ?? row.Band),
    answerText: typeof row.answerText === 'string'
      ? row.answerText
      : typeof row.AnswerText === 'string' ? row.AnswerText : '',
    wordCount: number(row.wordCount ?? row.WordCount),
    expectedWeightedPct: number(row.expectedWeightedPct ?? row.ExpectedWeightedPct),
    actualWeightedPct: number(row.actualWeightedPct ?? row.ActualWeightedPct),
    scores: list(row.scores, row.Scores).flatMap(parseSampleScore),
  }];
}

export function parseRubricPreviewRun(data: unknown): RubricPreviewRun {
  const root = record(data);
  const row = record(root?.data) ?? root ?? {};
  return {
    id: text(row.id ?? row.Id),
    status: status(row.status ?? row.Status),
    questionId: nullableText(row.questionId ?? row.QuestionId),
    questionText: text(row.questionText ?? row.QuestionText),
    rubricFingerprint: text(row.rubricFingerprint ?? row.RubricFingerprint),
    rubricVersion: number(row.rubricVersion ?? row.RubricVersion),
    promptVersion: nullableNumber(row.promptVersion ?? row.PromptVersion),
    deliveryMetricsAvailable: bool(row.deliveryMetricsAvailable ?? row.DeliveryMetricsAvailable),
    lengthParityWarning: bool(row.lengthParityWarning ?? row.LengthParityWarning),
    billed: bool(row.billed ?? row.Billed),
    freeRunsRemaining: number(row.freeRunsRemaining ?? row.FreeRunsRemaining),
    rubric: list(row.rubric, row.Rubric).flatMap(parseCriterion),
    samples: list(row.samples, row.Samples).flatMap(parseSample),
    errorReason: nullableText(row.errorReason ?? row.ErrorReason),
    createdAt: text(row.createdAt ?? row.CreatedAt),
    completedAt: nullableText(row.completedAt ?? row.CompletedAt),
    // SC2 · correction T9-R3 (F1): BE T6 trả tập tiêu chí ĐÃ chấm; parser bỏ sót ⇒ `scopedCriterionIdsForRun`
    // không bao giờ tới nhánh "sự thật BE" và bảng luôn lọc theo nhãn HIỆN TẠI (HR đổi nhãn sau lượt chấm ⇒ lượt cũ
    // hiện sai tập tiêu chí). Lượt cũ / BE chưa deploy ⇒ `[]` ⇒ suy cục bộ như trước.
    scopedCriterionIds: stringList(row.scopedCriterionIds, row.ScopedCriterionIds),
  };
}

/** BE trả 20 lượt mới nhất trước; sắp lại theo `createdAt` giảm dần để `runs[0]` luôn là lượt mới nhất. */
export function parseRubricPreviewHistory(data: unknown): RubricPreviewRun[] {
  const root = record(data);
  const items = Array.isArray(data)
    ? data
    : list(root?.data, root?.Data).length
      ? list(root?.data, root?.Data)
      : list(root?.items, root?.Items);
  return items
    .flatMap((item) => (record(item) ? [parseRubricPreviewRun(item)] : []))
    .sort((a, b) => {
      const left = Date.parse(b.createdAt);
      const right = Date.parse(a.createdAt);
      if (Number.isNaN(left) || Number.isNaN(right)) return 0;
      return left - right;
    });
}

/**
 * Thân 400 "thiếu mốc" của BE: `Chưa khai mốc điểm cho tiêu chí: A, B. Chấm thử cần mốc …`.
 * Lấy phần sau `tiêu chí:` tới dấu `.` đầu tiên mà ĐI KÈM khoảng trắng/hết chuỗi — không cắt
 * ở dấu chấm nằm trong tên tiêu chí kiểu `Node.js`.
 */
export function extractMissingLevelCriteria(message: string): string[] {
  const marker = /tiêu chí\s*:/iu;
  const match = marker.exec(message);
  if (!match) return [];
  const rest = message.slice(match.index + match[0].length);
  const end = /\.(?=\s|$)/u.exec(rest);
  const segment = end ? rest.slice(0, end.index) : rest;
  return segment
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) return getApiErrorMessage(error, '').trim();
  if (error instanceof Error) return error.message.trim();
  return typeof error === 'string' ? error.trim() : '';
}

/** Thân JSON của lỗi HTTP (đọc cả `{ data: {...} }` bọc ngoài — mẫu `getDeployErrorData`). */
function errorBody(error: unknown): Record<string, unknown> | null {
  if (!axios.isAxiosError(error)) return null;
  const raw = record(error.response?.data);
  if (!raw) return null;
  return record(raw.data) ?? raw;
}

/** Phân loại lỗi để UI hiện LÝ DO thay vì toast chung. `message` luôn là nguyên văn BE. */
export function mapRubricPreviewError(error: unknown): RubricPreviewError {
  const status = getApiStatusCode(error);
  const message = errorMessage(error);
  const lower = message.toLowerCase();

  if (status === 400) {
    if (lower.includes('mốc')) {
      return { code: 'missingLevels', criteria: extractMissingLevelCriteria(message), message };
    }
    if (lower.includes('câu hỏi')) return { code: 'noQuestions', message };
    if (lower.includes('tiêu chí chấm')) return { code: 'noCriteria', message };
    return { code: 'unknown', message };
  }
  if (status === 402) return { code: 'noCredit', message };
  if (status === 409) {
    // R3/I7 — BE đòi xác nhận trả phí: đọc theo `code` (không theo câu chữ), kèm `freeRunsRemaining`/`questionId`.
    const body = errorBody(error);
    if (text(body?.code ?? body?.Code) === PREVIEW_BILLING_CONFIRM_REQUIRED) {
      return {
        code: 'billingConfirmRequired',
        freeRunsRemaining: number(body?.freeRunsRemaining ?? body?.FreeRunsRemaining, 0),
        questionId: nullableText(body?.questionId ?? body?.QuestionId),
        message,
      };
    }
    return { code: lower.includes('đang có') ? 'running' : 'closed', message };
  }
  if (status === 502) return { code: 'aiFailed', message };
  if (status === 404) return { code: 'notFound', message };
  return { code: 'unknown', message };
}

export async function runRubricPreview(
  campaignId: string,
  req: RubricPreviewRequest,
): Promise<RubricPreviewRun> {
  const response = await apiClient.post<unknown>(
    campaignRubricPreviewEndpoints.run(campaignId),
    {
      questionId: req.questionId ?? null,
      customAnswer: req.customAnswer?.trim() ? req.customAnswer.trim() : null,
      // Chỉ gửi khi HR đã đồng ý — vắng khoá = false (mặc định BE). Không gửi `false` tường minh để body lượt
      // miễn phí giữ nguyên hình dạng cũ.
      ...(req.confirmBilled === true ? { confirmBilled: true } : {}),
    },
    // POST ĐỒNG BỘ 20–60s (timeout BE 180s) — trần client mặc định ngắn hơn sẽ huỷ đúng lúc AI sắp xong.
    { timeout: 180_000 },
  );
  return parseRubricPreviewRun(response.data);
}

export async function getRubricPreviewHistory(campaignId: string): Promise<RubricPreviewRun[]> {
  const response = await apiClient.get<unknown>(campaignRubricPreviewEndpoints.history(campaignId));
  return parseRubricPreviewHistory(response.data);
}

export const campaignRubricPreviewService = {
  run: runRubricPreview,
  history: getRubricPreviewHistory,
  mapError: mapRubricPreviewError,
};
