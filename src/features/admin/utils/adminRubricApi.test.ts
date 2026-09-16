import { describe, expect, it } from 'vitest';
import {
  AdminRubricContractError,
  mergeAdminSuggestedLevels,
  parseAdminRubricPreviewRun,
  parseAdminRubricSet,
  summarizeAdminSuggestion,
  toAdminRubricUpsertInput,
  toEmployerPreviewRun,
} from './adminRubricApi';

/**
 * Fixture chép theo `AdminRubric.cs`/`AdminRubricPreview.cs` (InterviewService) — camelCase từ
 * System.Text.Json, enum `JobCategory` là CHUỖI. KHÔNG được "sửa cho gọn": bản test cũ dựng
 * fixture `{ key, description }` theo type FE tự bịa nên xanh suốt trong khi màn hình trống.
 */
const beRubric = {
  jobCategory: 'BE',
  language: 'vi',
  version: 2,
  changed: false,
  criteria: [
    { id: 'c-1', name: 'Giao tiếp & trình bày', description: 'Rõ ràng, có cấu trúc.', weight: 0.15, maxScore: 5, scoringScope: 'Always', levels: [{ score: 0, descriptor: 'Không trả lời hoặc hoàn toàn lạc đề, không có ý nào liên quan.' }, { score: 5, descriptor: 'Trình bày mạch lạc, có mở-thân-kết và ví dụ minh hoạ cụ thể.' }] },
    { id: 'c-2', name: 'Chiều sâu kỹ thuật', description: null, weight: 0.25, maxScore: 5, scoringScope: 'WhenTargeted', levels: null },
    { id: 'c-3', name: 'Độ trôi chảy & tự tin', description: null, weight: 0.1, maxScore: 5, scoringScope: 'Always', scoringMethod: 'DeliveryMetrics', levels: null },
  ],
  sampleQuestions: [{ id: 'q-1', text: 'Giải thích index trong PostgreSQL.' }],
};

describe('parseAdminRubricSet — hợp đồng khớp DTO backend', () => {
  it('giữ nguyên `descriptor` của mốc (bản cũ đọc `description` ⇒ mọi ô trống)', () => {
    const set = parseAdminRubricSet(beRubric);
    expect(set.criteria[0].levels[0].descriptor).toMatch(/lạc đề/);
    expect(set.criteria[0].id).toBe('c-1');
    expect(set.jobCategory).toBe('BE');
    expect(set.sampleQuestions).toEqual([{ id: 'q-1', text: 'Giải thích index trong PostgreSQL.' }]);
  });

  it('`levels: null` (chưa khai mốc) chuẩn hoá về [] — không phải lỗi', () => {
    expect(parseAdminRubricSet(beRubric).criteria[1].levels).toEqual([]);
  });

  it('`scoringMethod`: đọc đúng `DeliveryMetrics`; THIẾU (BE cũ) hay giá trị lạ ⇒ `Ai` — chiều an toàn là đòi mốc thừa, không bỏ sót', () => {
    const set = parseAdminRubricSet(beRubric);
    expect(set.criteria[2].scoringMethod).toBe('DeliveryMetrics');
    expect(set.criteria[0].scoringMethod).toBe('Ai');                 // thiếu khoá
    const weird = { ...beRubric, criteria: [{ ...beRubric.criteria[0], scoringMethod: 'Measured' }] };
    expect(parseAdminRubricSet(weird).criteria[0].scoringMethod).toBe('Ai');   // giá trị lạ không được nâng thành "đo"
  });

  it('NÉM khi payload mang shape cũ của FE (`description` thay `descriptor`) — hợp đồng lệch phải đổ, không im', () => {
    const drifted = { ...beRubric, criteria: [{ ...beRubric.criteria[0], levels: [{ score: 0, description: 'x'.repeat(30) }] }] };
    expect(() => parseAdminRubricSet(drifted)).toThrow(AdminRubricContractError);
  });

  it('NÉM khi thiếu `id` tiêu chí (bản cũ dùng `key` không tồn tại)', () => {
    const { id: _dropped, ...noId } = beRubric.criteria[0];
    expect(() => parseAdminRubricSet({ ...beRubric, criteria: [noId] })).toThrow(/"id"/);
  });
});

