import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import {
  parseSuggestCriterionLevels,
  suggestCriterionLevels,
  suggestCriterionLevelsEndpoint,
} from './campaignLevels.service';

describe('parseSuggestCriterionLevels', () => {
  it('nhận PascalCase của .NET và giữ tên + thang + mốc', () => {
    expect(
      parseSuggestCriterionLevels({
        Criteria: [
          {
            CriterionId: 'c-1',
            Name: ' Giao tiếp ',
            MaxScore: 7,
            Levels: [
              { Score: 7, Descriptor: 'Trả lời mạch lạc, có ví dụ' },
              { Score: 0, Descriptor: 'Không có bằng chứng' },
            ],
          },
        ],
      }),
    ).toEqual({
      criteria: [
        {
          criterionId: 'c-1',
          name: 'Giao tiếp',
          maxScore: 7,
          levels: [
            { score: 7, descriptor: 'Trả lời mạch lạc, có ví dụ' },
            { score: 0, descriptor: 'Không có bằng chứng' },
          ],
        },
      ],
    });
  });

  it('nhận camelCase, bóc envelope `data`, mảng thiếu → []', () => {
    expect(
      parseSuggestCriterionLevels({
        data: { criteria: [{ criterionId: 'c-2', name: 'Kỹ thuật', maxScore: 10 }] },
      }),
    ).toEqual({ criteria: [{ criterionId: 'c-2', name: 'Kỹ thuật', maxScore: 10, levels: [] }] });
    expect(parseSuggestCriterionLevels({})).toEqual({ criteria: [] });
    expect(parseSuggestCriterionLevels(null)).toEqual({ criteria: [] });
  });

  it('mốc không có mô tả bị bỏ — mô tả trống không bao giờ lọt vào thước đo', () => {
    const out = parseSuggestCriterionLevels({
      criteria: [{ name: 'A', levels: [{ score: 0, descriptor: '   ' }, { score: 10, descriptor: 'Đủ' }] }],
    });
    expect(out.criteria[0].levels).toEqual([{ score: 10, descriptor: 'Đủ' }]);
    expect(out.criteria[0].maxScore).toBe(10);
  });
});

describe('suggestCriterionLevels', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('POST đúng đường dẫn, KHÔNG body, id được encode', () => {
    expect(suggestCriterionLevelsEndpoint('a b')).toBe('/api/v1/campaign/a%20b/criteria/levels/suggest');
  });

  it('gọi apiClient.post rồi parse phòng thủ', async () => {
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: { criteria: [{ name: 'A', levels: [{ score: 0, descriptor: 'Không' }] }] } } as never);

    await expect(suggestCriterionLevels('camp-1')).resolves.toEqual({
      criteria: [{ criterionId: '', name: 'A', maxScore: 10, levels: [{ score: 0, descriptor: 'Không' }] }],
    });
    expect(post).toHaveBeenCalledWith('/api/v1/campaign/camp-1/criteria/levels/suggest');
  });

  it('502 KHÔNG bị nuốt thành dải mặc định — lỗi phải nổi lên caller', async () => {
    const error = Object.assign(new Error('AI lỗi'), { response: { status: 502, data: 'AI soạn mốc thất bại' } });
    vi.spyOn(apiClient, 'post').mockRejectedValue(error);

    await expect(suggestCriterionLevels('camp-1')).rejects.toBe(error);
  });
});
