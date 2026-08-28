import { useCallback, useState } from 'react';

/**
 * Các pha của phòng thi khiến buổi được coi là ĐÃ BẮT ĐẦU.
 *
 * `countdown` là đường vào thường; `reading`/`answering` là đường RESUME —
 * ứng viên tải lại trang giữa buổi không đi qua countdown nữa. Trước AC1 điều
 * kiện giám sát đòi countdown phải chạy trước, nên **mọi buổi resume đều không
 * được giám sát** mà không có lỗi nào. Đừng thu hẹp tập này về mình `countdown`.
 */
const ARMING_PHASES = new Set(['countdown', 'reading', 'answering']);

export function isProctoringArmingPhase(phase: string): boolean {
  return ARMING_PHASES.has(phase);
}

export interface CampaignProctoringLifecycle {
  /**
   * Điều kiện DUY NHẤT để bật giám sát. Trang phải truyền thẳng giá trị này
   * xuống `useCampaignAntiCheat`/`useCampaignFaceCheck`, KHÔNG được AND thêm
   * điều kiện nào tại chỗ gọi:
   *
   * - `&& !currentViolation` ⇒ tắt giám sát đúng lúc ứng viên đang khắc phục
   *   vi phạm — cửa sổ dễ gian lận nhất.
   * - `&& isFullscreen` ⇒ ứng viên thoát fullscreen là hết bị giám sát.
   *
   * Cả hai đều là lỗi AC1 vừa vá; `CampaignInterviewPage.test.tsx` khoá lại.
   */
  proctoringActive: boolean;
  sessionStarted: boolean;
  completed: boolean;
  /** Nối vào `onPhaseChange` của phòng thi. Chỉ bật, không bao giờ tắt. */
  handlePhaseChange: (phase: string) => void;
  /** Nối vào `onSessionSubmitting` — buổi kết thúc thì thôi giám sát. */
  markCompleted: () => void;
}

export function useCampaignProctoringLifecycle(
  antiCheatEnabled: boolean,
): CampaignProctoringLifecycle {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handlePhaseChange = useCallback((phase: string) => {
    // Chỉ chuyển false→true. Pha sau đó (chuyển câu, tạm dừng vì vi phạm,
    // chờ upload) KHÔNG được hạ cờ — giám sát phải liền mạch tới hết buổi.
    if (isProctoringArmingPhase(phase)) setSessionStarted(true);
  }, []);

  const markCompleted = useCallback(() => setCompleted(true), []);

  return {
    proctoringActive: antiCheatEnabled && sessionStarted && !completed,
    sessionStarted,
    completed,
    handlePhaseChange,
    markCompleted,
  };
}
