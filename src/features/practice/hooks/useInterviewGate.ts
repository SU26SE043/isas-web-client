import { useTokenWallet } from '@/features/payment/hooks/useTokenWallet';
import { isLearningSessionId } from '../types/interviewFlow.types';

/**
 * Cổng vào phòng thi đọc VÍ THẬT (`/payment/me/account`). Trước đây nó đọc `useProfile`/`useDashboardSummary`
 * — hai hook thuộc domain `profile` KHÔNG nối BE (fixture cố định) ⇒ ví thật hết credit vẫn được "Tiếp tục",
 * còn fixture đổi thì chặn oan; cộng thêm cổng "hoàn thiện hồ sơ" mà BE không hề có (đo dev 2026-09-13).
 *
 * Hai luật:
 * - Buổi luyện thường: credit ĐÃ được giữ lúc tạo buổi (reserve-first, PAY-5) ⇒ KHÔNG chặn ở đây — chặn
 *   sẽ nhốt đúng người vừa tiêu credit cuối cho chính buổi này (khả dụng = 0 sau khi giữ).
 * - Buổi lesson (`learning-*`): giữ credit xảy ra lúc bấm Bắt đầu ở phòng chờ ⇒ cần ≥ 1 credit khả dụng.
 */
export function useInterviewGate(sessionId?: string) {
  const { available, reserved, isLoading } = useTokenWallet();
  const isLearning = Boolean(sessionId && isLearningSessionId(sessionId));
  const tokenAvailable = available ?? 0;
  const hasSufficientTokens = isLearning ? tokenAvailable >= 1 : true;

  return {
    isLoading: isLearning ? isLoading : false,
    canStart: hasSufficientTokens,
    hasSufficientTokens,
    tokenAvailable,
    tokenReserved: reserved ?? 0,
    creditsRemaining: tokenAvailable,
    isLearning,
  };
}
