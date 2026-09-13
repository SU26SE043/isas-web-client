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

// Giữ service THẬT (parse/error mapping) — chỉ thay network calls, giống mẫu useRubricPreview.test.tsx.
vi.mock('../services/campaignRubricPreview.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/campaignRubricPreview.service')>()),
  runRubricPreview: runMock,
  getRubricPreviewHistory: historyMock,
}));

import { useQuestionPreview } from './useQuestionPreview';

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
    freeRunsRemaining: 1,
    rubric: [],
    samples: [],
    errorReason: null,
    createdAt: '2026-09-13T10:00:00Z',
    completedAt: '2026-09-13T10:00:30Z',
    scopedCriterionIds: [],
    ...overrides,
  };
}

let client: QueryClient;
const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  runMock.mockReset();
  historyMock.mockReset();
  historyMock.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  client.clear();
});

describe('useQuestionPreview — lọc lịch sử theo câu, dùng CHUNG 1 query cache', () => {
  it('runs/latest chỉ gồm lượt của ĐÚNG câu; các câu khác bị loại', async () => {
    historyMock.mockResolvedValue([
      makeRun({ id: 'r-q1-new', questionId: 'q-1', createdAt: '2026-09-13T11:00:00Z' }),
      makeRun({ id: 'r-q2', questionId: 'q-2' }),
      makeRun({ id: 'r-q1-old', questionId: 'q-1', createdAt: '2026-09-13T09:00:00Z' }),
    ]);
    const { result } = renderHook(
      () => useQuestionPreview({ campaignId: 'c1', questionId: 'q-1' }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.runs).toHaveLength(2));
    expect(result.current.runs.map((r) => r.id)).toEqual(['r-q1-new', 'r-q1-old']);
    expect(result.current.latest?.id).toBe('r-q1-new');
  });

  it('questionId null ⇒ KHÔNG lọc, trả nguyên lịch sử cả campaign', async () => {
    historyMock.mockResolvedValue([makeRun({ id: 'a', questionId: 'q-1' }), makeRun({ id: 'b', questionId: 'q-2' })]);
    const { result } = renderHook(
      () => useQuestionPreview({ campaignId: 'c1', questionId: null }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.runs).toHaveLength(2));
  });

  it('chỉ MỘT lần gọi GET dù dựng nhiều instance cùng campaignId (dùng chung query cache)', async () => {
    historyMock.mockResolvedValue([makeRun({ questionId: 'q-1' })]);
    const { result: a } = renderHook(() => useQuestionPreview({ campaignId: 'c1', questionId: 'q-1' }), { wrapper });
    const { result: b } = renderHook(() => useQuestionPreview({ campaignId: 'c1', questionId: 'q-2' }), { wrapper });
    await waitFor(() => expect(a.current.isLoadingHistory).toBe(false));
    await waitFor(() => expect(b.current.isLoadingHistory).toBe(false));
    expect(historyMock).toHaveBeenCalledTimes(1);
  });
});

describe('useQuestionPreview — isRunning/runningQuestionId là CAMPAIGN-WIDE', () => {
  it('lượt Running của CÂU KHÁC vẫn báo isRunning=true và runningQuestionId đúng câu đó', async () => {
    historyMock.mockResolvedValue([makeRun({ id: 'r', questionId: 'q-2', status: 'Running', completedAt: null })]);
    const { result } = renderHook(
      () => useQuestionPreview({ campaignId: 'c1', questionId: 'q-1' }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isRunning).toBe(true));
    expect(result.current.runningQuestionId).toBe('q-2');
    // Lượt của CÂU KHÁC không lọt vào `runs` của instance này.
    expect(result.current.runs).toEqual([]);
  });

  it('không có lượt Running nào ⇒ runningQuestionId null', async () => {
    historyMock.mockResolvedValue([makeRun({ questionId: 'q-1', status: 'Succeeded' })]);
    const { result } = renderHook(
      () => useQuestionPreview({ campaignId: 'c1', questionId: 'q-1' }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.runs).toHaveLength(1));
    expect(result.current.runningQuestionId).toBeNull();
  });
});

