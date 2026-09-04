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
});

describe('mapRubricToCreateCriteria', () => {
  it('converts UI percentage weights to decimal API weights', () => {
    expect(
      mapRubricToCreateCriteria([
        { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Communication', description: '', weight: 1, maxScore: 10 },
        { id: '9c1f0a2e-4d6b-4a71-8f3c-1b2d5e7a9c40', name: 'Technical', description: '', weight: 99, maxScore: 10 },
      ]),
    ).toEqual([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Communication', description: null, weight: 0.01, maxScore: 10, minPct: null },
      { id: '9c1f0a2e-4d6b-4a71-8f3c-1b2d5e7a9c40', name: 'Technical', description: null, weight: 0.99, maxScore: 10, minPct: null },
    ]);
  });

  it('preserves fractional max scores instead of rounding them', () => {
    expect(
      mapRubricToCreateCriteria([
        { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Depth', description: '', weight: 100, maxScore: 2.5 },
      ]),
    ).toEqual([{ id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Depth', description: null, weight: 1, maxScore: 2.5, minPct: null }]);
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

  it('does not send an empty levels array for a new criterion', () => {
    expect(
      mapRubricToCreateCriteria([
        { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'New', description: '', weight: 100, maxScore: 5, levels: [] },
      ]),
    ).toEqual([{ id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'New', description: null, weight: 1, maxScore: 5, minPct: null }]);
  });
});
