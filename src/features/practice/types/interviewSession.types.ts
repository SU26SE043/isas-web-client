import type { PracticeQuestion } from '../mocks/session.fixtures';
import type { ProctoringConfig, ViolationType } from './proctoring.types';

export type AiInterviewerState = 'listening' | 'thinking' | 'speaking';

export type InterviewRoomStatus =
  | 'loading'
  | 'active'
  | 'paused'
  | 'paused_violation'
  | 'submitting'
  | 'generating'
  | 'auto_submitted'
  | 'completed';

export type ConversationRole = 'ai' | 'user';

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  content: string;
  timestamp: string;
}

export type TimerSeverity = 'normal' | 'warning' | 'critical';

export interface ActiveInterviewSession {
  sessionTitle: string;
  questions: PracticeQuestion[];
  currentIndex: number;
  messages: ConversationMessage[];
  aiState: AiInterviewerState;
  status: InterviewRoomStatus;
  remainingSeconds: number;
  isRecording: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
  violationCount: number;
  tabViolationCount: number;
  violationReason?: ViolationType;
  maxViolations: number;
  isTabHidden: boolean;
  showTabLockWarning: boolean;
  isOffline: boolean;
  proctoringConfig: ProctoringConfig;
}
