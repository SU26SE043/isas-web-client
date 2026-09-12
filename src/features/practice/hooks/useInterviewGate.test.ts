import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useInterviewGate } from './useInterviewGate';

const wallet = vi.hoisted(() => ({ available: 0, reserved: 1, isLoading: false }));
vi.mock('@/features/payment/hooks/useTokenWallet', () => ({ useTokenWallet: () => wallet }));

describe('useInterviewGate — đọc ví thật, không đọc fixture hồ sơ', () => {
  it('buổi lesson: ví thật 0 credit khả dụng ⇒ chặn', () => {
    Object.assign(wallet, { available: 0, reserved: 1, isLoading: false });
    const { result } = renderHook(() => useInterviewGate('learning-session-1'));
    expect(result.current.creditsRemaining).toBe(0);
    expect(result.current.hasSufficientTokens).toBe(false);
    expect(result.current.canStart).toBe(false);
  });

  it('buổi lesson: có ≥ 1 credit ⇒ cho vào', () => {
    Object.assign(wallet, { available: 2, reserved: 0, isLoading: false });
    const { result } = renderHook(() => useInterviewGate('learning-session-1'));
    expect(result.current.canStart).toBe(true);
  });

  it('buổi luyện thường: KHÔNG chặn dù khả dụng = 0 — credit đã được giữ lúc tạo buổi (reserve-first)', () => {
    // Đây đúng là ví của người vừa tiêu credit cuối cho chính buổi này: remaining 0, reserved 1.
    Object.assign(wallet, { available: 0, reserved: 1, isLoading: false });
    const { result } = renderHook(() => useInterviewGate('7e56746b-eb24-4675-924c-39eee1713706'));
    expect(result.current.canStart).toBe(true);
    expect(result.current.hasSufficientTokens).toBe(true);
    expect(result.current.creditsRemaining).toBe(0);
    expect(result.current.tokenReserved).toBe(1);
  });

  it('buổi luyện thường không chờ ví tải xong (ví lỗi/chậm không được nhốt người đã giữ credit)', () => {
    Object.assign(wallet, { available: null, reserved: null, isLoading: true });
    const { result } = renderHook(() => useInterviewGate('7e56746b-eb24-4675-924c-39eee1713706'));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.canStart).toBe(true);
  });
});
