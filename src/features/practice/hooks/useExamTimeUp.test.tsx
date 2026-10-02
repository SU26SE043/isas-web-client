/* @vitest-environment jsdom */
import { StrictMode, type ReactNode } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EXAM_TIME_UP_UPLOAD_CAP_MS, useExamTimeUp, type UseExamTimeUpOptions } from './useExamTimeUp';

const order: string[] = [];
function setup(overrides: Partial<UseExamTimeUpOptions> = {}) {
  const options: UseExamTimeUpOptions = {
    enabled: true,
    onEnter: vi.fn(() => { order.push('enter'); }),
    requestFinalRecording: vi.fn(() => { order.push('flush'); return false; }),
    waitForInFlightUpload: vi.fn(() => null),
    onUploadPhaseDone: vi.fn(() => { order.push('media-off'); }),
    submitSession: vi.fn(async () => { order.push('submit'); }),
    onTimeUp: vi.fn(() => { order.push('page'); }),
    ...overrides,
  };
  const wrapper = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>;
  const view = renderHook(() => useExamTimeUp(options), { wrapper });
  return { options, view };
}
async function flush(ms = 0) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms); });
}
function badRequest(message: string) {
  return new AxiosError('400', '400', undefined, undefined, {
    status: 400, statusText: 'Bad Request', data: { error: message }, headers: {}, config: { headers: new AxiosHeaders() },
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  order.length = 0;
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('useExamTimeUp', () => {
  it('trần chờ upload đúng 25 000 ms (dưới 30 s ân hạn của server)', () => {
    expect(EXAM_TIME_UP_UPLOAD_CAP_MS).toBe(25_000);
  });

  it('không có gì để nộp ⇒ vào luồng, nộp bài ngay; trigger lặp lại (đồng hồ tick, server báo) KHÔNG nộp lần 2', async () => {
    const { options, view } = setup();
    act(() => { view.result.current.trigger('clock'); });
    expect(view.result.current.isActive()).toBe(true);
    await flush();
    expect(order).toEqual(['enter', 'page', 'flush', 'media-off', 'submit']);
    expect(view.result.current.status).toBe('submitted');

    act(() => {
      view.result.current.trigger('clock');
      view.result.current.trigger('server');
    });
    await flush(60_000);
    expect(options.submitSession).toHaveBeenCalledTimes(1);
    expect(options.onTimeUp).toHaveBeenCalledTimes(1);
  });

  it('có đoạn ghi âm ⇒ chờ tới khi nó xong (settleFinalUpload) rồi mới nộp bài', async () => {
    const { options, view } = setup({ requestFinalRecording: vi.fn(() => { order.push('flush'); return true; }) });
    act(() => { view.result.current.trigger('clock'); });
    await flush(10_000);
    expect(options.submitSession).not.toHaveBeenCalled();
    expect(view.result.current.status).toBe('saving');

    act(() => { view.result.current.settleFinalUpload(); });
    await flush();
    expect(order).toEqual(['enter', 'page', 'flush', 'media-off', 'submit']);
    expect(view.result.current.status).toBe('submitted');
  });

  it('upload không bao giờ xong ⇒ 24 999 ms vẫn chờ, 25 000 ms nộp bài', async () => {
    const { options, view } = setup({ requestFinalRecording: () => true });
    act(() => { view.result.current.trigger('clock'); });
    await flush(24_999);
    expect(options.submitSession).not.toHaveBeenCalled();
    await flush(1);
    expect(options.submitSession).toHaveBeenCalledTimes(1);
  });

  it('upload đang bay (người dùng vừa bấm nộp) ⇒ chờ nó, kể cả khi upload đó lỗi', async () => {
    let fail!: (error: unknown) => void;
    const inFlight = new Promise((_, reject) => { fail = reject; });
    const { options, view } = setup({ waitForInFlightUpload: () => inFlight });
    act(() => { view.result.current.trigger('clock'); });
    await flush(5_000);
    expect(options.submitSession).not.toHaveBeenCalled();
    fail(new Error('409'));
    await flush();
    expect(options.submitSession).toHaveBeenCalledTimes(1);
  });

  it("lý do 'server' (409 SESSION_TIME_UP) ⇒ KHÔNG nộp lại đoạn ghi âm, nộp bài ngay", async () => {
    const { options, view } = setup({ requestFinalRecording: vi.fn(() => true) });
    act(() => { view.result.current.trigger('server'); });
    await flush();
    expect(options.requestFinalRecording).not.toHaveBeenCalled();
    expect(options.submitSession).toHaveBeenCalledTimes(1);
  });

  it('nộp bài lỗi ⇒ submitFailed (màn nói hệ thống tự nộp), không thử lại', async () => {
    const { options, view } = setup({ submitSession: vi.fn(async () => { throw new Error('500'); }) });
    act(() => { view.result.current.trigger('clock'); });
    await flush(60_000);
    expect(view.result.current.status).toBe('submitFailed');
    expect(options.submitSession).toHaveBeenCalledTimes(1);
  });

  it('nộp bài trả 400 "đã nộp rồi" ⇒ coi như đã nộp', async () => {
    const { view } = setup({ submitSession: vi.fn(async () => { throw badRequest('Session already submitted'); }) });
    act(() => { view.result.current.trigger('clock'); });
    await flush();
    expect(view.result.current.status).toBe('submitted');
  });

  it('enabled = false (B2C luyện tập) ⇒ không bao giờ vào luồng hết giờ', async () => {
    const { options, view } = setup({ enabled: false });
    act(() => {
      view.result.current.trigger('clock');
      view.result.current.trigger('server');
    });
    await flush(30_000);
    expect(view.result.current.status).toBeNull();
    expect(view.result.current.isActive()).toBe(false);
    expect(options.submitSession).not.toHaveBeenCalled();
    expect(options.onTimeUp).not.toHaveBeenCalled();
  });
});
