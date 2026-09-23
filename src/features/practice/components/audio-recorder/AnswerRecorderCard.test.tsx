// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnswerRecorderCard } from './AnswerRecorderCard';

vi.mock('../../../../shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en' as const,
    setLanguage: vi.fn(),
  }),
}));

describe('AnswerRecorderCard inline recorder flow', () => {
  const createObjectURL = vi.fn(() => 'blob:mock-audio-url');
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

    class MockMediaRecorder {
      static isTypeSupported = vi.fn(() => true);
      state: RecordingState = 'inactive';
      mimeType = 'audio/webm';
      stream: MediaStream;
      options?: MediaRecorderOptions;
      ondataavailable: ((event: BlobEvent) => void) | null = null;
      onstop: (() => void) | null = null;

      constructor(stream: MediaStream, options?: MediaRecorderOptions) {
        this.stream = stream;
        this.options = options;
      }

      start() {
        this.state = 'recording';
        window.setTimeout(() => {
          this.ondataavailable?.({ data: new Blob(['chunk'], { type: 'audio/webm' }) } as BlobEvent);
        }, 0);
      }

      stop() {
        this.state = 'inactive';
        this.onstop?.();
      }
    }

    vi.stubGlobal('MediaRecorder', MockMediaRecorder as unknown as typeof MediaRecorder);
    const track = { enabled: true, readyState: 'live', stop: vi.fn(), onended: null as (() => void) | null };
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getAudioTracks: () => [track],
          getTracks: () => [track],
        }),
      },
    });
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    HTMLMediaElement.prototype.pause = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  const baseProps = {
    sessionId: 'session-1',
    questionId: 'question-1',
    maxDurationSeconds: 120,
    onSubmitRecording: vi.fn().mockResolvedValue(undefined),
  };

  async function recordToPreview() {
    render(<AnswerRecorderCard {...baseProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'practice.audioRecorder.start' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'practice.audioRecorder.stop' })).toBeInTheDocument();
    });
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
    });
    await userEvent.click(screen.getByRole('button', { name: 'practice.audioRecorder.stop' }));
    await waitFor(() => {
      expect(screen.getByText('practice.audioRecorder.previewTitle')).toBeInTheDocument();
    });
  }

  it('shows the recorder inline and does not use a dialog role', async () => {
    render(<AnswerRecorderCard {...baseProps} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'practice.audioRecorder.cardTitle' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'practice.audioRecorder.start' })).toBeInTheDocument();
  });

  it('calls submit API only when submit is clicked', async () => {
    await recordToPreview();
    await userEvent.click(screen.getByRole('button', { name: 'practice.audioRecorder.submit' }));
    await waitFor(() => expect(baseProps.onSubmitRecording).toHaveBeenCalledTimes(1));
    expect(baseProps.onSubmitRecording).toHaveBeenCalledWith(expect.any(File), expect.any(Number));
  });

  it('keeps preview after submit failure and allows retry submit', async () => {
    const onSubmitRecording = vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(undefined);
    render(<AnswerRecorderCard {...baseProps} onSubmitRecording={onSubmitRecording} />);
    await userEvent.click(screen.getByRole('button', { name: 'practice.audioRecorder.start' }));
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
    });
    await userEvent.click(screen.getByRole('button', { name: 'practice.audioRecorder.stop' }));
    await waitFor(() => expect(screen.getByText('practice.audioRecorder.previewTitle')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'practice.audioRecorder.submit' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'practice.audioRecorder.retrySubmit' })).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'practice.audioRecorder.retrySubmit' }));
    await waitFor(() => expect(onSubmitRecording).toHaveBeenCalledTimes(2));
  });

  it('auto-submits an empty answer when the timer requests submission without a recording', async () => {
    const onAutoSubmitEmpty = vi.fn().mockResolvedValue(undefined);
    render(<AnswerRecorderCard {...baseProps} onAutoSubmitEmpty={onAutoSubmitEmpty} autoSubmitRequestId={1} />);

    await waitFor(() => expect(onAutoSubmitEmpty).toHaveBeenCalledTimes(1));
  });

  it('auto-submits the recorded answer when the timer requests submission', async () => {
    const onSubmitRecording = vi.fn().mockResolvedValue(undefined);
    const onAutoSubmitRecording = vi.fn().mockResolvedValue(undefined);
    const onAutoSubmitEmpty = vi.fn().mockResolvedValue(undefined);
    const view = render(
      <AnswerRecorderCard
        {...baseProps}
        onSubmitRecording={onSubmitRecording}
        onAutoSubmitRecording={onAutoSubmitRecording}
        onAutoSubmitEmpty={onAutoSubmitEmpty}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'practice.audioRecorder.start' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'practice.audioRecorder.stop' })).toBeInTheDocument());
    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 1200)); });
    await userEvent.click(screen.getByRole('button', { name: 'practice.audioRecorder.stop' }));
    await waitFor(() => expect(screen.getByText('practice.audioRecorder.previewTitle')).toBeInTheDocument());

    view.rerender(
      <AnswerRecorderCard
        {...baseProps}
        onSubmitRecording={onSubmitRecording}
        onAutoSubmitRecording={onAutoSubmitRecording}
        onAutoSubmitEmpty={onAutoSubmitEmpty}
        autoSubmitRequestId={1}
      />,
    );
    await waitFor(() => expect(onAutoSubmitRecording).toHaveBeenCalledTimes(1));
    expect(onSubmitRecording).not.toHaveBeenCalled();
    expect(onAutoSubmitEmpty).not.toHaveBeenCalled();
  });

  it('does not start a second timeout submission while one is submitting', async () => {
    let resolveSubmit!: () => void;
    const onAutoSubmitRecording = vi.fn().mockImplementation(
      () => new Promise<void>((resolve) => { resolveSubmit = resolve; }),
    );
    const onAutoSubmitEmpty = vi.fn().mockResolvedValue(undefined);
    const view = render(
      <AnswerRecorderCard
        {...baseProps}
        onAutoSubmitRecording={onAutoSubmitRecording}
        onAutoSubmitEmpty={onAutoSubmitEmpty}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'practice.audioRecorder.start' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'practice.audioRecorder.stop' })).toBeInTheDocument());
    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 1200)); });
    await userEvent.click(screen.getByRole('button', { name: 'practice.audioRecorder.stop' }));
    await waitFor(() => expect(screen.getByText('practice.audioRecorder.previewTitle')).toBeInTheDocument());
    view.rerender(<AnswerRecorderCard {...baseProps} onAutoSubmitRecording={onAutoSubmitRecording} onAutoSubmitEmpty={onAutoSubmitEmpty} autoSubmitRequestId={1} />);
    await waitFor(() => expect(onAutoSubmitRecording).toHaveBeenCalledTimes(1));
    view.rerender(<AnswerRecorderCard {...baseProps} onAutoSubmitRecording={onAutoSubmitRecording} onAutoSubmitEmpty={onAutoSubmitEmpty} autoSubmitRequestId={2} />);
    expect(onAutoSubmitEmpty).not.toHaveBeenCalled();
    resolveSubmit();
    await waitFor(() => expect(onAutoSubmitRecording).toHaveBeenCalledTimes(1));
  });
});
