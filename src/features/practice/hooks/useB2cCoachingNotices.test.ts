/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import toast from 'react-hot-toast';
import { useB2cCoachingNotices } from './useB2cCoachingNotices';

vi.mock('react-hot-toast', () => ({ default: vi.fn() }));
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const toastFn = vi.mocked(toast);

describe('useB2cCoachingNotices', () => {
  beforeEach(() => {
    toastFn.mockClear();
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('shows a toast with a per-type id (react-hot-toast updates in place, does not stack)', () => {
    const { result } = renderHook(() => useB2cCoachingNotices());

    act(() => result.current.notify('tab_switch'));

    expect(toastFn).toHaveBeenCalledWith(
      'practice.room.focusTracking.tabSwitch',
      expect.objectContaining({ id: 'practice-coach-tab_switch', duration: 4000 }),
    );
  });

  it('throttles behavior signals within 10s', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useB2cCoachingNotices());

    act(() => result.current.notify('tab_switch'));
    act(() => vi.advanceTimersByTime(5_000));
    act(() => result.current.notify('tab_switch'));

    expect(toastFn).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(6_000));
    act(() => result.current.notify('tab_switch'));

    expect(toastFn).toHaveBeenCalledTimes(2);
  });

  it('throttles frame signals within 30s (longer than behavior)', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useB2cCoachingNotices());

    act(() => result.current.notify('no_face'));
    act(() => vi.advanceTimersByTime(15_000));
    act(() => result.current.notify('no_face'));

    expect(toastFn).toHaveBeenCalledTimes(1);
  });

  it('each signal type has its own throttle bucket', () => {
    const { result } = renderHook(() => useB2cCoachingNotices());

    act(() => result.current.notify('tab_switch'));
    act(() => result.current.notify('paste'));
    act(() => result.current.notify('focus_lost'));

    expect(toastFn).toHaveBeenCalledTimes(3);
  });

  it('does not toast while the document is hidden', () => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    const { result } = renderHook(() => useB2cCoachingNotices());

    act(() => result.current.notify('tab_switch'));

    expect(toastFn).not.toHaveBeenCalled();
  });
});
