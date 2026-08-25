import { describe, expect, it } from 'vitest';
import { buildCreateRoadmapRequest } from './buildCreateRoadmapRequest';
import { ROADMAP_SCOPE_LESSONS, ROADMAP_SCOPES } from '../types/learning.types';

const base = { name: '', cvId: undefined, sessionIds: ['session-1'], reportIds: [] };

describe('buildCreateRoadmapRequest — quy mô lộ trình', () => {
  // Trước khi nối trường này, giao diện KHÔNG gửi scope nên backend luôn dựng bản
  // Standard (12 bài = 12 credit) trong khi suất dùng thử chỉ có 3. Người mới tạo
  // lộ trình xong sẽ chạm 402 ở bài thứ tư mà không hiểu vì sao.
  it('gửi scope khi người dùng chọn bản rút gọn', () => {
    const r = buildCreateRoadmapRequest('BE', 'Junior', { ...base, scope: 'Quick' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.body.scope).toBe('Quick');
  });

  // Backend coi vắng mặt là Standard. Gửi thừa không sai, nhưng làm payload nói
  // nhiều hơn ý định của người dùng — và che mất việc họ có chủ động chọn hay không.
  it('KHÔNG gửi scope khi là mặc định Standard', () => {
    const r = buildCreateRoadmapRequest('BE', 'Junior', { ...base, scope: 'Standard' });
    expect(r.ok).toBe(true);
    if (r.ok) expect('scope' in r.body).toBe(false);
  });

  it('không truyền gì thì cũng không gửi scope', () => {
    const r = buildCreateRoadmapRequest('BE', 'Junior', base);
    expect(r.ok).toBe(true);
    if (r.ok) expect('scope' in r.body).toBe(false);
  });

  // Số bài dùng để BÁO GIÁ credit trước khi bấm tạo — sai số này là báo sai tiền.
  it('mỗi quy mô có số bài khai báo, khớp bảng của backend', () => {
    expect(ROADMAP_SCOPE_LESSONS.Quick).toBe(4);
    expect(ROADMAP_SCOPE_LESSONS.Standard).toBe(12);
    for (const s of ROADMAP_SCOPES) expect(ROADMAP_SCOPE_LESSONS[s]).toBeGreaterThan(0);
  });
});
