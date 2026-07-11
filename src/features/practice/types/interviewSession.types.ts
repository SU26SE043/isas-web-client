import type { PracticeQuestion } from '../mocks/session.fixtures';

export type AiInterviewerState = 'listening' | 'thinking' | 'speaking';

export type InterviewRoomStatus =
  | 'loading'
  | 'active'
  | 'paused'
  | 'submitting'
  | 'generating'
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
  tabViolationCount: number;
  isTabHidden: boolean;
  isOffline: boolean;
}
