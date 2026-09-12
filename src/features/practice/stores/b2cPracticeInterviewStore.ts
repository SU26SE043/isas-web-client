import { create } from 'zustand';
import type {
  PracticeInterviewStage,
  PracticeQuestionResponse,
  PracticeSessionResponse,
  QuestionAnswerState,
  RecordingStatus,
  SubmitPracticeAnswerResponse,
} from '../types/b2cPracticeSession.types';

export interface SubmittedAnswerState {
  answerId: string;
  questionId: string;
  status: string;
  transcript?: string | null;
  nextAction?: SubmitPracticeAnswerResponse['nextAction'];
  interviewComplete?: boolean;
}

interface B2cPracticeInterviewState {
  sessionId: string | null;
  session: PracticeSessionResponse | null;
  currentQuestionId: string | null;
  questions: PracticeQuestionResponse[];
  answersByQuestionId: Record<string, SubmittedAnswerState>;
  questionStates: Record<string, QuestionAnswerState>;
  recordingStatus: RecordingStatus;
  remainingSeconds: number;
  stage: PracticeInterviewStage;
  sessionTimeLimitSec: number;
  speechWarning: string | null;
  lastNextAction: SubmitPracticeAnswerResponse['nextAction'] | null;
  interviewComplete: boolean;

  hydrateFromSession: (session: PracticeSessionResponse) => void;
  setCurrentQuestion: (questionId: string, timeLimitSec?: number) => void;
  appendQuestion: (question: PracticeQuestionResponse) => void;
  setAnswer: (questionId: string, answer: SubmittedAnswerState) => void;
  setQuestionState: (questionId: string, state: QuestionAnswerState) => void;
  setRecordingStatus: (status: RecordingStatus) => void;
  setRemainingSeconds: (seconds: number) => void;
  tickTimer: () => void;
  setStage: (stage: PracticeInterviewStage) => void;
  setSpeechWarning: (message: string | null) => void;
  setInterviewComplete: (value: boolean, nextAction?: SubmitPracticeAnswerResponse['nextAction']) => void;
  updateSession: (session: PracticeSessionResponse) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null as string | null,
  session: null as PracticeSessionResponse | null,
  currentQuestionId: null as string | null,
  questions: [] as PracticeQuestionResponse[],
  answersByQuestionId: {} as Record<string, SubmittedAnswerState>,
  questionStates: {} as Record<string, QuestionAnswerState>,
  recordingStatus: 'idle' as RecordingStatus,
  remainingSeconds: 0,
  stage: 'setup' as PracticeInterviewStage,
  sessionTimeLimitSec: 120,
  speechWarning: null as string | null,
  lastNextAction: null as SubmitPracticeAnswerResponse['nextAction'] | null,
  interviewComplete: false,
};

