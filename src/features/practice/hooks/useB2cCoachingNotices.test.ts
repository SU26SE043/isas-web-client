import { renderHook } from '@testing-library/react';
import { isValidElement, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import toast from 'react-hot-toast';
import { useB2cCoachingNotices } from './useB2cCoachingNotices';

vi.mock('react-hot-toast', () => ({ default: vi.fn() }));
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

const toastMock = vi.mocked(toast);

/** Toast thứ `index`: nội dung (tiêu đề + lời khuyên theo khoá) và tuỳ chọn. */
function shownToast(index: number) {
  const [content, options] = toastMock.mock.calls[index];
  expect(isValidElement(content)).toBe(true);
  return { props: (content as ReactElement<{ title: string; message: string }>).props, options };
}

describe('useB2cCoachingNotices', () => {
  beforeEach(() => {
    toastMock.mockClear();
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('toast nhắc theo LOẠI: tiêu đề + lời khuyên + icon, một id mỗi loại; không .success/.error', () => {
    const { result } = renderHook(() => useB2cCoachingNotices());
    result.current.notify('tab_switch');
    expect(toastMock).toHaveBeenCalledTimes(1);
    const { props, options } = shownToast(0);
    expect(props).toEqual({
      title: 'practice.room.focusTracking.title.tab_switch',
      message: 'practice.room.focusTracking.tab_switch',
    });
    expect(options).toMatchObject({ id: 'practice-coach-tab_switch', duration: 5000 });
    // 2026-10-04: có icon + viền cam — trước đó chỉ là dòng chữ xám, không điểm nhấn.
    expect(isValidElement(options?.icon)).toBe(true);
    expect(options?.className).toContain('border-warning');
  });

  it('is a no-op for null (signal cleared)', () => {
    const { result } = renderHook(() => useB2cCoachingNotices());
    result.current.notify(null);
    expect(toastMock).not.toHaveBeenCalled();
  });

  it('throttles behavior signals for 10s per kind', () => {
    const { result } = renderHook(() => useB2cCoachingNotices());
    result.current.notify('focus_lost');
    result.current.notify('focus_lost');
    expect(toastMock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(10_000);
    result.current.notify('focus_lost');
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

  it('low_light là nhóm khung hình: toast đúng khoá, throttle 30s, độc lập với no_face', () => {
    const { result } = renderHook(() => useB2cCoachingNotices());
    result.current.notify('low_light');
    expect(shownToast(0).props.title).toBe('practice.room.focusTracking.title.low_light');
    expect(shownToast(0).options).toMatchObject({ id: 'practice-coach-low_light' });
    vi.advanceTimersByTime(10_000);
    result.current.notify('low_light');
    expect(toastMock).toHaveBeenCalledTimes(1);   // 10s < 30s ⇒ nuốt (hành vi chỉ 10s thì đã hiện)
    result.current.notify('no_face');
    expect(toastMock).toHaveBeenCalledTimes(2);   // khác loại ⇒ không chặn nhau
    vi.advanceTimersByTime(20_000);
    result.current.notify('low_light');
    expect(toastMock).toHaveBeenCalledTimes(3);
  });

  it('skips notices while the tab is hidden', () => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    const { result } = renderHook(() => useB2cCoachingNotices());
    result.current.notify('focus_lost');
    expect(toastMock).not.toHaveBeenCalled();
  });
});
