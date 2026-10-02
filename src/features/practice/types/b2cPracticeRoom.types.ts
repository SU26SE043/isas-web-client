import type { ExamRoomEntryFailure } from '../hooks/enterExamRoom';

export interface B2cRoomMediaContext {
  state: 'idle' | 'starting' | 'ready' | 'error';
  stream: MediaStream | null;
  restart: () => Promise<MediaStream | null>;
}

export interface B2cPracticeInterviewRoomProps {
  sessionId: string;
  completePath?: string;
  startWithCountdown?: boolean;
  countdownReady?: boolean;
  deadlineAt?: string | null;
  /**
   * ATT1 [I1] — chỉ phòng thi B2B bật: gọi begin khi vào phòng (sau trang chuẩn bị), đồng hồ cả buổi
   * theo giờ server ở header. B2C luyện tập KHÔNG bật ⇒ phòng y nguyên.
   */
  beginOnEnter?: boolean;
  /** Begin có kết quả — trang B2B invalidate cache phiên ["practice","session",id]. */
  onSessionBegun?: () => void;
  /** Đồng hồ cả buổi đang hiện (buổi tính giờ) — trang B2B thêm dòng "vẫn chạy" vào overlay vi phạm. */
  onExamClockChange?: (running: boolean) => void;
  /**
   * ATT1-F5 — phòng vào luồng hết giờ (gọi đúng 1 lần): phòng tự nộp câu cuối + nộp bài và hiện màn "Đã hết
   * giờ". Trang B2B ẩn overlay vi phạm / toàn màn hình (màn hết giờ phải nằm trên cùng) và thôi giám sát.
   */
  onExamTimeUp?: () => void;
  /** ATT1-F5 — không vào được phòng (bảng lỗi): trang B2B ẩn overlay toàn màn hình để bảng lỗi không bị che. */
  onEntryError?: (reason: ExamRoomEntryFailure) => void;
  /** Nút "Về trang chiến dịch" ở màn hết giờ. Vắng ⇒ `completePath`. */
  examTimeUpBackPath?: string;
  violationPaused?: boolean;
  cameraAlwaysOn?: boolean;
  /** Cho phép nộp buổi sớm sau khi đã trả lời tối thiểu 1 câu (không chờ hết câu hỏi). */
  allowEarlyFinish?: boolean;
  onMediaContextChange?: (context: B2cRoomMediaContext) => void;
  onPhaseChange?: (phase: string) => void;
  onSessionSubmitting?: () => void;
  onAnswerUploadStateChange?: (inFlight: boolean) => void;
}
