import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RubricPreviewRun } from '../types/rubricPreview.types';

const { runMock, historyMock } = vi.hoisted(() => ({
  runMock: vi.fn(),
  historyMock: vi.fn(),
}));

// Giữ `mapRubricPreviewError` THẬT — hook phải phân loại đúng lỗi BE, không chỉ chuyển tiếp.
vi.mock('../services/campaignRubricPreview.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/campaignRubricPreview.service')>()),
  runRubricPreview: runMock,
  getRubricPreviewHistory: historyMock,
}));

import { RUBRIC_PREVIEW_POLL_INTERVAL_MS, useRubricPreview } from './useRubricPreview';

function makeRun(overrides: Partial<RubricPreviewRun> = {}): RubricPreviewRun {
  return {
    id: 'run-1',
    status: 'Succeeded',
    questionId: 'q-1',
    questionText: 'Q',
    rubricFingerprint: 'fp',
    rubricVersion: 1,
    promptVersion: null,
    deliveryMetricsAvailable: false,
    lengthParityWarning: false,
    billed: false,
    freeRunsRemaining: 2,
    rubric: [],
    samples: [],
    errorReason: null,
    createdAt: '2026-09-12T10:00:00Z',
    completedAt: '2026-09-12T10:00:30Z',
    ...overrides,
  };
}

function axiosError(status: number, data: unknown) {
  const error = new axios.AxiosError('Request failed');
  error.response = { status, statusText: '', headers: {}, config: {} as never, data };
  return error;
}

let client: QueryClient;
const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

beforeEach(() => {
  // gcTime Infinity: key `['rubric-preview', id-vừa-resolve]` chưa có observer lúc run() ghi cache —
  // gcTime 0 sẽ dọn nó qua setTimeout(0) và biến phép đọc cache thành race. afterEach vẫn clear().
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  runMock.mockReset();
  historyMock.mockReset();
  historyMock.mockResolvedValue([]);
});

afterEach(() => {
  // `globals: false` ⇒ RTL không tự cleanup: hook của test trước còn mount sẽ fetch chồng lên test sau.
  cleanup();
  client.clear();
  vi.useRealTimers();
});

describe('useRubricPreview — lịch sử', () => {
  it('tải lịch sử theo campaignId; latest = runs[0]; freeRunsRemaining từ lượt mới nhất', async () => {
    historyMock.mockResolvedValue([makeRun({ id: 'new', freeRunsRemaining: 1 }), makeRun({ id: 'old' })]);
    const { result } = renderHook(() => useRubricPreview({ campaignId: 'c1' }), { wrapper });
    await waitFor(() => expect(result.current.runs).toHaveLength(2));
    expect(historyMock).toHaveBeenCalledWith('c1');
    expect(result.current.latest?.id).toBe('new');
    expect(result.current.freeRunsRemaining).toBe(1);
    expect(result.current.isRunning).toBe(false);
  });

  it('campaignId null → không gọi GET, freeRunsRemaining null', async () => {
    const { result } = renderHook(() => useRubricPreview({ campaignId: null }), { wrapper });
    await act(async () => {});
    expect(historyMock).not.toHaveBeenCalled();
    expect(result.current.runs).toEqual([]);
    expect(result.current.latest).toBeNull();
    expect(result.current.freeRunsRemaining).toBeNull();
    expect(result.current.isLoadingHistory).toBe(false);
  });
});

describe('useRubricPreview — poll khi lượt mới nhất còn Running', () => {
  beforeEach(() => vi.useFakeTimers());

  it('Running → GET lại sau đúng 5s, và isRunning=true dù không có POST nào đang bay', async () => {
    historyMock.mockResolvedValue([makeRun({ status: 'Running', completedAt: null })]);
    const { result } = renderHook(() => useRubricPreview({ campaignId: 'c1' }), { wrapper });
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(historyMock).toHaveBeenCalledTimes(1);
    expect(result.current.isRunning).toBe(true);

    await act(async () => { await vi.advanceTimersByTimeAsync(RUBRIC_PREVIEW_POLL_INTERVAL_MS - 1); });
    expect(historyMock).toHaveBeenCalledTimes(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(historyMock).toHaveBeenCalledTimes(2);
  });

  it('Succeeded → KHÔNG poll', async () => {
    historyMock.mockResolvedValue([makeRun({ status: 'Succeeded' })]);
    const { result } = renderHook(() => useRubricPreview({ campaignId: 'c1' }), { wrapper });
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(historyMock).toHaveBeenCalledTimes(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(RUBRIC_PREVIEW_POLL_INTERVAL_MS * 3); });
    expect(historyMock).toHaveBeenCalledTimes(1);
    expect(result.current.isRunning).toBe(false);
  });
});

