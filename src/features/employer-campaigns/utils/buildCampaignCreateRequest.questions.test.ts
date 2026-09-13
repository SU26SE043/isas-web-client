import { describe, expect, it } from 'vitest';
import { mapQuestionsToApiRequest, mapRubricToCreateCriteria } from './buildCampaignCreateRequest';
import type { CampaignQuestion } from '../types/campaignManagement.types';

describe('mapQuestionsToApiRequest', () => {
  it('preserves server GUIDs and omits client ids', () => {
    const questions: CampaignQuestion[] = [
      {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        prompt: 'AI question',
        skill: '',
        difficulty: 'middle',
        source: 'ai',
        isRequired: true,
      },
      {
        id: 'client-abc',
        prompt: 'Manual question',
        skill: '',
        difficulty: 'junior',
        source: 'manual',
        isRequired: false,
      },
    ];

    expect(mapQuestionsToApiRequest(questions)).toEqual([
      {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        questionText: 'AI question',
        isRequired: true,
      },
      {
        questionText: 'Manual question',
        isRequired: false,
      },
    ]);
  });

  // SC2 — `undefined`/`null` domain (chưa gắn nhãn) ⇒ khoá `targetCriterionIds` VẮNG (giữ nguyên
  // trên server); mảng thật (kể cả `[]`) ⇒ gửi nguyên, lọc bỏ id KHÔNG phải GUID server.
  it('targetCriterionIds: undefined/null ⇒ vắng khoá; [] ⇒ gửi []; lọc id không phải GUID server', () => {
    const base = { prompt: 'Câu hỏi', skill: '', difficulty: 'middle' as const, source: 'manual' as const, isRequired: true };

    expect(mapQuestionsToApiRequest([{ ...base, id: 'q1' }])[0]).not.toHaveProperty('targetCriterionIds');
    expect(mapQuestionsToApiRequest([{ ...base, id: 'q1', targetCriterionIds: null }])[0]).not.toHaveProperty('targetCriterionIds');
    expect(mapQuestionsToApiRequest([{ ...base, id: 'q1', targetCriterionIds: [] }])[0].targetCriterionIds).toEqual([]);
    expect(
      mapQuestionsToApiRequest([
        { ...base, id: 'q1', targetCriterionIds: ['3fa85f64-5717-4562-b3fc-2c963f66afa6', 'criterion-0', ''] },
      ])[0].targetCriterionIds,
    ).toEqual(['3fa85f64-5717-4562-b3fc-2c963f66afa6']);
  });

  // T7-R1 — ca THỨ BA, khác cả hai ca trên: mảng GỐC có phần tử (HR ĐÃ gắn nhãn) nhưng toàn id
  // TẠM (tiêu chí WhenTargeted vừa thêm tay trong CÙNG lượt lưu, chưa qua PUT nên chưa có id
  // server). Gửi `[]` ở đây sẽ bị BE đọc là "XOÁ nhãn" — mất liên kết HR vừa tạo. Phải OMIT khoá
  // (giữ nguyên trên server) để lượt lưu SAU (khi tiêu chí đã có id thật) có cơ hội gắn lại.
  it('targetCriterionIds: mảng gốc có phần tử nhưng SAU lọc GUID còn rỗng (toàn id tạm) ⇒ OMIT khoá, KHÔNG gửi []', () => {
    const base = { prompt: 'Câu hỏi', skill: '', difficulty: 'middle' as const, source: 'manual' as const, isRequired: true };

    expect(
      mapQuestionsToApiRequest([{ ...base, id: 'q1', targetCriterionIds: ['criterion-not-guid', 'another-fake-id'] }])[0],
    ).not.toHaveProperty('targetCriterionIds');
  });

  // CAMP-16 — `sampleAnswer`: `undefined` (chưa từng đọc) ⇒ khoá vắng; `null` ⇒ gửi `null` = GIỮ
  // NGUYÊN; `''` ⇒ gửi `''` = XOÁ; chuỗi khác ⇒ đặt giá trị mới.
  it('sampleAnswer: undefined ⇒ vắng khoá; null/rỗng/chuỗi đều gửi nguyên (3 trạng thái CAMP-16)', () => {
    const base = { prompt: 'Câu hỏi', skill: '', difficulty: 'middle' as const, source: 'manual' as const, isRequired: true };

    expect(mapQuestionsToApiRequest([{ ...base, id: 'q1' }])[0]).not.toHaveProperty('sampleAnswer');
    expect(mapQuestionsToApiRequest([{ ...base, id: 'q1', sampleAnswer: null }])[0].sampleAnswer).toBeNull();
    expect(mapQuestionsToApiRequest([{ ...base, id: 'q1', sampleAnswer: '' }])[0].sampleAnswer).toBe('');
    expect(mapQuestionsToApiRequest([{ ...base, id: 'q1', sampleAnswer: 'Gợi ý trả lời' }])[0].sampleAnswer).toBe(
      'Gợi ý trả lời',
    );
  });
});

