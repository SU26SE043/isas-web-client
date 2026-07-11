import { create } from 'zustand';
import type { PracticeQuestion } from '../mocks/session.fixtures';
import type {
  AiInterviewerState,
  ConversationMessage,
  InterviewRoomStatus,
} from '../types/interviewSession.types';
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
  tabViolationCount: number;
  isTabHidden: boolean;
  isOffline: boolean;
  setLoading: () => void;
  initSession: (title: string, questions: PracticeQuestion[]) => void;
  tickTimer: () => void;
  setStatus: (status: InterviewRoomStatus) => void;
  setAiState: (state: AiInterviewerState) => void;
  addMessage: (role: ConversationMessage['role'], content: string) => void;
  submitCurrentAnswer: () => Promise<boolean>;
  togglePause: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleRecording: () => void;
  registerTabViolation: () => void;
  setTabHidden: (hidden: boolean) => void;
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
  tabViolationCount: 0,
  isTabHidden: false,
  isOffline: false,
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
  initSession: (title, questions) => {
    const first = questions[0];
    set({
      sessionTitle: title,
      questions,
      currentIndex: 0,
      messages: first ? [createMessage('ai', first.content)] : [],
      aiState: 'speaking',
      status: questions.length ? 'active' : 'completed',
      remainingSeconds: getQuestionTimeLimit(first),
      isRecording: true,
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
  toggleMic: () => set((state) => ({ micEnabled: !state.micEnabled })),
  toggleCamera: () => set((state) => ({ cameraEnabled: !state.cameraEnabled })),
  toggleRecording: () => set((state) => ({ isRecording: !state.isRecording })),
  registerTabViolation: () =>
    set((state) => ({ tabViolationCount: state.tabViolationCount + 1 })),
  setTabHidden: (isTabHidden) => set({ isTabHidden }),
  setOffline: (isOffline) => set({ isOffline }),
  reset: () => set(initialState),
}));
