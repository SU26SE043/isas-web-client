/* @vitest-environment jsdom */
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { B2cPracticeRoomDialogs } from './B2cPracticeRoomDialogs';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('./B2cPracticeRoomModals', () => ({
  B2cPracticeRoomModals: () => null,
}));

vi.mock('./audio-recorder/AudioRecorderModal', () => ({
  AudioRecorderModal: ({ maxDurationSeconds }: { maxDurationSeconds: number }) => (
    <output data-testid="max-duration">{maxDurationSeconds}</output>
  ),
}));

const question1 = {
  id: 'question-1',
  content: 'Question 1',
  timeLimitSec: 120,
};
const question2 = {
  id: 'question-2',
  content: 'Question 2',
  timeLimitSec: 90,
};

function createRoom() {
  return {
    currentQuestion: question1,
    currentIndex: 0,
    questions: [question1, question2],
    remainingSeconds: 60,
    speech: { isBusy: false },
    media: { stream: null },
    isTimingOut: false,
    isSubmittingSession: false,
    submittedCount: 0,
    unansweredCount: 1,
    hasPendingRecording: false,
    finishOpen: false,
    overwriteConfirmOpen: false,
    retryConfirmOpen: false,
    setFinishOpen: vi.fn(),
    setOverwriteConfirmOpen: vi.fn(),
    setRetryConfirmOpen: vi.fn(),
    confirmFinish: vi.fn(),
    confirmOverwriteSubmit: vi.fn(),
    confirmRetryRecording: vi.fn(),
    submitAnswerWithFile: vi.fn(),
    submitEmptyAnswer: vi.fn(),
  };
}

describe('B2cPracticeRoomDialogs recorder lifetime', () => {
  it('giữ trần ghi âm đã chốt khi đồng hồ câu tiếp tục giảm', async () => {
    const room = createRoom();
    const view = render(
      <B2cPracticeRoomDialogs
        room={room as never}
        sessionId="session-1"
        recorderOpen
        onRecorderOpenChange={vi.fn()}
        onRecorderStatusChange={vi.fn()}
        autoSubmitRequestId={0}
      />,
    );

    expect(screen.getByTestId('max-duration').textContent).toBe('60');
    room.remainingSeconds = 29;
    view.rerender(
      <B2cPracticeRoomDialogs
        room={room as never}
        sessionId="session-1"
        recorderOpen
        onRecorderOpenChange={vi.fn()}
        onRecorderStatusChange={vi.fn()}
        autoSubmitRequestId={0}
      />,
    );
    await act(async () => {});

    expect(screen.getByTestId('max-duration').textContent).toBe('60');
  });

  it('đóng modal khi câu hiện tại thay đổi', async () => {
    const room = createRoom();
    const onRecorderOpenChange = vi.fn();
    const view = render(
      <B2cPracticeRoomDialogs
        room={room as never}
        sessionId="session-1"
        recorderOpen
        onRecorderOpenChange={onRecorderOpenChange}
        onRecorderStatusChange={vi.fn()}
        autoSubmitRequestId={0}
      />,
    );

    room.currentQuestion = question2;
    room.currentIndex = 1;
    room.remainingSeconds = 90;
    view.rerender(
      <B2cPracticeRoomDialogs
        room={room as never}
        sessionId="session-1"
        recorderOpen
        onRecorderOpenChange={onRecorderOpenChange}
        onRecorderStatusChange={vi.fn()}
        autoSubmitRequestId={0}
      />,
    );
    await act(async () => {});

    expect(onRecorderOpenChange).toHaveBeenCalledWith(false);
  });
});