describe('mapRubricToCreateCriteria', () => {
  it('converts UI percentage weights to decimal API weights', () => {
    expect(
      mapRubricToCreateCriteria([
        { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Communication', description: '', weight: 1, maxScore: 10 },
        { id: '9c1f0a2e-4d6b-4a71-8f3c-1b2d5e7a9c40', name: 'Technical', description: '', weight: 99, maxScore: 10 },
      ]),
    ).toEqual([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Communication', description: null, weight: 0.01, maxScore: 10, minPct: null, levels: [] },
      { id: '9c1f0a2e-4d6b-4a71-8f3c-1b2d5e7a9c40', name: 'Technical', description: null, weight: 0.99, maxScore: 10, minPct: null, levels: [] },
    ]);
  });

  it('preserves fractional max scores instead of rounding them', () => {
    expect(
      mapRubricToCreateCriteria([
        { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Depth', description: '', weight: 100, maxScore: 2.5 },
      ]),
    ).toEqual([{ id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Depth', description: null, weight: 1, maxScore: 2.5, minPct: null, levels: [] }]);
  });

  it('echoes existing score levels when a criterion is renamed', () => {
    const levels = [
      { score: 0, descriptor: 'No evidence' },
      { score: 5, descriptor: 'Strong evidence' },
    ];

    expect(
      mapRubricToCreateCriteria([
        { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Renamed', description: '', weight: 100, maxScore: 5, levels },
      ]),
    ).toEqual([{ id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Renamed', description: null, weight: 1, maxScore: 5, minPct: null, levels }]);
  });

  // Bug thật gặp trên dev 04/09: bộ tiêu chí mặc định mang id `technical-depth`, nút "Bắt đầu từ
  // bộ chuẩn" đúc `system-N`, thêm tiêu chí tay đúc `new-xxxxxxxx`. Bộ lọc cũ chỉ chặn tiền tố
  // `criterion-` nên ba kiểu kia lọt lên server ⇒ 400 "could not be converted to Nullable`1[Guid]"
  // ⇒ KHÔNG tạo được chiến dịch. Chỉ echo id có HÌNH DẠNG GUID.
  it.each([
    ['bộ mặc định', 'technical-depth'],
    ['bộ chuẩn', 'system-1'],
    ['thêm tay', 'new-a1b2c3d4'],
    ['id tạm cũ', 'criterion-0'],
    ['rỗng', ''],
  ])('không gửi id do client đúc (%s)', (_label, id) => {
    const [sent] = mapRubricToCreateCriteria([
      { id, name: 'Technical depth', description: '', weight: 100, maxScore: 10 },
    ]);
    expect(sent).not.toHaveProperty('id');
  });

  it('vẫn gửi id khi đó là GUID do server cấp', () => {
    const [sent] = mapRubricToCreateCriteria([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Technical depth', description: '', weight: 100, maxScore: 10 },
    ]);
    expect(sent.id).toBe('3fa85f64-5717-4562-b3fc-2c963f66afa6');
  });

  // Đổi tiền đề (2026-09-12): trước đây tiêu chí không mốc BỎ khoá `levels` khỏi payload. Với CAMP-16 ba trạng thái
  // (vắng = BE mang mốc cũ sang theo TÊN · [] = xoá · [...] = thay) thì cách đó khiến HR xoá hết mốc trong bộ sửa mốc mà
  // server vẫn giữ bộ cũ — im lặng. Wizard hydrate cả levels nên state là nguồn đầy đủ ⇒ gửi tường minh `[]`.
  it('gửi levels: [] tường minh khi tiêu chí không có mốc (xoá hết mốc phải xoá được trên server)', () => {
    for (const levels of [[], undefined]) {
      expect(
        mapRubricToCreateCriteria([
          { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'New', description: '', weight: 100, maxScore: 5, levels },
        ]),
      ).toEqual([{ id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'New', description: null, weight: 1, maxScore: 5, minPct: null, levels: [] }]);
    }
  });

  // SC2 — `scoringScope`: `undefined` domain (chưa từng đọc qua mapper) ⇒ khoá vắng (server mặc
  // định 'Always'); giá trị thật ('Always'/'WhenTargeted') ⇒ gửi nguyên.
  it('scoringScope: undefined ⇒ vắng khoá; giá trị thật gửi nguyên', () => {
    const base = { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Tiêu chí', description: '', weight: 100, maxScore: 5 };
    expect(mapRubricToCreateCriteria([base])[0]).not.toHaveProperty('scoringScope');
    expect(mapRubricToCreateCriteria([{ ...base, scoringScope: 'Always' }])[0].scoringScope).toBe('Always');
    expect(mapRubricToCreateCriteria([{ ...base, scoringScope: 'WhenTargeted' }])[0].scoringScope).toBe(
      'WhenTargeted',
    );
  });
});
