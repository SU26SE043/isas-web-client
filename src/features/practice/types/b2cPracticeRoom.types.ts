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
  /** Cho phép nộp buổi sớm sau khi đã trả lời tối thiểu 1 câu (không chờ hết câu hỏi). */
  allowEarlyFinish?: boolean;
  onMediaContextChange?: (context: B2cRoomMediaContext) => void;
  onPhaseChange?: (phase: string) => void;
  onSessionSubmitting?: () => void;
  onAnswerUploadStateChange?: (inFlight: boolean) => void;
}
