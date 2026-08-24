// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPracticeSessionHistory } from '../services/history.service';
import type { PracticeSessionHistoryItem } from '../types/history.types';
import { practiceHistoryKeys, usePracticeSessionHistory } from './usePracticeSessionHistory';

vi.mock('../services/history.service', () => ({
  getPracticeSessionHistory: vi.fn(),
}));

function session(id: string, lessonTitle: string | null): PracticeSessionHistoryItem {
  return {
    id,
    status: 'Scored',
    jobCategory: 'BE',
    createdAt: '2026-08-20T07:00:00Z',
    completedAt: '2026-08-20T07:20:00Z',
    overallScore: 70,
    seniority: 'Junior',
    lessonTitle,
  };
}

/**
 * `staleTime: Infinity` là CHỦ Ý: nó biến phép đo thành nhị phân. Khoá đổi ⇒ ô cache mới ⇒ bắt buộc
 * gọi service; khoá KHÔNG đổi ⇒ dữ liệu còn tươi vĩnh viễn ⇒ chắc chắn không gọi lại. Nếu để
 * `staleTime` mặc định thì một lần refetch tình cờ có thể làm test xanh dù khoá đang sai.
 */
function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.mocked(getPracticeSessionHistory).mockImplementation(async (params = {}) =>
    params.source === 'lesson'
      ? { items: [session('s-lesson', 'Hiểu rõ HTTP Methods')], nextCursor: null }
      : params.source === 'free'
        ? { items: [session('s-free', null)], nextCursor: null }
        : {
            items: [session('s-lesson', 'Hiểu rõ HTTP Methods'), session('s-free', null)],
            nextCursor: null,
          },
  );
});

afterEach(() => vi.clearAllMocks());

/**
 * 🔴 Bẫy đã được ghi cảnh báo sẵn trong `history.types.ts` trước khi ô lọc được nối: hook dựng
 * `queryKey` từ danh sách field liệt kê TAY. Thiếu `source` ở đó thì hai bộ lọc khác nhau dùng
 * CHUNG một ô cache — bấm "Theo lộ trình" rồi bấm "Tự do" sẽ thấy lại kết quả lần trước, không
 * lỗi, không cảnh báo. Đây là lớp hỏng-im-lặng, nên phải khoá bằng HÀNH VI của hook chứ không chỉ
 * bằng hình dạng của `practiceHistoryKeys.list`: ai đó gỡ `source` khỏi lời gọi `list(...)` thì
 * test hình dạng vẫn xanh.
 */
describe('usePracticeSessionHistory — nguồn buổi luyện phải nằm trong queryKey', () => {
  it('đổi nguồn ⇒ gọi lại service và TRẢ dữ liệu của nguồn mới, không phải dữ liệu cache cũ', async () => {
    const { result, rerender } = renderHook(
      ({ source }: { source: 'lesson' | 'free' }) =>
        usePracticeSessionHistory({ limit: 5, source }),
      { wrapper, initialProps: { source: 'lesson' as 'lesson' | 'free' } },
    );

    await waitFor(() => expect(result.current.data?.items[0]?.id).toBe('s-lesson'));

    rerender({ source: 'free' });

    await waitFor(() => expect(result.current.data?.items[0]?.id).toBe('s-free'));
    expect(getPracticeSessionHistory).toHaveBeenCalledTimes(2);
    expect(vi.mocked(getPracticeSessionHistory).mock.calls.map(([p]) => p?.source)).toEqual([
      'lesson',
      'free',
    ]);
  });

  it('quay lại "tất cả" (source undefined) là một ô cache RIÊNG, không dùng lại của lesson', async () => {
    const { result, rerender } = renderHook(
      ({ source }: { source?: 'lesson' | 'free' }) =>
        usePracticeSessionHistory({ limit: 5, source }),
      { wrapper, initialProps: { source: 'lesson' as 'lesson' | 'free' | undefined } },
    );

    await waitFor(() => expect(result.current.data?.items).toHaveLength(1));

    rerender({ source: undefined });

    await waitFor(() => expect(result.current.data?.items).toHaveLength(2));
  });

  it('truyền nguồn xuống service ĐÚNG chuỗi backend nhận (chữ thường)', async () => {
    renderHook(() => usePracticeSessionHistory({ limit: 5, source: 'lesson' }), { wrapper });

    await waitFor(() => expect(getPracticeSessionHistory).toHaveBeenCalled());
    expect(getPracticeSessionHistory).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'lesson' }),
    );
  });
});

/**
 * ⚠ Backend PHÂN BIỆT hoa/thường: đo trên deploy dev, `?source=LESSON` trả **400** chứ không phải
 * 200. Khoá luôn ở tầng khoá cache để không ai "chuẩn hoá" bằng cách viết hoa.
 */
describe('practiceHistoryKeys.list', () => {
  it('hai nguồn khác nhau ⇒ hai khoá khác nhau', () => {
    expect(practiceHistoryKeys.list({ limit: 5, source: 'lesson' })).not.toEqual(
      practiceHistoryKeys.list({ limit: 5, source: 'free' })
    );
  });

  it('có nguồn khác vắng nguồn', () => {
    expect(practiceHistoryKeys.list({ limit: 5, source: 'lesson' })).not.toEqual(
      practiceHistoryKeys.list({ limit: 5 }),
    );
  });
});
