/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { recordPracticeFocusEvent } from '../services/b2cPracticeSession.service';
import { useB2cFocusTracking } from './useB2cFocusTracking';

vi.mock('../services/b2cPracticeSession.service', () => ({
  recordPracticeFocusEvent: vi.fn().mockResolvedValue(undefined),
}));

const record = vi.mocked(recordPracticeFocusEvent);

function setVisibility(value: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useB2cFocusTracking', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    record.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('records tab_switch immediately when the tab is hidden, without calling onEvent', () => {
    const onEvent = vi.fn();
    renderHook(() => useB2cFocusTracking('s1', true, onEvent));

    act(() => setVisibility('hidden'));

    expect(record).toHaveBeenCalledWith('s1', 'tab_switch');
    expect(onEvent).not.toHaveBeenCalled();
  });

  it('calls onEvent("tab_switch") when the tab becomes visible again', () => {
    const onEvent = vi.fn();
    renderHook(() => useB2cFocusTracking('s1', true, onEvent));

    act(() => setVisibility('hidden'));
    act(() => setVisibility('visible'));

    expect(onEvent).toHaveBeenCalledWith('tab_switch');
  });

  it('reports focus_lost after 250ms of confirmed blur (tab still visible)', () => {
    vi.useFakeTimers();
    const onEvent = vi.fn();
    renderHook(() => useB2cFocusTracking('s1', true, onEvent));

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(record).toHaveBeenCalledWith('s1', 'focus_lost');
    expect(onEvent).toHaveBeenCalledWith('focus_lost');
  });

  it('cancels the pending focus_lost report on focus within the confirm window', () => {
    vi.useFakeTimers();
    const onEvent = vi.fn();
    renderHook(() => useB2cFocusTracking('s1', true, onEvent));

    act(() => window.dispatchEvent(new Event('blur')));
    act(() => vi.advanceTimersByTime(100));
    act(() => window.dispatchEvent(new Event('focus')));
    act(() => vi.advanceTimersByTime(300));

    expect(record).not.toHaveBeenCalledWith('s1', 'focus_lost');
  });

  it('does not double-report focus_lost when the tab is actually hidden (visibilitychange already covers it)', () => {
    vi.useFakeTimers();
    const onEvent = vi.fn();
    renderHook(() => useB2cFocusTracking('s1', true, onEvent));

    act(() => setVisibility('hidden'));
    act(() => window.dispatchEvent(new Event('blur')));
    act(() => vi.advanceTimersByTime(300));

    expect(record).toHaveBeenCalledTimes(1);
    expect(record).toHaveBeenCalledWith('s1', 'tab_switch');
  });

  it('dedups focus_lost within 1.5s', () => {
    vi.useFakeTimers();
    const onEvent = vi.fn();
    renderHook(() => useB2cFocusTracking('s1', true, onEvent));

    act(() => window.dispatchEvent(new Event('blur')));
    act(() => vi.advanceTimersByTime(300));
    act(() => window.dispatchEvent(new Event('focus')));
    act(() => window.dispatchEvent(new Event('blur')));
    act(() => vi.advanceTimersByTime(300));

    expect(record).toHaveBeenCalledTimes(1);
  });

  it('reports paste immediately, tab stays visible', () => {
    const onEvent = vi.fn();
    renderHook(() => useB2cFocusTracking('s1', true, onEvent));

    act(() => document.dispatchEvent(new Event('paste')));

    expect(record).toHaveBeenCalledWith('s1', 'paste');
    expect(onEvent).toHaveBeenCalledWith('paste');
  });

  it('does nothing at all when disabled', () => {
    const onEvent = vi.fn();
    renderHook(() => useB2cFocusTracking('s1', false, onEvent));

    act(() => setVisibility('hidden'));
    act(() => document.dispatchEvent(new Event('paste')));

    expect(record).not.toHaveBeenCalled();
    expect(onEvent).not.toHaveBeenCalled();
  });

  it('removes listeners on unmount', () => {
    const onEvent = vi.fn();
    const { unmount } = renderHook(() => useB2cFocusTracking('s1', true, onEvent));
    unmount();

    act(() => document.dispatchEvent(new Event('paste')));

    expect(record).not.toHaveBeenCalled();
  });
});
