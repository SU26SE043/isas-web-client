/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  isProctoringArmingPhase,
  useCampaignProctoringLifecycle,
} from './useCampaignProctoringLifecycle';

afterEach(() => {
  cleanup();
});

describe('useCampaignProctoringLifecycle', () => {
  it('RESUME giữa buổi (vào thẳng reading, KHÔNG qua countdown) vẫn bật giám sát', () => {
    // Đây là lỗ AC1 vừa vá: tải lại trang giữa buổi không phát pha `countdown`
    // nữa, nên điều kiện cũ (đòi countdown chạy trước) khiến TOÀN BỘ buổi
    // resume chạy không giám sát mà không lỗi gì.
    const { result } = renderHook(() => useCampaignProctoringLifecycle(true));
    expect(result.current.proctoringActive).toBe(false);

    act(() => result.current.handlePhaseChange('reading'));

    expect(result.current.proctoringActive).toBe(true);
  });

  it('RESUME vào thẳng answering cũng bật giám sát', () => {
    const { result } = renderHook(() => useCampaignProctoringLifecycle(true));

    act(() => result.current.handlePhaseChange('answering'));

    expect(result.current.proctoringActive).toBe(true);
  });

  it('đường vào thường qua countdown bật giám sát', () => {
    const { result } = renderHook(() => useCampaignProctoringLifecycle(true));

    act(() => result.current.handlePhaseChange('countdown'));

    expect(result.current.proctoringActive).toBe(true);
  });

  it('đã bật thì pha lạ về sau KHÔNG hạ cờ (giám sát liền mạch tới hết buổi)', () => {
    const { result } = renderHook(() => useCampaignProctoringLifecycle(true));
    act(() => result.current.handlePhaseChange('countdown'));

    // Chuyển câu / tạm dừng / chờ upload đều đi qua những pha không nằm trong
    // tập arming — chúng không được làm rơi giám sát giữa hai câu hỏi.
    act(() => result.current.handlePhaseChange('idle'));
    act(() => result.current.handlePhaseChange('paused'));

    expect(result.current.proctoringActive).toBe(true);
  });

  it('chưa vào buổi thì chưa giám sát', () => {
    const { result } = renderHook(() => useCampaignProctoringLifecycle(true));

    act(() => result.current.handlePhaseChange('intro'));

    expect(result.current.sessionStarted).toBe(false);
    expect(result.current.proctoringActive).toBe(false);
  });

  it('nộp bài xong thì thôi giám sát', () => {
    const { result } = renderHook(() => useCampaignProctoringLifecycle(true));
    act(() => result.current.handlePhaseChange('answering'));
    expect(result.current.proctoringActive).toBe(true);

    act(() => result.current.markCompleted());

    expect(result.current.completed).toBe(true);
    expect(result.current.proctoringActive).toBe(false);
  });

  it('campaign KHÔNG bật chống gian lận thì không bao giờ giám sát', () => {
    const { result } = renderHook(() => useCampaignProctoringLifecycle(false));

    act(() => result.current.handlePhaseChange('answering'));

    expect(result.current.sessionStarted).toBe(true);
    expect(result.current.proctoringActive).toBe(false);
  });

  it('tập pha bật giám sát gồm ĐỦ cả countdown lẫn 2 đường resume', () => {
    expect(isProctoringArmingPhase('countdown')).toBe(true);
    expect(isProctoringArmingPhase('reading')).toBe(true);
    expect(isProctoringArmingPhase('answering')).toBe(true);
    expect(isProctoringArmingPhase('intro')).toBe(false);
    expect(isProctoringArmingPhase('submitting')).toBe(false);
  });
});
