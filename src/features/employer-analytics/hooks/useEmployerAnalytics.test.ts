/* @vitest-environment node */
import { AxiosError, AxiosHeaders } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { keepPreviousData } from '@tanstack/react-query';

const useQueryMock = vi.fn((_options: unknown) => ({ data: undefined }));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return { ...actual, useQuery: (options: unknown) => useQueryMock(options) };
});

vi.mock('../services/employerAnalytics.service', () => ({
  employerAnalyticsService: { getEmployerAnalytics: vi.fn() },
}));

import { employerAnalyticsService } from '../services/employerAnalytics.service';
import { employerAnalyticsKeys, useEmployerAnalytics } from './useEmployerAnalytics';

type CapturedOptions = {
  queryKey: readonly unknown[];
  queryFn: () => unknown;
  placeholderData: unknown;
  retry: (failureCount: number, error: unknown) => boolean;
};

function lastOptions(): CapturedOptions {
  const call = useQueryMock.mock.calls.at(-1) as unknown[] | undefined;
  if (!call) throw new Error('useQuery chưa được gọi');
  return call[0] as CapturedOptions;
}

function httpError(status: number) {
  return new AxiosError('x', undefined, undefined, undefined, {
    status, statusText: 'x', headers: {}, config: { headers: new AxiosHeaders() }, data: {},
  });
}

describe('useEmployerAnalytics', () => {
  beforeEach(() => useQueryMock.mockClear());

  it('khoá query mang TRỌN params (kỳ + nhóm) ⇒ đổi lọc là khoá mới; queryFn gọi service với chính params đó', () => {
    const params = { from: '2026-08-14T00:00:00.000Z', to: '2026-09-13T00:00:00.000Z', groupBy: 'month' as const };
    useEmployerAnalytics(params);
    const options = lastOptions();
    expect(options.queryKey).toEqual(['employer-campaign-analytics', params]);
    expect(options.queryKey).toEqual(employerAnalyticsKeys.detail(params));
    expect(employerAnalyticsKeys.detail({ groupBy: 'day' })).not.toEqual(employerAnalyticsKeys.detail({ groupBy: 'month' }));
    options.queryFn();
    expect(employerAnalyticsService.getEmployerAnalytics).toHaveBeenCalledWith(params);
  });

  it('giữ dữ liệu cũ trong lúc tải kỳ mới bằng `keepPreviousData` của TanStack v5', () => {
    useEmployerAnalytics({ groupBy: 'day' });
    expect(lastOptions().placeholderData).toBe(keepPreviousData);
  });

  it('400/401/403 không retry; lỗi khác retry tối đa 2 lần', () => {
    useEmployerAnalytics({});
    const { retry } = lastOptions();
    expect(retry(0, httpError(400))).toBe(false);
    expect(retry(0, httpError(401))).toBe(false);
    expect(retry(0, httpError(403))).toBe(false);
    expect(retry(0, httpError(500))).toBe(true);
    expect(retry(1, httpError(500))).toBe(true);
    expect(retry(2, httpError(500))).toBe(false);
    expect(retry(0, new Error('network'))).toBe(true);
  });
});
