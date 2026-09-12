import { describe, expect, it } from 'vitest';
import type { RubricCriterion } from '../types/campaignManagement.types';
import {
  LEVEL_DESCRIPTOR_MAX,
  LEVEL_DESCRIPTOR_MIN,
  LEVELS_MAX_COUNT,
  LEVELS_MIN_COUNT,
  mergeSuggestedLevels,
  normalizeCriterionLevels,
  summarizeSuggestedLevels,
  validateCriterionLevels,
} from './criterionLevelRules';

// Con số phải BẰNG `Isas.Shared.Rubric.CriterionLevelRules` bên backend (CAMP-17).
const BACKEND = { min: 2, max: 10, descMin: 20, descMax: 500 };

const d = (n = 30) => 'x'.repeat(n);
const ok = [
  { score: 0, descriptor: d() },
  { score: 5, descriptor: d() },
  { score: 10, descriptor: d() },
];

describe('validateCriterionLevels — hằng khớp backend', () => {
  it('bốn hằng đúng bằng backend, không nghiêm hơn cũng không lỏng hơn', () => {
    expect(LEVELS_MIN_COUNT).toBe(BACKEND.min);
    expect(LEVELS_MAX_COUNT).toBe(BACKEND.max);
    expect(LEVEL_DESCRIPTOR_MIN).toBe(BACKEND.descMin);
    expect(LEVEL_DESCRIPTOR_MAX).toBe(BACKEND.descMax);
  });
});

describe('validateCriterionLevels — từng luật', () => {
  it('bộ hợp lệ', () => {
    expect(validateCriterionLevels(ok, 10)).toEqual({ ok: true });
  });

  it('dưới 2 hoặc trên 10 mốc → count', () => {
    expect(validateCriterionLevels([ok[0]], 10)).toEqual({ ok: false, code: 'count' });
    const eleven = Array.from({ length: 11 }, (_, i) => ({ score: i, descriptor: d() }));
    expect(validateCriterionLevels(eleven, 10)).toEqual({ ok: false, code: 'count' });
  });

  it('điểm không nguyên → integer, kèm index để neo hàng (score có thể là NaN)', () => {
    const result = validateCriterionLevels(
      [ok[0], { score: Number.NaN, descriptor: d() }, ok[2]],
      10,
    );
    expect(result).toMatchObject({ ok: false, code: 'integer', index: 1 });
    expect(validateCriterionLevels([ok[0], { score: 2.5, descriptor: d() }, ok[2]], 10)).toMatchObject({
      code: 'integer',
      score: 2.5,
    });
  });

  it('ngoài [0, maxScore] → range', () => {
    expect(validateCriterionLevels([ok[0], { score: 11, descriptor: d() }, ok[2]], 10)).toMatchObject({
      code: 'range',
      score: 11,
    });
    expect(validateCriterionLevels([{ score: -1, descriptor: d() }, ok[2]], 10)).toMatchObject({
      code: 'range',
      score: -1,
    });
  });

  it('hai mốc cùng điểm → duplicate (chọn mức khi chấm sẽ không xác định)', () => {
    expect(
      validateCriterionLevels([ok[0], { score: 5, descriptor: d() }, ok[1], ok[2]], 10),
    ).toMatchObject({ code: 'duplicate', score: 5, index: 2 });
  });

  it('thiếu mốc 0 → missingZero: bài trống sẽ bị chấm về mốc thấp nhất đang có', () => {
    expect(validateCriterionLevels([ok[1], ok[2]], 10)).toEqual({ ok: false, code: 'missingZero' });
  });

  it('thiếu mốc maxScore → missingMax, kèm số max để ghép câu', () => {
    expect(validateCriterionLevels([ok[0], ok[1]], 10)).toEqual({
      ok: false,
      code: 'missingMax',
      score: 10,
    });
  });

  it('mô tả đo SAU trim: 19 ký tự + khoảng trắng đệm vẫn quá ngắn; 501 → quá dài', () => {
    const short = { score: 5, descriptor: `  ${d(19)}  ` };
    expect(validateCriterionLevels([ok[0], short, ok[2]], 10)).toMatchObject({
      code: 'descriptor',
      score: 5,
      index: 1,
    });
    const long = { score: 5, descriptor: d(501) };
    expect(validateCriterionLevels([ok[0], long, ok[2]], 10)).toMatchObject({ code: 'descriptor' });
    // Đúng biên thì hợp lệ.
    expect(validateCriterionLevels([ok[0], { score: 5, descriptor: d(20) }, ok[2]], 10)).toEqual({ ok: true });
    expect(validateCriterionLevels([ok[0], { score: 5, descriptor: d(500) }, ok[2]], 10)).toEqual({ ok: true });
  });

  it('thứ tự vi phạm theo backend: lỗi từng mốc báo TRƯỚC lỗi thiếu mốc biên', () => {
    // Backend duyệt từng mốc rồi mới kiểm 0/max — FE chỉ vào cùng chỗ để câu 400 (nếu lọt)
    // khớp câu FE.
    expect(validateCriterionLevels([{ score: 5, descriptor: '' }, ok[2]], 10)).toMatchObject({
      code: 'descriptor',
    });
  });
});

