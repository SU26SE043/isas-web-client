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
  onMediaContextChange?: (context: B2cRoomMediaContext) => void;
  onPhaseChange?: (phase: string) => void;
  onSessionSubmitting?: () => void;
  onAnswerUploadStateChange?: (inFlight: boolean) => void;
}