describe('toAdminRubricUpsertInput — body PUT chỉ mang 3 trường BE nhận', () => {
  it('gửi {id, description, levels[{score, descriptor}]}, KHÔNG spread name/weight/maxScore/scoringScope', () => {
    const set = parseAdminRubricSet(beRubric);
    const edited = set.criteria.map((c) => (c.id === 'c-1' ? { ...c, levels: [{ score: 0, descriptor: 'Mới ' + 'x'.repeat(20) }, { score: 5, descriptor: 'Mới ' + 'y'.repeat(20) }] } : c));
    const body = toAdminRubricUpsertInput(edited);
    expect(body).toEqual({
      criteria: [
        { id: 'c-1', description: 'Rõ ràng, có cấu trúc.', levels: [{ score: 0, descriptor: 'Mới ' + 'x'.repeat(20) }, { score: 5, descriptor: 'Mới ' + 'y'.repeat(20) }] },
        { id: 'c-2', description: null, levels: null },
        { id: 'c-3', description: null, levels: null },
      ],
    });
    // BE B10 (Disallow) sẽ 400 nếu body mang khoá lạ — kể cả `scoringMethod` mới thêm ở chiều đọc.
    expect(JSON.stringify(body)).not.toMatch(/"name"|"weight"|"maxScore"|"scoringScope"|"scoringMethod"|"description":"x/);
  });

  it('mô tả toàn khoảng trắng ⇒ null (BE coi rỗng = không có mô tả)', () => {
    const set = parseAdminRubricSet(beRubric);
    const body = toAdminRubricUpsertInput([{ ...set.criteria[0], description: '   ' }]);
    expect(body.criteria[0].description).toBeNull();
  });
});

describe('mergeAdminSuggestedLevels — ghép theo criterionId', () => {
  const set = parseAdminRubricSet(beRubric);
  const suggested = [
    { criterionId: 'c-1', name: 'Giao tiếp & trình bày', maxScore: 5, levels: [{ score: 0, descriptor: 'AI0 ' + 'a'.repeat(20) }, { score: 5, descriptor: 'AI5 ' + 'b'.repeat(20) }] },
    { criterionId: 'c-2', name: 'Chiều sâu kỹ thuật', maxScore: 5, levels: [{ score: 5, descriptor: 'AI5 ' + 'c'.repeat(20) }, { score: 0, descriptor: 'AI0 ' + 'd'.repeat(20) }] },
    { criterionId: 'c-ghost', name: 'Không thuộc bộ', maxScore: 5, levels: [{ score: 0, descriptor: 'z'.repeat(20) }] },
  ];

  it('fillEmpty: chỉ điền tiêu chí CHƯA có mốc, giữ mốc tay của c-1; c-2 được sắp theo score', () => {
    const merged = mergeAdminSuggestedLevels(set.criteria, suggested, 'fillEmpty');
    expect(merged[0].levels[0].descriptor).toMatch(/lạc đề/);
    expect(merged[1].levels.map((l) => l.score)).toEqual([0, 5]);
    expect(summarizeAdminSuggestion(set.criteria, suggested)).toEqual({ matchedNames: ['Giao tiếp & trình bày', 'Chiều sâu kỹ thuật'], matchedEmptyNames: ['Chiều sâu kỹ thuật'] });
  });

  it('replaceAll: ghi đè cả c-1; id lạ bị bỏ, không đẻ tiêu chí mới', () => {
    const merged = mergeAdminSuggestedLevels(set.criteria, suggested, 'replaceAll');
    expect(merged[0].levels[0].descriptor).toMatch(/^AI0/);
    expect(merged).toHaveLength(3);
  });
});

describe('preview run — parse + adapter sang UI employer', () => {
  const beRun = {
    id: 'r-1', status: 'Succeeded', jobCategory: 'BE', language: 'vi', rubricVersion: 2, questionText: 'Q?', rubricFingerprint: 'fp', promptVersion: null,
    deliveryMetricsAvailable: false, lengthParityWarning: false, freeRunsRemaining: 4,
    rubric: [{ criterionId: 'c-1', name: 'Giao tiếp', weight: 0.15, maxScore: 5, levels: [] }],
    samples: [{ band: 'Weak', answerText: 'a', wordCount: 1, expectedPct: 20, actualPct: 48.4, scores: [{ criterionId: 'c-1', criterionName: 'Giao tiếp', maxScore: 5, expectedLevel: 1, actualScore: 2, levelMatched: 2, reasoning: null }] }],
    errorReason: null, createdAt: '2026-09-16T00:00:00Z', completedAt: '2026-09-16T00:00:30Z',
  };

  it('giữ expectedPct/actualPct (trung bình cộng B2C) và map sang expectedWeightedPct/actualWeightedPct cho component employer', () => {
    const run = parseAdminRubricPreviewRun(beRun);
    expect(run.samples[0].actualPct).toBe(48.4);
    const employer = toEmployerPreviewRun(run);
    expect(employer.samples[0].expectedWeightedPct).toBe(20);
    expect(employer.samples[0].actualWeightedPct).toBe(48.4);
    expect(employer.billed).toBe(false);
    expect(employer.scopedCriterionIds).toEqual(['c-1']);
  });

  it('band lạ ⇒ ném (không âm thầm hiện "Của bạn" cho bài AI viết)', () => {
    expect(() => parseAdminRubricPreviewRun({ ...beRun, samples: [{ ...beRun.samples[0], band: 'Medium' }] })).toThrow(AdminRubricContractError);
  });
});
