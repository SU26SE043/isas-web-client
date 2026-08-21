import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: (...args: unknown[]) => get(...args), post: vi.fn(), put: vi.fn() },
}));

import { roadmapPracticeService } from './roadmapPractice.service';
import completedPayload from './__fixtures__/roadmapReport.completed.json';
import emptyPayload from './__fixtures__/roadmapReport.empty.json';

/**
 * Hai fixture này CHỤP TỪ BACKEND THẬT (dev, `GET .../roadmaps/{id}/report`), không
 * phải do FE bịa ra.
 *
 * Vì sao cần: bộ test kia dùng payload tôi tự viết theo mô tả hợp đồng — nó chứng
 * minh mapper khớp với thứ TÔI TIN backend trả, không chứng minh khớp với thứ backend
 * THẬT SỰ trả. Đúng lớp lỗi từng làm radar vẽ rỗng trên production: mọi tên field
 * trong mapper cũ chỉ tồn tại trong fixtures mock.
 */
describe('getRoadmapReport — chạy trên payload THẬT của backend', () => {
  beforeEach(() => get.mockReset());

  it('lộ trình đã hoàn thành: đọc đúng 6 tiêu chí + ghép ngưỡng theo tên', async () => {
    get.mockResolvedValue({ data: completedPayload });
    const report = await roadmapPracticeService.getRoadmapReport('rm-real');

    expect(report.kind).toBe('snapshot');
    expect(report.radarData).toHaveLength(6);
    expect(report.radarData[0]).toMatchObject({
      subject: 'Giao tiếp & trình bày',
      A: 60,
      B: 60, // ngưỡng ghép từ levelEvaluation theo TÊN — tên có ký tự `&`
    });
    // Không nan nào rơi về 0: đó là triệu chứng của lỗi đọc sai tên field.
    expect(report.radarData.map((r) => r.A)).toEqual([60, 60, 75, 40, 60, 70]);
  });

  it('backend thật đang trả startPercentage = null cho MỌI tiêu chí ⇒ giữ null, không thành 0', async () => {
    get.mockResolvedValue({ data: completedPayload });
    const report = await roadmapPracticeService.getRoadmapReport('rm-real');

    expect(report.radarData.every((r) => r.C === null)).toBe(true);
    expect(report.radarData.some((r) => r.C === 0)).toBe(false);
  });

  it('progress rỗng trên dữ liệu thật ⇒ mảng rỗng, không ném', async () => {
    get.mockResolvedValue({ data: completedPayload });
    const report = await roadmapPracticeService.getRoadmapReport('rm-real');
    expect(report.progress).toEqual([]);
  });

  it('lộ trình chưa chấm buổi nào: mọi mảng rỗng, vẫn map được', async () => {
    get.mockResolvedValue({ data: emptyPayload });
    const report = await roadmapPracticeService.getRoadmapReport('rm-empty');

    expect(report.kind).toBe('interim');
    expect(report.radarData).toEqual([]);
    expect(report.levelEvaluation).toEqual([]);
    expect(report.progress).toEqual([]);
  });

  it('khoá tên field: fixture thật phải mang đúng bộ khoá mapper đang đọc', async () => {
    // Backend đổi tên field ⇒ test này ĐỎ ngay, thay vì radar âm thầm vẽ rỗng.
    const radarKeys = Object.keys((completedPayload as { radar: object[] }).radar[0]!).sort();
    expect(radarKeys).toEqual([
      'averageScore',
      'criterionId',
      'maxScore',
      'name',
      'percentage',
      'recentCount',
      'sessionCount',
      'startPercentage',
      'weight',
    ]);
    expect(Object.keys(completedPayload).sort()).toContain('progress');
    expect(Object.keys(completedPayload).sort()).toContain('roadmapStatus');
  });
});
