/* @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';

const { recordFocusEvent } = vi.hoisted(() => ({ recordFocusEvent: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../services/b2cPracticeSession.service', () => ({ recordFocusEvent }));

import { useB2cFocusTracking } from './useB2cFocusTracking';

describe('useB2cFocusTracking', () => {
  beforeEach(() => {
    recordFocusEvent.mockClear();
    useB2cPracticeInterviewStore.setState({ stage: 'interviewing' });
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  });

  it('records one event per hidden/visible cycle, only during answer phases', () => {
    const { rerender } = renderHook(({ enabled, phase }: { enabled: boolean; phase: 'answering' | 'countdown' }) => useB2cFocusTracking('session-1', enabled, phase), {
      initialProps: { enabled: true, phase: 'answering' },
    });
    act(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(recordFocusEvent).toHaveBeenCalledTimes(1);
    act(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    act(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(recordFocusEvent).toHaveBeenCalledTimes(2);
    act(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    rerender({ enabled: true, phase: 'countdown' });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(recordFocusEvent).toHaveBeenCalledTimes(2);
  });

  it('không đếm ở countdown kể cả khi tab THẬT SỰ bị ẩn (D4)', () => {
    // Ca cũ chỉ dispatch lúc visibilityState='visible' nên nhánh ghi không bao giờ chạy — test đúng vì lý do sai.
    renderHook(() => useB2cFocusTracking('session-1', true, 'countdown'));
    act(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(recordFocusEvent).not.toHaveBeenCalled();
  });

  it('hai lần hidden liên tiếp mà chưa visible lại chỉ tính MỘT (dedup theo chu kỳ, D3)', () => {
    renderHook(() => useB2cFocusTracking('session-1', true, 'answering'));
    act(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(recordFocusEvent).toHaveBeenCalledTimes(1);
  });

  it('does not react to blur or when disabled', () => {
    const { rerender } = renderHook(({ enabled, phase }: { enabled: boolean; phase: 'answering' | 'countdown' }) => useB2cFocusTracking('session-1', enabled, phase), {
      initialProps: { enabled: false, phase: 'answering' },
    });
    act(() => window.dispatchEvent(new Event('blur')));
    expect(recordFocusEvent).not.toHaveBeenCalled();
    rerender({ enabled: true, phase: 'answering' });
    act(() => window.dispatchEvent(new Event('blur')));
    expect(recordFocusEvent).not.toHaveBeenCalled();
  });
});