describe('useQuestionPreview — freeRunsRemaining theo câu', () => {
  it('null khi hook không gắn với câu cụ thể (questionId null)', async () => {
    historyMock.mockResolvedValue([makeRun({ questionId: 'q-1' })]);
    const { result } = renderHook(() => useQuestionPreview({ campaignId: 'c1', questionId: null }), { wrapper });
    await waitFor(() => expect(result.current.runs.length).toBeGreaterThan(0));
    expect(result.current.freeRunsRemaining).toBeNull();
  });

  it('lấy từ lượt mới nhất CỦA ĐÚNG câu, bỏ qua lượt (mới hơn) của câu khác', async () => {
    historyMock.mockResolvedValue([
      makeRun({ id: 'other', questionId: 'q-2', freeRunsRemaining: 0, createdAt: '2026-09-13T12:00:00Z' }),
      makeRun({ id: 'mine', questionId: 'q-1', freeRunsRemaining: 1, rubricVersion: 3, createdAt: '2026-09-13T09:00:00Z' }),
    ]);
    const { result } = renderHook(
      () => useQuestionPreview({ campaignId: 'c1', questionId: 'q-1', currentRubricVersion: 3 }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.runs).toHaveLength(1));
    expect(result.current.freeRunsRemaining).toBe(1);
  });

  it('bản thước đo đã đổi ⇒ quota mặc định (1), không tin số của lượt cũ', async () => {
    historyMock.mockResolvedValue([makeRun({ questionId: 'q-1', freeRunsRemaining: 0, rubricVersion: 1 })]);
    const { result } = renderHook(
      () => useQuestionPreview({ campaignId: 'c1', questionId: 'q-1', currentRubricVersion: 2 }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.runs).toHaveLength(1));
    expect(result.current.freeRunsRemaining).toBe(1);
  });
});

describe('useQuestionPreview — R3(a): freeRunsRemaining null = KHÔNG BIẾT (đang tải / cửa sổ 20 lượt đầy)', () => {
  it('lịch sử đang tải ⇒ null (không đoán "còn 1")', async () => {
    let resolveHistory!: (value: RubricPreviewRun[]) => void;
    historyMock.mockReturnValue(new Promise<RubricPreviewRun[]>((r) => { resolveHistory = r; }));
    const { result } = renderHook(() => useQuestionPreview({ campaignId: 'c1', questionId: 'q-1' }), { wrapper });
    await waitFor(() => expect(result.current.isLoadingHistory).toBe(true));
    expect(result.current.freeRunsRemaining).toBeNull();
    await act(async () => { resolveHistory([]); });
    await waitFor(() => expect(result.current.isLoadingHistory).toBe(false));
    expect(result.current.freeRunsRemaining).toBe(1);
  });

  it('cửa sổ 20 lượt đầy toàn lượt câu KHÁC ⇒ null (lượt của câu này có thể nằm ngoài cửa sổ); 19 lượt ⇒ vẫn 1', async () => {
    const others = (n: number) => Array.from({ length: n }, (_, i) => makeRun({ id: `o${i}`, questionId: 'q-other', createdAt: `2026-09-13T10:${String(i).padStart(2, '0')}:00Z` }));
    historyMock.mockResolvedValue(others(20));
    const full = renderHook(() => useQuestionPreview({ campaignId: 'c1', questionId: 'q-1' }), { wrapper });
    await waitFor(() => expect(full.result.current.isLoadingHistory).toBe(false));
    expect(full.result.current.runs).toEqual([]);
    expect(full.result.current.freeRunsRemaining).toBeNull();
    cleanup(); client.clear();

    historyMock.mockResolvedValue(others(19));
    const partial = renderHook(() => useQuestionPreview({ campaignId: 'c2', questionId: 'q-1' }), { wrapper });
    await waitFor(() => expect(partial.result.current.isLoadingHistory).toBe(false));
    expect(partial.result.current.freeRunsRemaining).toBe(1);
  });
});