describe('normalizeCriterionLevels', () => {
  it('trim mô tả và sắp theo điểm tăng dần, không đụng mảng gốc', () => {
    const input = [
      { score: 10, descriptor: ` ${d()} ` },
      { score: 0, descriptor: d() },
    ];
    const out = normalizeCriterionLevels(input);
    expect(out.map((l) => l.score)).toEqual([0, 10]);
    expect(out[1].descriptor).toBe(d());
    expect(input[0].score).toBe(10);
  });
});

const criterion = (over: Partial<RubricCriterion>): RubricCriterion => ({
  id: 'local-1',
  name: 'Giao tiếp',
  description: '',
  weight: 50,
  maxScore: 10,
  ...over,
});

const own = [
  { score: 0, descriptor: `HR tự soạn ${d()}` },
  { score: 10, descriptor: `HR tự soạn ${d()}` },
];

describe('mergeSuggestedLevels — ghép theo TÊN, không theo id', () => {
  it('khớp tên trim + không phân biệt hoa/thường; id khác nhau vẫn ghép', () => {
    // Wizard PUT mint id mới ⇒ id server ≠ id local. Ghép theo id thì không bao giờ khớp.
    const rubric = [criterion({ id: 'new-abc', name: '  giao TIẾP ' })];
    const out = mergeSuggestedLevels(
      rubric,
      [{ name: 'Giao tiếp', levels: ok, maxScore: 10 }],
      'fillEmpty',
    );
    expect(out[0].levels).toEqual(ok);
  });

  it('không ghép theo id: cùng id nhưng khác tên thì KHÔNG điền', () => {
    const rubric = [criterion({ id: 'same-id', name: 'Giao tiếp' })];
    const out = mergeSuggestedLevels(
      rubric,
      [{ name: 'Kỹ thuật', levels: ok, maxScore: 10 }],
      'replaceAll',
    );
    expect(out[0]).toBe(rubric[0]);
    expect(out[0].levels).toBeUndefined();
  });

  it('tiêu chí không có trong đề xuất giữ nguyên tham chiếu — không bị đè, không bị xoá mốc', () => {
    const rubric = [criterion({ name: 'Kỹ thuật', levels: own }), criterion({ id: 'l2', name: 'Giao tiếp' })];
    const out = mergeSuggestedLevels(rubric, [{ name: 'Giao tiếp', levels: ok }], 'replaceAll');
    expect(out[0]).toBe(rubric[0]);
    expect(out[0].levels).toEqual(own);
    expect(out[1].levels).toEqual(ok);
  });

  it('fillEmpty CHỈ điền tiêu chí chưa có mốc; mốc HR đã soạn giữ nguyên', () => {
    const rubric = [criterion({ name: 'Giao tiếp', levels: own }), criterion({ id: 'l2', name: 'Kỹ thuật' })];
    const out = mergeSuggestedLevels(
      rubric,
      [{ name: 'Giao tiếp', levels: ok }, { name: 'Kỹ thuật', levels: ok }],
      'fillEmpty',
    );
    expect(out[0].levels).toEqual(own);
    expect(out[0]).toBe(rubric[0]);
    expect(out[1].levels).toEqual(ok);
  });

  it('replaceAll ghi đè cả tiêu chí đã có mốc', () => {
    const rubric = [criterion({ name: 'Giao tiếp', levels: own })];
    const out = mergeSuggestedLevels(rubric, [{ name: 'Giao tiếp', levels: ok }], 'replaceAll');
    expect(out[0].levels).toEqual(ok);
  });

  it('đề xuất RỖNG mốc không xoá mốc đang có (không có gì để ghi)', () => {
    const rubric = [criterion({ name: 'Giao tiếp', levels: own })];
    const out = mergeSuggestedLevels(rubric, [{ name: 'Giao tiếp', levels: [] }], 'replaceAll');
    expect(out[0]).toBe(rubric[0]);
  });

  it('mốc ghép vào được chuẩn hoá (sắp tăng dần, trim) và không mutate rubric vào', () => {
    const rubric = [criterion({ name: 'Giao tiếp' })];
    const out = mergeSuggestedLevels(
      rubric,
      [{ name: 'Giao tiếp', levels: [{ score: 10, descriptor: ` ${d()} ` }, { score: 0, descriptor: d() }] }],
      'fillEmpty',
    );
    expect(out[0].levels?.map((l) => l.score)).toEqual([0, 10]);
    expect(out[0].levels?.[1].descriptor).toBe(d());
    expect(rubric[0].levels).toBeUndefined();
  });
});

describe('summarizeSuggestedLevels', () => {
  it('đếm khớp / khớp-đã-có-mốc / không khớp để UI quyết định có phải hỏi hay không', () => {
    const rubric = [
      criterion({ name: 'Giao tiếp', levels: own }),
      criterion({ id: 'l2', name: 'Kỹ thuật' }),
    ];
    expect(
      summarizeSuggestedLevels(rubric, [
        { name: 'giao tiếp', levels: ok },
        { name: 'Kỹ thuật', levels: ok },
        { name: 'Tiêu chí đã đổi tên', levels: ok },
        { name: 'Rỗng', levels: [] },
      ]),
    ).toEqual({ matched: 2, matchedWithLevels: 1, unmatched: ['Tiêu chí đã đổi tên'] });
  });
});
