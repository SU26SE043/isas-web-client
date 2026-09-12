import type { RubricLevel } from '@/features/rubrics/types/rubric.types';
import type { RubricCriterion } from '../types/campaignManagement.types';

/**
 * Luật MỐC ĐIỂM của một tiêu chí (CAMP-17) — bản FE của `Isas.Shared.Rubric.CriterionLevelRules`.
 *
 * Backend ép luật này khi PUT/publish và trả 400 nêu tiêu chí + mốc. FE chặn TRƯỚC để employer
 * thấy lỗi ngay dưới hàng sai, thay vì bấm Lưu cả wizard rồi nhận một câu 400. Con số phải
 * BẰNG backend — nghiêm hơn là chặn nhầm input hợp lệ mà backend không bao giờ thấy (đã xảy ra
 * với trần `criteriaText`), lỏng hơn là để lọt 400.
 *
 * Vì sao mốc 0 và mốc max bắt buộc: thiếu mốc 0 thì bài TRỐNG snap về mốc thấp nhất đang có,
 * tức người không nói gì vẫn có điểm — và không lỗi nào nổ. Thiếu mốc max thì không mức nào mô
 * tả bài đạt điểm cao nhất.
 */
export const LEVELS_MIN_COUNT = 2;
export const LEVELS_MAX_COUNT = 10;
export const LEVEL_DESCRIPTOR_MIN = 20;
export const LEVEL_DESCRIPTOR_MAX = 500;

export type CriterionLevelsErrorCode =
  | 'count'
  | 'integer'
  | 'duplicate'
  | 'range'
  | 'missingZero'
  | 'missingMax'
  | 'descriptor';

export type CriterionLevelsValidation =
  | { ok: true }
  | {
      ok: false;
      code: CriterionLevelsErrorCode;
      /** Mốc gây lỗi (nếu lỗi gắn với một mốc cụ thể). */
      score?: number;
      /** Vị trí hàng gây lỗi trong mảng đầu vào — để UI neo thông báo đúng hàng kể cả khi `score` là NaN. */
      index?: number;
    };

/**
 * Kiểm MỘT thang điểm. Trả vi phạm ĐẦU TIÊN theo đúng thứ tự backend kiểm (đếm → từng mốc →
 * hai mốc biên) để câu lỗi FE và câu 400 của backend chỉ vào cùng một chỗ.
 *
 * Không tự sắp/trim đầu vào — caller (editor) chuẩn hoá lúc lưu. Descriptor đo SAU trim,
 * đồng nếp backend.
 */
export function validateCriterionLevels(
  levels: RubricLevel[],
  maxScore: number,
): CriterionLevelsValidation {
  if (levels.length < LEVELS_MIN_COUNT || levels.length > LEVELS_MAX_COUNT) {
    return { ok: false, code: 'count' };
  }

  const seen = new Set<number>();
  for (let index = 0; index < levels.length; index += 1) {
    const level = levels[index];
    const score = level.score;
    if (!Number.isInteger(score)) return { ok: false, code: 'integer', score, index };
    if (score < 0 || score > maxScore) return { ok: false, code: 'range', score, index };
    if (seen.has(score)) return { ok: false, code: 'duplicate', score, index };
    seen.add(score);

    const descriptor = (level.descriptor ?? '').trim();
    if (descriptor.length < LEVEL_DESCRIPTOR_MIN || descriptor.length > LEVEL_DESCRIPTOR_MAX) {
      return { ok: false, code: 'descriptor', score, index };
    }
  }

  if (!seen.has(0)) return { ok: false, code: 'missingZero' };
  if (!seen.has(maxScore)) return { ok: false, code: 'missingMax', score: maxScore };
  return { ok: true };
}

/** Chuẩn hoá lúc lưu: trim mô tả + sắp theo điểm tăng dần (đường chấm giả định thứ tự này). */
export function normalizeCriterionLevels(levels: RubricLevel[]): RubricLevel[] {
  return levels
    .map((level) => ({ score: level.score, descriptor: (level.descriptor ?? '').trim() }))
    .sort((a, b) => a.score - b.score);
}

/**
 * Khoá ghép giữa đề xuất của server và rubric local: TÊN tiêu chí, trim + không phân biệt
 * hoa/thường (cùng phép chuẩn hoá với kiểm trùng tên ở `validateCampaignWizard`).
 *
 * KHÔNG ghép theo id: wizard chỉ lưu tiêu chí khi phát hành/persist, và PUT mint id MỚI cho
 * tiêu chí ⇒ id server trả về không trỏ được vào rubric đang mở trên màn hình.
 */
export function normalizeCriterionName(name: string): string {
  return name.trim().toLocaleLowerCase();
}

export type SuggestedCriterionLevels = {
  name: string;
  levels: RubricLevel[];
  /** Thang điểm server đọc lúc soạn — echo để UI phát hiện lệch với thang local. */
  maxScore?: number;
};

export type SuggestedLevelsMergeMode = 'fillEmpty' | 'replaceAll';

function hasLevels(criterion: RubricCriterion): boolean {
  return (criterion.levels?.length ?? 0) > 0;
}

/**
 * Ghép mốc AI đề xuất vào rubric local theo tên. Trả rubric MỚI; tiêu chí không có trong đề
 * xuất (hoặc đề xuất rỗng mốc) giữ nguyên tham chiếu.
 * - `fillEmpty`: chỉ điền tiêu chí CHƯA có mốc — mốc HR đã soạn tay không bị đè.
 * - `replaceAll`: ghi đè mọi tiêu chí khớp tên.
 */
export function mergeSuggestedLevels(
  rubric: RubricCriterion[],
  suggested: SuggestedCriterionLevels[],
  mode: SuggestedLevelsMergeMode,
): RubricCriterion[] {
  const byName = new Map<string, SuggestedCriterionLevels>();
  for (const item of suggested) {
    const key = normalizeCriterionName(item.name);
    if (key && item.levels.length > 0 && !byName.has(key)) byName.set(key, item);
  }

  return rubric.map((criterion) => {
    const match = byName.get(normalizeCriterionName(criterion.name));
    if (!match) return criterion;
    if (mode === 'fillEmpty' && hasLevels(criterion)) return criterion;
    return { ...criterion, levels: normalizeCriterionLevels(match.levels) };
  });
}

export type SuggestedLevelsMatchSummary = {
  /** Số tiêu chí local có đề xuất khớp tên (và đề xuất có mốc). */
  matched: number;
  /** Trong số khớp, bao nhiêu tiêu chí ĐÃ có mốc — là lý do phải hỏi "điền chỗ trống / thay hết". */
  matchedWithLevels: number;
  /** Tên đề xuất không khớp tiêu chí local nào (đổi tên sau khi lưu, hoặc server còn tiêu chí cũ). */
  unmatched: string[];
};

export function summarizeSuggestedLevels(
  rubric: RubricCriterion[],
  suggested: SuggestedCriterionLevels[],
): SuggestedLevelsMatchSummary {
  const localNames = new Map(rubric.map((item) => [normalizeCriterionName(item.name), item]));
  let matched = 0;
  let matchedWithLevels = 0;
  const unmatched: string[] = [];
  for (const item of suggested) {
    if (item.levels.length === 0) continue;
    const local = localNames.get(normalizeCriterionName(item.name));
    if (!local) {
      unmatched.push(item.name);
      continue;
    }
    matched += 1;
    if (hasLevels(local)) matchedWithLevels += 1;
  }
  return { matched, matchedWithLevels, unmatched };
}