export const useB2cPracticeInterviewStore = create<B2cPracticeInterviewState>((set, get) => ({
  ...initialState,

  hydrateFromSession: (session) => {
    // Quay lại buổi dở: server đã giữ câu trả lời (INT-3/BK16) nên phải nạp lại, KHÔNG được bắt đầu từ câu 1 —
    // bắt đầu lại là ứng viên trả lời đè lên bài đã nộp (upload lại = ghi đè, điểm cũ bị xoá và chấm lại).
    // Đo trên dev 2026-09-12: buổi đã nộp 8/9 câu, "Tiếp tục" cho ra 9/9 câu chưa trả lời, 4 lượt nộp thêm đè đúng câu 1–4.
    const answersByQuestionId: Record<string, SubmittedAnswerState> = {};
    for (const answer of session.answers ?? []) {
      if (!answer.answerId || !answer.questionId) continue;
      answersByQuestionId[answer.questionId] = {
        answerId: answer.answerId,
        questionId: answer.questionId,
        status: answer.status ?? 'Scoring',
        transcript: answer.transcript ?? null,
      };
    }
    const current = session.questions.find((q) => !answersByQuestionId[q.id]) ?? null;
    const allAnswered = session.questions.length > 0 && current == null;
    // Không còn câu nào chưa trả lời ⇒ đứng ở câu cuối và mở nút Kết thúc (nút đó chỉ hiện khi `interviewComplete`).
    const anchor = current ?? session.questions[session.questions.length - 1] ?? null;
    const questionStates: Record<string, QuestionAnswerState> = {};
    for (const q of session.questions) {
      questionStates[q.id] = answersByQuestionId[q.id]
        ? 'submitted'
        : q.id === anchor?.id
          ? 'reading_question'
          : 'not_started';
    }
    set({
      sessionId: session.id,
      session,
      questions: session.questions,
      currentQuestionId: anchor?.id ?? null,
      answersByQuestionId,
      questionStates,
      recordingStatus: 'idle',
      remainingSeconds: anchor?.timeLimitSec ?? session.timeLimitSec ?? 120,
      stage: allAnswered ? 'ready_to_finish' : 'interviewing',
      sessionTimeLimitSec: session.timeLimitSec ?? anchor?.timeLimitSec ?? 120,
      speechWarning: null,
      lastNextAction: null,
      interviewComplete: allAnswered,
    });
  },

  setCurrentQuestion: (questionId, timeLimitSec) => {
    const { questions, sessionTimeLimitSec, questionStates } = get();
    const question = questions.find((q) => q.id === questionId);
    const limit = timeLimitSec ?? question?.timeLimitSec ?? sessionTimeLimitSec;
    set({
      currentQuestionId: questionId,
      remainingSeconds: limit,
      recordingStatus: 'idle',
      questionStates: {
        ...questionStates,
        [questionId]: 'reading_question',
      },
      speechWarning: null,
    });
  },

  appendQuestion: (question) => {
    const { questions, currentQuestionId } = get();
    if (questions.some((q) => q.id === question.id)) return;
    // Seed (original) questions are all pre-loaded at session start, so a
    // follow-up/clarify question must be inserted right after the question
    // it follows — not pushed to the end of the array — otherwise the
    // array position (which drives the "question X of Y" progress display)
    // jumps straight from the current question to the last pre-loaded seed
    // slot the moment the AI asks a follow-up.
    const insertAt =
      currentQuestionId != null
        ? questions.findIndex((q) => q.id === currentQuestionId) + 1
        : questions.length;
    const nextQuestions = [...questions];
    nextQuestions.splice(insertAt < 0 ? questions.length : insertAt, 0, question);
    set({
      questions: nextQuestions,
      questionStates: {
        ...get().questionStates,
        [question.id]: get().questionStates[question.id] ?? 'not_started',
      },
    });
  },

  setAnswer: (questionId, answer) => {
    set({
      answersByQuestionId: {
        ...get().answersByQuestionId,
        [questionId]: answer,
      },
      questionStates: {
        ...get().questionStates,
        [questionId]: 'submitted',
      },
    });
  },

  setQuestionState: (questionId, state) => {
    set({
      questionStates: {
        ...get().questionStates,
        [questionId]: state,
      },
    });
  },

  setRecordingStatus: (status) => set({ recordingStatus: status }),

  setRemainingSeconds: (seconds) => set({ remainingSeconds: Math.max(0, seconds) }),

  tickTimer: () => {
    const { remainingSeconds, stage } = get();
    if (stage !== 'interviewing' && stage !== 'ready_to_finish') return;
    if (remainingSeconds <= 0) return;
    set({ remainingSeconds: remainingSeconds - 1 });
  },

  setStage: (stage) => set({ stage }),

  setSpeechWarning: (message) => set({ speechWarning: message }),

  setInterviewComplete: (value, nextAction) =>
    set({
      interviewComplete: value,
      lastNextAction: nextAction ?? get().lastNextAction,
      stage: value ? 'ready_to_finish' : get().stage,
    }),

  updateSession: (session) => set({ session, sessionId: session.id }),

  reset: () => set({ ...initialState }),
}));
