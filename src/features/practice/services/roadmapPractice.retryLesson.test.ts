import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';

const post = vi.fn();
vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: (...args: unknown[]) => post(...args),
    put: vi.fn(),
  },
}));

import { roadmapPracticeService } from './roadmapPractice.service';

function httpError(status: number, data: unknown = {}) {
  const headers = new AxiosHeaders();
  return new AxiosError('http', String(status), { headers } as never, null, {
    status,
    statusText: '',
    data,
    headers,
    config: { headers } as never,
  });
}

describe('roadmapPracticeService.retryLesson', () => {
  beforeEach(() => {
    post.mockReset();
  });

  it('POST đúng URL hợp đồng .../lessons/{id}/retry', async () => {
    post.mockResolvedValue({ data: { sessionId: 'ses-9' } });

    await roadmapPracticeService.retryLesson('rm-1', 'ls-2');

    expect(post).toHaveBeenCalledTimes(1);
    // Khoá NGUYÊN VĂN đường dẫn: lệch một chữ là backend 404 mà FE không phân
    // biệt được với "lộ trình của người khác".
    expect(post.mock.calls[0][0]).toBe(
      '/api/v1/interview/practice/roadmaps/rm-1/lessons/ls-2/retry',
    );
    expect(post.mock.calls[0][1]).toEqual({});
  });

  it('KHÔNG gọi nhầm sang đường /start', async () => {
    post.mockResolvedValue({ data: { sessionId: 'ses-9' } });

    await roadmapPracticeService.retryLesson('rm-1', 'ls-2');

    expect(String(post.mock.calls[0][0])).not.toContain('/start');
  });

  it('200 trả session qua CÙNG mapper với start', async () => {
    post.mockResolvedValue({ data: { sessionId: 'ses-9', status: 'Ready' } });

    const result = await roadmapPracticeService.retryLesson('rm-1', 'ls-2');

    expect(result).toMatchObject({ ok: true, resumed: false });
    expect(result.ok && result.session.sessionId).toBe('ses-9');
  });

  it('402 → insufficient_credits', async () => {
    post.mockRejectedValue(httpError(402));
    await expect(roadmapPracticeService.retryLesson('rm-1', 'ls-2')).resolves.toEqual({
      ok: false,
      code: 'insufficient_credits',
    });
  });

  it('409 không kèm sessionId → conflict_resume', async () => {
    post.mockRejectedValue(httpError(409, {}));
    const result = await roadmapPracticeService.retryLesson('rm-1', 'ls-2');
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.code).toBe('conflict_resume');
  });

  it('409 kèm sessionId → mở lại buổi đang dở thay vì báo lỗi', async () => {
    post.mockRejectedValue(httpError(409, { sessionId: 'ses-dang-do' }));
    const result = await roadmapPracticeService.retryLesson('rm-1', 'ls-2');
    expect(result).toEqual({ ok: true, resumed: true, session: { sessionId: 'ses-dang-do' } });
  });

  it('404 → not_found', async () => {
    post.mockRejectedValue(httpError(404));
    await expect(roadmapPracticeService.retryLesson('rm-1', 'ls-2')).resolves.toEqual({
      ok: false,
      code: 'not_found',
    });
  });
});
