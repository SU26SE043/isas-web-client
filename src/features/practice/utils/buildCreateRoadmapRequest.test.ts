import { ROADMAP_NAME_MAX_CHARS } from '../types/learning.types';
import { describe, expect, it } from 'vitest';
import { buildCreateRoadmapRequest } from './buildCreateRoadmapRequest';

describe('buildCreateRoadmapRequest', () => {
  it('builds minimal payload without client-derived context', () => {
    const result = buildCreateRoadmapRequest('FE', { sessionIds: ['s1'] });
    expect(result).toEqual({
      ok: true,
      body: { jobCategory: 'FE', language: 'vi', sessionIds: ['s1'] },
    });
  });

  it('includes supported fields and dedupes sessionIds', () => {
    const result = buildCreateRoadmapRequest('BE', {
      cvId: 'cv-1',
      sessionIds: ['s1', 's1', '', 's2'],
      cvAnalysisId: 'analysis-1',
      priorRoadmapId: 'roadmap-old',
      focus: '  Improve system design  ',
    });
    expect(result).toEqual({
      ok: true,
      body: {
        jobCategory: 'BE',
        language: 'vi',
        sessionIds: ['s1', 's2'],
        focus: 'Improve system design',
      },
    });
    // Tiền đề backend đã đổi có chủ đích: server tự suy level và bỏ qua toàn bộ
    // context CV/lộ trình cũ, nên payload phải không chứa các khoá legacy này.
    if (result.ok) {
      expect(Object.keys(result.body).sort()).toEqual(['focus', 'jobCategory', 'language', 'sessionIds']);
    }
  });

  it('omits name when the optional input is blank', () => {
    const result = buildCreateRoadmapRequest('FE', { name: '   ', sessionIds: ['s1'] });
    expect(result).toEqual({
      ok: true,
      body: { jobCategory: 'FE', language: 'vi', sessionIds: ['s1'] },
    });
  });

  // TIỀN ĐỀ ĐẢO CÓ CHỦ ĐÍCH (F1). Test cũ khẳng định "gửi mode người dùng đã chọn" — nhưng KHÔNG
  // còn ai chọn: chế độ ôn tập/nâng trình đã gộp thành MỘT bản trộn, bước chọn chế độ gỡ ở
  // `4d53085`, phần hiển thị gỡ ở vòng này. Giữ nguyên test cũ là khoá lại một đường ghi mà giao
  // diện không còn nuôi ⇒ nó chỉ có thể mang giá trị do code tự đặt, tức một lời nói dối về ý
  // định người dùng. Backend khai `string? Mode = null` và coi `null` là "LevelUp", nên KHÔNG gửi
  // là hợp lệ và đúng hành vi mặc định.
  //
  // ⚠ Đây là ca `never` cố ý: TypeScript đã cấm `mode` (gỡ khỏi `CreateRoadmapInput`), nhưng kiểu
  // chỉ chặn được lúc biên dịch. Ép kiểu để chứng minh vế còn lại — có ai đó nhét `mode` vào
  // object lúc CHẠY (payload dựng động, JSON parse, `...spread` từ nguồn cũ) thì builder vẫn KHÔNG
  // đưa nó vào body.
  it('KHÔNG gửi mode — chế độ lộ trình không còn là lựa chọn của người dùng', () => {
    const result = buildCreateRoadmapRequest('BE', {
      mode: 'Reinforce', sessionIds: ['s1'],
    } as unknown as Parameters<typeof buildCreateRoadmapRequest>[1]);
    expect(result).toEqual({
      ok: true,
      body: { jobCategory: 'BE', language: 'vi', sessionIds: ['s1'] },
    });
  });

  it('trims and includes a non-empty roadmap name', () => {
    const result = buildCreateRoadmapRequest('FE', { name: '  My path  ', sessionIds: ['s1'] });
    expect(result).toEqual({
      ok: true,
      body: { jobCategory: 'FE', language: 'vi', sessionIds: ['s1'], name: 'My path' },
    });
  });

  it('rejects focus longer than 2000 characters', () => {
    const result = buildCreateRoadmapRequest('BA', {
      focus: 'x'.repeat(2001),
    });
    expect(result).toEqual({ ok: false, reason: 'focus_too_long' });
  });

  it('rejects missing jobCategory', () => {
    expect(buildCreateRoadmapRequest('', {})).toEqual({
      ok: false,
      reason: 'invalid_input',
    });
  });

  it('rejects an empty session selection after field validation', () => {
    expect(buildCreateRoadmapRequest('FE', {})).toEqual({
      ok: false,
      reason: 'sessions_required',
    });
  });
});

// FE-6 — khoá GIÁ TRỊ TUYỆT ĐỐI của trần tên, không chỉ khoá "có kiểm trần".
//
// Vì sao cần: mọi chỗ khác đều so với chính hằng số này, nên nới hằng số lên thì test cũng nới
// theo — một phép kiểm tự khớp với chính nó, không đo được gì. Đã xác nhận bằng mutation: đổi
// 120 → 500 chạy qua toàn bộ suite mà KHÔNG test nào đỏ.
//
// Hậu quả nếu để trôi: backend chốt trần ở `RoadmapNaming.MaxLength = 120` và trả 400 khi vượt.
// FE nới rộng hơn ⇒ người dùng gõ 300 ký tự, ô nhập cho qua, bấm Lưu thì ăn 400 mà không hiểu vì
// sao. Trần lệch giữa hai đầu luôn hỏng về phía người dùng: hoặc chặn thứ hợp lệ, hoặc cho qua
// thứ server sẽ từ chối.
describe('trần tên lộ trình khớp backend', () => {
  it('giữ đúng 120 — khớp RoadmapNaming.MaxLength phía backend', () => {
    expect(ROADMAP_NAME_MAX_CHARS).toBe(120);
  });
});