describe('useRubricPreview — run()', () => {
  it('gọi beforeRun TRƯỚC và POST bằng id nó trả về (draft có thể vừa được tạo, campaignId prop còn null)', async () => {
    const created = makeRun({ id: 'run-new' });
    runMock.mockResolvedValue(created);
    const beforeRun = vi.fn().mockResolvedValue('c-fresh');
    const { result } = renderHook(() => useRubricPreview({ campaignId: null, beforeRun }), { wrapper });

    let returned: RubricPreviewRun | null = null;
    await act(async () => { returned = await result.current.run({ questionId: 'q-1' }); });

    expect(beforeRun).toHaveBeenCalledTimes(1);
    expect(beforeRun.mock.invocationCallOrder[0]).toBeLessThan(runMock.mock.invocationCallOrder[0]);
    expect(runMock).toHaveBeenCalledWith('c-fresh', { questionId: 'q-1' });
    expect(returned).toEqual(created);
    // Lượt vừa nhận vào cache của ĐÚNG id đã resolve ⇒ đổi prop sang id đó là thấy ngay.
    expect(client.getQueryData(['rubric-preview', 'c-fresh'])).toEqual([created]);
  });

  it('beforeRun trả null → dừng, KHÔNG POST, không đặt error (wizard đã hiện lỗi rồi)', async () => {
    const beforeRun = vi.fn().mockResolvedValue(null);
    const { result } = renderHook(() => useRubricPreview({ campaignId: 'c1', beforeRun }), { wrapper });
    let returned: RubricPreviewRun | null = makeRun();
    await act(async () => { returned = await result.current.run({}); });
    expect(returned).toBeNull();
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('không có beforeRun → POST bằng campaignId prop; xong thì lịch sử được đồng bộ lại', async () => {
    const created = makeRun({ id: 'run-2', createdAt: '2026-09-12T12:00:00Z' });
    historyMock.mockResolvedValueOnce([makeRun({ id: 'run-1' })]).mockResolvedValue([created, makeRun({ id: 'run-1' })]);
    runMock.mockResolvedValue(created);
    const { result } = renderHook(() => useRubricPreview({ campaignId: 'c1' }), { wrapper });
    await waitFor(() => expect(result.current.runs).toHaveLength(1));

    await act(async () => { await result.current.run({}); });
    expect(runMock).toHaveBeenCalledWith('c1', {});
    await waitFor(() => expect(historyMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.latest?.id).toBe('run-2'));
    expect(result.current.runs).toHaveLength(2);
  });

  it('isRunning=true trong lúc POST đang bay, về false khi xong', async () => {
    let resolve!: (value: RubricPreviewRun) => void;
    runMock.mockReturnValue(new Promise<RubricPreviewRun>((r) => { resolve = r; }));
    const { result } = renderHook(() => useRubricPreview({ campaignId: 'c1' }), { wrapper });
    let pending!: Promise<RubricPreviewRun | null>;
    act(() => { pending = result.current.run({}); });
    await waitFor(() => expect(result.current.isRunning).toBe(true));
    await act(async () => { resolve(makeRun()); await pending; });
    // react-query notify qua setTimeout(0) ⇒ đợi thay vì đọc ngay sau act.
    await waitFor(() => expect(result.current.isRunning).toBe(false));
  });

  it('lỗi BE → error đã phân loại (402 → noCredit, nguyên văn), trả null; clearError xoá', async () => {
    runMock.mockRejectedValue(axiosError(402, 'Ví tổ chức hết credit.'));
    const { result } = renderHook(() => useRubricPreview({ campaignId: 'c1' }), { wrapper });
    let returned: RubricPreviewRun | null = makeRun();
    await act(async () => { returned = await result.current.run({}); });
    expect(returned).toBeNull();
    expect(result.current.error).toEqual({ code: 'noCredit', message: 'Ví tổ chức hết credit.' });
    expect(result.current.isRunning).toBe(false);
    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });

  it('400 thiếu mốc → missingLevels kèm danh sách tiêu chí', async () => {
    runMock.mockRejectedValue(axiosError(400, 'Chưa khai mốc điểm cho tiêu chí: Giao tiếp, Tư duy. Chấm thử cần mốc.'));
    const { result } = renderHook(() => useRubricPreview({ campaignId: 'c1' }), { wrapper });
    await act(async () => { await result.current.run({}); });
    expect(result.current.error).toMatchObject({ code: 'missingLevels', criteria: ['Giao tiếp', 'Tư duy'] });
  });

  it('không campaignId và không beforeRun → notFound, không POST', async () => {
    const { result } = renderHook(() => useRubricPreview({ campaignId: null }), { wrapper });
    await act(async () => { await result.current.run({}); });
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.error).toMatchObject({ code: 'notFound' });
  });
});
