/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { B2cPracticeInterviewRoom } from './B2cPracticeInterviewRoom';

const question = { id: 'question-1', content: 'Question 1', timeLimitSec: 60 };
const mediaTrack = {
  enabled: true,
  readyState: 'live' as const,
  stop: vi.fn(),
  onended: null as (() => void) | null,
};
const mediaStream = {
  getAudioTracks: () => [mediaTrack],
  getTracks: () => [mediaTrack],
} as unknown as MediaStream;

const roomState = {
  isLoading: false,
  phase: 'answering',
  currentQuestion: question,
  currentIndex: 0,
  questions: [question],
  remainingSeconds: 60,
  questionStates: [],
  showTimerWarning: false,
  lastNextAction: null,
  speechWarning: null,
  speech: { isBusy: false, isLoadingSpeech: false, isPlaying: false, needsManualPlay: false, playManual: vi.fn() },
  media: { videoRef: { current: null }, state: 'ready', stream: null, startMedia: vi.fn(), setVideoElement: vi.fn() },
  isSubmittingAnswer: false,
  isSubmittingSession: false,
  isTimingOut: false,
  interviewComplete: false,
  answersByQuestionId: {},
  micEnabled: true,
  cameraEnabled: true,
  canFinishEarly: false,
  hasPendingRecording: false,
  submittedCount: 0,
  unansweredCount: 1,
  finishOpen: false,
  overwriteConfirmOpen: false,
  retryConfirmOpen: false,
  setFinishOpen: vi.fn(),
  confirmFinish: vi.fn(),
  confirmOverwriteSubmit: vi.fn(),
  confirmRetryRecording: vi.fn(),
  setOverwriteConfirmOpen: vi.fn(),
  setRetryConfirmOpen: vi.fn(),
  submitAnswerWithFile: vi.fn().mockResolvedValue(undefined),
  submitEmptyAnswer: vi.fn().mockResolvedValue(true),
  handleAutoSubmitEmptyResult: vi.fn(),
  toggleMic: vi.fn(),
  toggleCamera: vi.fn(),
};

vi.mock('../hooks/useB2cPracticeRoom', () => ({
  useB2cPracticeRoom: () => roomState,
}));
vi.mock('../hooks/useB2cRoomCoaching', () => ({
  useB2cRoomCoaching: () => ({ cameraAlwaysOn: false }),
}));
vi.mock('./InterviewHeader', () => ({ InterviewHeader: () => null }));
vi.mock('./AIInterviewerPanel', () => ({ AIInterviewerPanel: () => null }));
vi.mock('./CandidateCameraPanel', () => ({ CandidateCameraPanel: () => null }));
vi.mock('./InterviewQuestionPanel', () => ({ InterviewQuestionPanel: () => null }));
vi.mock('./B2cInterviewControls', () => ({ B2cInterviewControls: () => null }));
vi.mock('./B2cPracticeRoomDialogs', () => ({ B2cPracticeRoomDialogs: () => null }));
vi.mock('./QuestionStartCountdown', () => ({ QuestionStartCountdown: () => null }));
vi.mock('./room/FullscreenExitBanner', () => ({ FullscreenExitBanner: () => null }));
vi.mock('react-router-dom', () => ({ useNavigate: () => Object.assign(vi.fn(), { length: 0 }) }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn() } }));
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));
vi.mock('@/shared/mock', () => ({ usesMockData: () => false }));

class MockMediaRecorder {
  static isTypeSupported = vi.fn(() => true);
  state: RecordingState = 'inactive';
  mimeType = 'audio/webm';
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onstop: (() => void) | null = null;

  constructor(_stream: MediaStream, _options?: MediaRecorderOptions) {}

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['chunk'], { type: 'audio/webm' }) } as BlobEvent);
    this.onstop?.();
  }
}

function renderRoom() {
  return render(<B2cPracticeInterviewRoom sessionId="session-1" completePath="/done" />);
}

describe('B2cPracticeInterviewRoom recorder duration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mediaTrack.stop.mockReset();
    vi.stubGlobal('MediaRecorder', MockMediaRecorder as unknown as typeof MediaRecorder);
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:audio'), revokeObjectURL: vi.fn() });
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(mediaStream) },
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    roomState.remainingSeconds = 60;
  });

  it('keeps recording after the room countdown rerenders below the frozen question duration', async () => {
    const view = renderRoom();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'practice.audioRecorder.start' }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText('practice.audioRecorder.cardStatus.recording')).toBeInTheDocument();

    for (const remainingSeconds of [55, 45, 30, 20]) {
      roomState.remainingSeconds = remainingSeconds;
      view.rerender(<B2cPracticeInterviewRoom sessionId="session-1" completePath="/done" />);
    }

    await act(async () => {
      vi.advanceTimersByTime(25_000);
    });

    expect(screen.getByText('practice.audioRecorder.cardStatus.recording')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'practice.audioRecorder.stop' })).toBeInTheDocument();
  });
});
