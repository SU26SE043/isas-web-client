import { apiClient } from '@/shared/api/apiClient';
import type { RubricLevel } from '@/features/rubrics/types/rubric.types';

/**
 * CAMP-16 — `POST /api/v1/campaign/{id}/criteria/levels/suggest`: AI soạn MỐC ĐIỂM cho các tiêu
 * chí ĐÃ LƯU của chiến dịch. Endpoint CHỈ ĐỌC: kết quả trả về cho HR xem/sửa, lưu đi qua
 * `PUT /campaign/{id}` như mọi thay đổi khác của wizard.
 *
 * Mã lỗi (server): 400 chưa có tiêu chí · 404 ngoài org · 409 chiến dịch đã đóng · 502 AI lỗi.
 * KHÔNG có fallback dải mặc định khi AI hỏng — server cố ý fail-loud, FE cũng phải để lỗi nổi
 * lên thay vì tự bịa mốc "Mức 3/10".
 *
 * `criterionId` là id server của tiêu chí ĐÃ LƯU; wizard PUT mint id mới nên phía UI ghép về
 * rubric local theo `name` (xem `criterionLevelRules.mergeSuggestedLevels`), không theo id.
 */
export type SuggestedCriterionLevelsResponse = {
  criterionId: string;
  name: string;
  maxScore: number;
  levels: RubricLevel[];
};

export type SuggestCriterionLevelsResult = {
  criteria: SuggestedCriterionLevelsResponse[];
};

const CAMPAIGN_API_PREFIX = '/api/v1/campaign';

export function suggestCriterionLevelsEndpoint(campaignId: string): string {
  return `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(campaignId)}/criteria/levels/suggest`;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function number(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function list(value: unknown, alt: unknown): unknown[] {
  return Array.isArray(value) ? value : Array.isArray(alt) ? alt : [];
}

/** Parse phòng thủ: nhận camelCase lẫn PascalCase; mảng thiếu → `[]`; mốc thiếu mô tả bị bỏ. */
export function parseSuggestCriterionLevels(data: unknown): SuggestCriterionLevelsResult {
  const root = record(data);
  const payload = record(root?.data) ?? root ?? {};
  const rawCriteria = list(payload.criteria, payload.Criteria);
  return {
    criteria: rawCriteria.flatMap((item) => {
      const row = record(item);
      if (!row) return [];
      const levels = list(row.levels, row.Levels).flatMap((level) => {
        const parsed = record(level);
        const descriptor = text(parsed?.descriptor ?? parsed?.Descriptor);
        return descriptor ? [{ score: number(parsed?.score ?? parsed?.Score), descriptor }] : [];
      });
      return [
        {
          criterionId: text(row.criterionId ?? row.CriterionId),
          name: text(row.name ?? row.Name),
          maxScore: number(row.maxScore ?? row.MaxScore, 10),
          levels,
        },
      ];
    }),
  };
}

export async function suggestCriterionLevels(campaignId: string): Promise<SuggestCriterionLevelsResult> {
  // Không body — server đọc tiêu chí đã lưu của chính chiến dịch.
  const response = await apiClient.post<unknown>(suggestCriterionLevelsEndpoint(campaignId));
  return parseSuggestCriterionLevels(response.data);
}

export const campaignLevelsService = { suggestCriterionLevels };
