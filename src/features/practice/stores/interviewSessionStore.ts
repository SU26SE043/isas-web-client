import { create } from 'zustand';
import type { PracticeQuestion } from '../mocks/session.fixtures';
import type {
  AiInterviewerState,
  ConversationMessage,
  InterviewRoomStatus,
} from '../types/interviewSession.types';
import type { ProctoringConfig, ViolationType } from '../types/proctoring.types';
import { B2C_PROCTORING_CONFIG } from '../types/proctoring.types';
import { getQuestionTimeLimit } from '../utils/questionTimer';

interface InterviewSessionState {
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
  setLoading: () => void;
  initSession: (
    title: string,
    questions: PracticeQuestion[],
    proctoringConfig: ProctoringConfig,
    startIndex?: number,
  ) => void;
  tickTimer: () => void;
  setStatus: (status: InterviewRoomStatus) => void;
  setAiState: (state: AiInterviewerState) => void;
  addMessage: (role: ConversationMessage['role'], content: string) => void;
  submitCurrentAnswer: () => Promise<boolean>;
  togglePause: () => void;
  continueAfterViolation: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleRecording: () => void;
  registerViolation: (type: ViolationType) => void;
  setTabHidden: (hidden: boolean) => void;
  dismissTabLockWarning: () => void;
  setOffline: (offline: boolean) => void;
  reset: () => void;
}

const initialState = {
  sessionTitle: '',
  questions: [] as PracticeQuestion[],
  currentIndex: 0,
  messages: [] as ConversationMessage[],
  aiState: 'listening' as AiInterviewerState,
  status: 'loading' as InterviewRoomStatus,
  remainingSeconds: 0,
  isRecording: false,
  micEnabled: true,
  cameraEnabled: true,
  violationCount: 0,
  tabViolationCount: 0,
  violationReason: undefined as ViolationType | undefined,
  maxViolations: B2C_PROCTORING_CONFIG.maxViolations,
  isTabHidden: false,
  showTabLockWarning: false,
  isOffline: false,
  proctoringConfig: B2C_PROCTORING_CONFIG,
};

function createMessage(role: ConversationMessage['role'], content: string): ConversationMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export const useInterviewSessionStore = create<InterviewSessionState>((set, get) => ({
  ...initialState,
  setLoading: () => set({ ...initialState, status: 'loading' }),
  initSession: (title, questions, proctoringConfig, startIndex = 0) => {
    const safeIndex =
      questions.length === 0 ? 0 : Math.min(Math.max(0, startIndex), questions.length - 1);
    const current = questions[safeIndex];
    set({
      sessionTitle: title,
      questions,
      currentIndex: safeIndex,
      messages: current ? [createMessage('ai', current.content)] : [],
      aiState: 'speaking',
      status: questions.length ? 'active' : 'completed',
      remainingSeconds: getQuestionTimeLimit(current),
      isRecording: true,
      cameraEnabled: true,
      violationCount: 0,
      tabViolationCount: 0,
      violationReason: undefined,
      maxViolations: proctoringConfig.maxViolations,
      isTabHidden: false,
      showTabLockWarning: false,
      proctoringConfig,
    });
  },
  tickTimer: () => {
    const { status, remainingSeconds } = get();
    if (status !== 'active' || remainingSeconds <= 0) return;
    set({ remainingSeconds: remainingSeconds - 1 });
  },
  setStatus: (status) => set({ status }),
  setAiState: (aiState) => set({ aiState }),
  addMessage: (role, content) =>
    set((state) => ({ messages: [...state.messages, createMessage(role, content)] })),
  submitCurrentAnswer: async () => {
    const state = get();
    if (state.status === 'submitting' || state.status === 'completed') return false;

    const currentQuestion = state.questions[state.currentIndex];
    if (!currentQuestion) return false;

    set({ status: 'submitting', aiState: 'thinking' });
    get().addMessage('user', '__recorded__');
    await delay(900);

    const nextIndex = state.currentIndex + 1;
    const nextQuestion = state.questions[nextIndex];

    if (!nextQuestion) {
      set({ status: 'completed', aiState: 'listening', isRecording: false });
      return true;
    }

    set({
      currentIndex: nextIndex,
      status: 'generating',
      aiState: 'thinking',
    });
    await delay(1200);

    get().addMessage('ai', nextQuestion.content);
    set({
      status: 'active',
      aiState: 'speaking',
      remainingSeconds: getQuestionTimeLimit(nextQuestion),
    });
    return false;
  },
  togglePause: () => {
    const { status } = get();
    if (status === 'active') set({ status: 'paused' });
    else if (status === 'paused') set({ status: 'active' });
  },
  continueAfterViolation: () => {
    const { status } = get();
    if (status === 'paused_violation') {
      set({ status: 'active', violationReason: undefined, showTabLockWarning: false });
    }
  },
  toggleMic: () => set((state) => ({ micEnabled: !state.micEnabled })),
  toggleCamera: () => {
    // Camera is immutable during interviews (B2C and B2B).
  },
  toggleRecording: () => set((state) => ({ isRecording: !state.isRecording })),
  registerViolation: (type) => {
    const state = get();
    if (!state.proctoringConfig.antiCheatEnabled) return;
    if (state.status === 'completed' || state.status === 'auto_submitted') return;

    const nextCount = state.violationCount + 1;
    const tabViolationCount =
      type === 'tab_switch' || type === 'focus_loss'
        ? state.tabViolationCount + 1
        : state.tabViolationCount;

    if (nextCount >= state.maxViolations) {
      set({
        violationCount: nextCount,
        tabViolationCount,
        violationReason: type,
        status: 'auto_submitted',
        isRecording: false,
      });
      return;
    }

    set({
      violationCount: nextCount,
      tabViolationCount,
      violationReason: type,
      status: 'paused_violation',
    });
  },
  setTabHidden: (isTabHidden) => set({ isTabHidden }),
  dismissTabLockWarning: () => set({ showTabLockWarning: false }),
  setOffline: (isOffline) => {
    const { status } = get();
    if (isOffline && status === 'active') {
      set({ isOffline: true, status: 'paused' });
      return;
    }
    if (!isOffline && status === 'paused') {
      set({ isOffline: false, status: 'active' });
      return;
    }
    set({ isOffline });
  },
  reset: () => set(initialState),
}));