describe('useQuestionPreview — R3(b): run(customAnswer, { confirmBilled }) đính cờ vào POST', () => {
  const Q = '9c1f0a2e-4d6b-4a71-8f3c-1b2d5e7a9c40';
  it('confirmBilled: true ⇒ POST mang cờ; không truyền ⇒ body không có khoá', async () => {
    runMock.mockResolvedValue(makeRun({ questionId: Q }));
    const { result } = renderHook(() => useQuestionPreview({ campaignId: 'c1', questionId: Q }), { wrapper });
    await act(async () => { await result.current.run('Bài', { confirmBilled: true }); });
    expect(runMock).toHaveBeenLastCalledWith('c1', { questionId: Q, customAnswer: 'Bài', confirmBilled: true });
    await act(async () => { await result.current.run('Bài', { confirmBilled: false }); });
    expect(runMock).toHaveBeenLastCalledWith('c1', { questionId: Q, customAnswer: 'Bài' });
  });
  it('409 confirm-required ⇒ billingConfirm nổi lên qua hook per-question, error null', async () => {
    const error = new axios.AxiosError('Request failed');
    error.response = { status: 409, statusText: '', headers: {}, config: {} as never, data: { code: 'PREVIEW_BILLING_CONFIRM_REQUIRED', freeRunsRemaining: 0, questionId: Q } };
    runMock.mockRejectedValueOnce(error);
    const { result } = renderHook(() => useQuestionPreview({ campaignId: 'c1', questionId: Q }), { wrapper });
    await act(async () => { await result.current.run(); });
    expect(result.current.error).toBeNull();
    expect(result.current.billingConfirm).toMatchObject({ freeRunsRemaining: 0, questionId: Q });
    act(() => result.current.clearBillingConfirm());
    expect(result.current.billingConfirm).toBeNull();
  });
});

describe('useQuestionPreview — run() POST đúng câu đã truyền vào hook', () => {
  const QUESTION_GUID = '9c1f0a2e-4d6b-4a71-8f3c-1b2d5e7a9c40';

  it('gọi run(customAnswer) ⇒ POST với questionId cố định của hook, KHÔNG cần truyền lại mỗi lần', async () => {
    const created = makeRun({ id: 'run-new', questionId: QUESTION_GUID });
    runMock.mockResolvedValue(created);
    const { result } = renderHook(
      () => useQuestionPreview({ campaignId: 'c1', questionId: QUESTION_GUID }),
      { wrapper },
    );
    await act(async () => { await result.current.run('Bài tự dán'); });
    expect(runMock).toHaveBeenCalledWith('c1', { questionId: QUESTION_GUID, customAnswer: 'Bài tự dán' });
  });

  it('run() không tham số ⇒ customAnswer: null', async () => {
    runMock.mockResolvedValue(makeRun());
    const { result } = renderHook(() => useQuestionPreview({ campaignId: 'c1', questionId: QUESTION_GUID }), { wrapper });
    await act(async () => { await result.current.run(); });
    expect(runMock).toHaveBeenCalledWith('c1', { questionId: QUESTION_GUID, customAnswer: null });
  });

  it('beforeRun được gọi trước POST (create-mode: draft chưa tồn tại)', async () => {
    runMock.mockResolvedValue(makeRun());
    const beforeRun = vi.fn().mockResolvedValue('c-fresh');
    const { result } = renderHook(
      () => useQuestionPreview({ campaignId: null, questionId: QUESTION_GUID, beforeRun }),
      { wrapper },
    );
    await act(async () => { await result.current.run(); });
    expect(beforeRun).toHaveBeenCalledTimes(1);
    expect(runMock).toHaveBeenCalledWith('c-fresh', { questionId: QUESTION_GUID, customAnswer: null });
  });

  // `useQuestionPreview` KHÔNG tự lọc GUID — nó thừa hưởng nguyên bộ lọc của `useRubricPreview.run`
  // (id đúc cục bộ chưa qua PUT ⇒ BE tự chọn câu đầu tiên thay vì 400 "không thuộc chiến dịch").
  // Hệ quả: chấm thử "theo câu" chỉ có ý nghĩa với câu ĐÃ CÓ id server thật.
  it('questionId của hook KHÔNG phải GUID server ⇒ thừa hưởng bộ lọc của useRubricPreview (gửi null)', async () => {
    runMock.mockResolvedValue(makeRun());
    const { result } = renderHook(() => useQuestionPreview({ campaignId: 'c1', questionId: 'question-2' }), { wrapper });
    await act(async () => { await result.current.run(); });
    expect(runMock).toHaveBeenCalledWith('c1', { questionId: null, customAnswer: null });
  });
});

