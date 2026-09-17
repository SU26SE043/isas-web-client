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
  violationPaused?: boolean;
  cameraAlwaysOn?: boolean;
  /**
   * Cho phép bấm "Kết thúc" trước khi AI báo `interviewComplete` — dừng buổi giữa chừng, câu chưa
   * trả lời sẽ bị bỏ qua khi chấm (BE tính điểm trên câu đã trả lời, INT-5). Chỉ B2C tự do
   * (`PracticeInterviewPage`); B2B (`CampaignInterviewPage`) giữ hành vi cũ — không truyền cờ này.
   */
  allowEarlyFinish?: boolean;
  onMediaContextChange?: (context: B2cRoomMediaContext) => void;
  onPhaseChange?: (phase: string) => void;
  onSessionSubmitting?: () => void;
  onAnswerUploadStateChange?: (inFlight: boolean) => void;
}
