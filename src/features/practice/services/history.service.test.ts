import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { fetchInterviewHistory, getPracticeSessionHistory } from './history.service';

vi.mock('@/shared/mock', () => ({
  mockDelay: vi.fn(),
  usesMockData: () => false,
}));

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('fetchInterviewHistory live API adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] });
  });

  it('does not send optional status filters when the query omits them', async () => {
    await fetchInterviewHistory({});

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v1/interview/practice/sessions/history',
      { params: { limit: 20 } },
    );
  });

  it('forwards status and excludeCampaign to the HTTP history request', async () => {
    await fetchInterviewHistory({ status: 'Scored', excludeCampaign: true });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v1/interview/practice/sessions/history',
      { params: { limit: 20, status: 'Scored', excludeCampaign: true } },
    );
  });
});

/**
 * Tên tham số là HỢP ĐỒNG với backend (`?source=lesson|free`). Gửi sai tên thì ASP.NET **bỏ qua
 * query param lạ** và trả 200 kèm danh sách đầy đủ — không lỗi, không cảnh báo, bộ lọc chỉ đơn
 * giản không lọc gì. Khoá đúng chuỗi ở đây để hai repo không trôi khỏi nhau.
 */
describe('getPracticeSessionHistory — tham số lọc theo nguồn buổi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] });
  });

  it('không truyền nguồn ⇒ KHÔNG gửi `source` (vắng = lấy tất cả)', async () => {
    await getPracticeSessionHistory({ limit: 5 });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v1/interview/practice/sessions/history',
      { params: { limit: 5 } },
    );
  });

  it('lọc buổi theo lộ trình ⇒ gửi đúng `source=lesson`', async () => {
    await getPracticeSessionHistory({ limit: 5, source: 'lesson' });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v1/interview/practice/sessions/history',
      { params: { limit: 5, source: 'lesson' } },
    );
  });

  it('lọc buổi tự do ⇒ gửi đúng `source=free`', async () => {
    await getPracticeSessionHistory({ limit: 5, source: 'free' });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v1/interview/practice/sessions/history',
      { params: { limit: 5, source: 'free' } },
    );
  });
});
