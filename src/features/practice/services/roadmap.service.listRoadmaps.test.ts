import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: (...args: unknown[]) => get(...args), post: vi.fn(), put: vi.fn(), patch: vi.fn() },
}));

import { roadmapService } from './roadmap.service';

const LIST = '/api/v1/interview/practice/roadmaps';

/** Hình dạng thật đo trên deploy: 1 dòng Completed + vài dòng đang học, không dòng nào mang con trỏ. */
const rows = [
  { id: '2929e93c', name: 'BE mastery', jobCategory: 'BE', status: 'Completed', hasFinalReport: true, progressPercent: 100, updatedAt: '2026-08-20T00:00:00Z' },
  { id: 'r2', name: 'Active one', jobCategory: 'BE', status: 'Active', progressPercent: 10, updatedAt: '2026-08-19T00:00:00Z' },
  { id: 'r3', name: 'New one', jobCategory: 'BA', status: 'Active', progressPercent: 0, updatedAt: '2026-08-18T00:00:00Z' },
];

beforeEach(() => {
  get.mockReset();
  get.mockImplementation(async (url: string) =>
    url === LIST
      ? { data: rows, headers: { get: () => null } }
      : { data: { id: url.split('/').pop(), milestones: [] }, headers: { get: () => null } },
  );
});

describe('roadmapService.listRoadmaps — bỏ N+1 khi người gọi không cần con trỏ', () => {
  // Vì sao khoá: `enrichCardsMissingCurrentPointers` bắn thêm 1 GET/thẻ. Wizard tạo lộ trình chỉ
  // cần id/tên/trạng thái, mà cửa sổ chờ đó chính là lúc bước "Roadmap đã hoàn tất" hiện ra với
  // dropdown rỗng.
  it('enrichCurrentPointers=false ⇒ đúng MỘT lời gọi, không có lượt chi tiết nào', async () => {
    const out = await roadmapService.listRoadmaps({ status: 'completed' }, { enrichCurrentPointers: false });

    expect(get.mock.calls.map((call) => call[0])).toEqual([LIST]);
    expect(out.map((card) => card.id)).toEqual(['2929e93c']);
    expect(out[0].hasFinalReport).toBe(true);
  });

  it('mặc định VẪN làm giàu con trỏ cho dashboard (không đổi hành vi cũ)', async () => {
    await roadmapService.listRoadmaps();

    expect(get.mock.calls.map((call) => call[0])).toEqual([
      LIST,
      `${LIST}/2929e93c`,
      `${LIST}/r2`,
      `${LIST}/r3`,
    ]);
  });
});