describe('useQuestionPreview — SC2 · T9: resolveQuestionId sau beforeRun (câu vừa được lưu mới có id server)', () => {
  const SERVER_ID = '9c1f0a2e-4d6b-4a71-8f3c-1b2d5e7a9c40';

  it('beforeRun HOÀN TẤT rồi mới POST, và POST mang id server do resolveQuestionId trả về (không phải null)', async () => {
    runMock.mockResolvedValue(makeRun({ id: 'run-new', questionId: SERVER_ID }));
    const order: string[] = [];
    const beforeRun = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      order.push('beforeRun:done');
      return 'c-1';
    });
    runMock.mockImplementation(async () => { order.push('POST'); return makeRun({ id: 'run-new', questionId: SERVER_ID }); });
    // correction T9-R3 (F3): resolver KHÔNG được là bảng tĩnh — alias local→server chỉ tồn tại SAU khi `beforeRun`
    // (PUT) xong. Bảng tĩnh khiến phép hoist resolve lên TRƯỚC `await beforeRun()` vẫn xanh, trong khi production
    // sẽ chặn mọi lượt chấm thử ĐẦU TIÊN (alias chưa có ⇒ id vẫn `client-…` ⇒ báo lỗi, không POST).
    const resolveQuestionId = vi.fn((id: string) => {
      order.push('resolve');
      return id === 'client-abc' && order.includes('beforeRun:done') ? SERVER_ID : id;
    });
    const { result } = renderHook(
      () => useQuestionPreview({ campaignId: 'c-1', questionId: 'client-abc', beforeRun, resolveQuestionId }),
      { wrapper },
    );
    await act(async () => { await result.current.run('Bài'); });
    expect(order).toEqual(['beforeRun:done', 'resolve', 'POST']);
    expect(resolveQuestionId).toHaveBeenCalledWith('client-abc');
    expect(runMock).toHaveBeenCalledWith('c-1', { questionId: SERVER_ID, customAnswer: 'Bài' });
  });

  it('có resolver mà sau khi lưu vẫn không có id server ⇒ KHÔNG POST (không để BE chấm câu đầu tiên), báo lỗi, clearError dọn được', async () => {
    const beforeRun = vi.fn(async () => 'c-1');
    const resolveQuestionId = vi.fn((id: string) => id);
    const { result } = renderHook(
      () => useQuestionPreview({ campaignId: 'c-1', questionId: 'client-abc', beforeRun, resolveQuestionId }),
      { wrapper },
    );
    let returned: unknown = 'x';
    await act(async () => { returned = await result.current.run(); });
    expect(returned).toBeNull();
    expect(runMock).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.error?.code).toBe('noQuestions'));
    act(() => result.current.clearError());
    await waitFor(() => expect(result.current.error).toBeNull());
  });

  it('không có resolver ⇒ hành vi cũ nguyên (id không-GUID ⇒ gửi null), beforeRun vẫn gọi trước', async () => {
    runMock.mockResolvedValue(makeRun());
    const beforeRun = vi.fn(async () => 'c-1');
    const { result } = renderHook(() => useQuestionPreview({ campaignId: 'c-1', questionId: 'client-abc', beforeRun }), { wrapper });
    await act(async () => { await result.current.run(); });
    expect(beforeRun).toHaveBeenCalledTimes(1);
    expect(runMock).toHaveBeenCalledWith('c-1', { questionId: null, customAnswer: null });
  });
});
