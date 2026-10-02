/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExamClockEntry } from '../utils/examSessionClock';
import { useRoomExamClock } from './useRoomExamClock';

const SERVER_NOW = '2026-10-02T03:00:00.000Z';
const SERVER_MS = Date.parse(SERVER_NOW);
const MACHINE_MS = SERVER_MS + 10 * 60_000; // giờ máy lệch +10 phút
const START_DEADLINE = new Date(MACHINE_MS + 90_000).toISOString(); // hạn cứng chiến dịch, KHÔNG phải giờ thi

function begunEntry(deadlineMinutes = 30): ExamClockEntry {
  return {
    kind: 'begun',
    begin: {
      sessionId: 's-1',
      beganAt: SERVER_NOW,
      deadline: new Date(SERVER_MS + deadlineMinutes * 60_000).toISOString(),
      serverNow: SERVER_NOW,
      durationMinutes: deadlineMinutes,
    },
    beginOffsetMs: SERVER_MS - MACHINE_MS,
    sessionOffsetMs: null,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(MACHINE_MS);
});

const restoreDocumentVisibility: Array<() => void> = [];

/** Giả tab ẩn: `document.hidden` / `visibilityState` của jsdom là getter trên prototype ⇒ che bằng thuộc tính riêng. */
function hideDocument() {
  for (const [key, value] of [['hidden', true], ['visibilityState', 'hidden']] as const) {
    const own = Object.getOwnPropertyDescriptor(document, key);
    Object.defineProperty(document, key, { configurable: true, get: () => value });
    restoreDocumentVisibility.push(() => {
      if (own) Object.defineProperty(document, key, own);
      else delete (document as unknown as Record<string, unknown>)[key];
    });
  }
}

afterEach(() => {
  while (restoreDocumentVisibility.length) restoreDocumentVisibility.pop()!();
  cleanup();
  vi.useRealTimers();
});

describe('useRoomExamClock', () => {
  it('B2B đang begin ⇒ chưa có đồng hồ; begin xong ⇒ 30:00 theo giờ server dù máy lệch +10 phút', () => {
    const { result } = renderHook(() => useRoomExamClock({ beginOnEnter: true, fallbackDeadlineAt: START_DEADLINE }));
    expect(result.current.serverRemainingSeconds).toBeNull();
    expect(result.current.examClock).toBeNull();

    act(() => result.current.applyEntry(begunEntry()));

    expect(result.current.examClock).toEqual({ remainingSeconds: 1800, timeUp: false });
    expect(result.current.serverRemainingSeconds).toBe(1800);
  });

  it('chạy liên tục từng giây (không có nhánh dừng nào)', () => {
    const { result } = renderHook(() => useRoomExamClock({ beginOnEnter: true }));
    act(() => result.current.applyEntry(begunEntry()));

    act(() => { vi.advanceTimersByTime(65_000); });

    expect(result.current.examClock?.remainingSeconds).toBe(1735);
  });

  it('về 0 ⇒ timeUp + onTimeUp gọi ĐÚNG 1 lần (điểm nối F5)', () => {
    const onTimeUp = vi.fn();
    const { result } = renderHook(() => useRoomExamClock({ beginOnEnter: true, onTimeUp }));
    act(() => result.current.applyEntry(begunEntry(1)));

    act(() => { vi.advanceTimersByTime(59_000); });
    expect(onTimeUp).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(5_000); });

    expect(result.current.examClock).toEqual({ remainingSeconds: 0, timeUp: true });
    expect(onTimeUp).toHaveBeenCalledTimes(1);
  });

  it('begin 404 (legacy) ⇒ đường cũ: deadlineAt của start + giờ máy, KHÔNG hiện đồng hồ header', () => {
    const { result } = renderHook(() => useRoomExamClock({ beginOnEnter: true, fallbackDeadlineAt: START_DEADLINE }));
    act(() => result.current.applyEntry({ kind: 'legacy' }));

    expect(result.current.serverRemainingSeconds).toBe(90);
    expect(result.current.examClock).toBeNull();
  });

  it('B2C (không begin, không deadline) ⇒ không có đồng hồ nào', () => {
    const { result } = renderHook(() => useRoomExamClock({ beginOnEnter: false }));
    expect(result.current.serverRemainingSeconds).toBeNull();
    expect(result.current.examClock).toBeNull();
  });

  it('tab ẨN (document.hidden) ⇒ đồng hồ cả buổi KHÔNG dừng: 30 giây trôi ⇒ còn lại giảm đúng 30', () => {
    const { result } = renderHook(() => useRoomExamClock({ beginOnEnter: true }));
    act(() => result.current.applyEntry(begunEntry()));
    expect(result.current.examClock?.remainingSeconds).toBe(1800);

    hideDocument();
    expect(document.hidden).toBe(true);
    expect(document.visibilityState).toBe('hidden');
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    act(() => { vi.advanceTimersByTime(30_000); });

    expect(result.current.examClock?.remainingSeconds).toBe(1770);
  });

  it('tab hiện lại ⇒ tính lại ngay theo giờ hiện tại', () => {
    const { result } = renderHook(() => useRoomExamClock({ beginOnEnter: true }));
    act(() => result.current.applyEntry(begunEntry()));

    // Tab nền bị bóp timer: giờ trôi 5 phút mà không có tick nào.
    vi.setSystemTime(MACHINE_MS + 5 * 60_000);
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });

    expect(result.current.examClock?.remainingSeconds).toBe(1500);
  });
});
