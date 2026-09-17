import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import toast from 'react-hot-toast';
import { useB2cCoachingNotices } from './useB2cCoachingNotices';

vi.mock('react-hot-toast', () => ({ default: vi.fn() }));
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

const toastMock = vi.mocked(toast);

describe('useB2cCoachingNotices', () => {
  beforeEach(() => {
    toastMock.mockClear();
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a neutral toast keyed by kind, never .success or .error', () => {
    const { result } = renderHook(() => useB2cCoachingNotices());
    result.current.notify('tab_switch');
    expect(toastMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith(
      'practice.room.focusTracking.tab_switch',
      { id: 'practice-coach-tab_switch' },
    );
  });

  it('is a no-op for null (signal cleared)', () => {
    const { result } = renderHook(() => useB2cCoachingNotices());
    result.current.notify(null);
    expect(toastMock).not.toHaveBeenCalled();
  });

  it('throttles behavior signals for 10s per kind', () => {
    const { result } = renderHook(() => useB2cCoachingNotices());
    result.current.notify('paste');
    result.current.notify('paste');
    expect(toastMock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(10_000);
    result.current.notify('paste');
    expect(toastMock).toHaveBeenCalledTimes(2);
  });

  it('throttles frame signals for 30s, independently per kind', () => {
    const { result } = renderHook(() => useB2cCoachingNotices());
    result.current.notify('no_face');
    vi.advanceTimersByTime(10_000);
    result.current.notify('no_face');
    expect(toastMock).toHaveBeenCalledTimes(1);
    result.current.notify('multiple_faces');
    expect(toastMock).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(20_000);
    result.current.notify('no_face');
    expect(toastMock).toHaveBeenCalledTimes(3);
  });

  it('skips notices while the tab is hidden', () => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    const { result } = renderHook(() => useB2cCoachingNotices());
    result.current.notify('focus_lost');
    expect(toastMock).not.toHaveBeenCalled();
  });
});
