/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AudioRecorderResultStates } from './AudioRecorderResultStates';
import type { AudioRecorderState } from '../../types/audioRecorder.types';

vi.mock('../../../../shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en' as const,
    setLanguage: vi.fn(),
  }),
}));

const previewState: AudioRecorderState = {
  status: 'recorded',
  elapsedSeconds: 12,
  maxDurationSeconds: 120,
  audioBlob: new Blob(['audio'], { type: 'audio/webm' }),
  audioFile: new File(['audio'], 'answer.webm', { type: 'audio/webm' }),
  previewUrl: 'blob:mock-audio-url',
  errorMessage: null,
  errorKind: null,
  playbackError: null,
  isPlaying: false,
  maxDurationReached: false,
  uploadProgress: null,
};

describe('AudioRecorderResultStates preview playback', () => {
  afterEach(() => cleanup());

  it('renders replay button and native audio player in preview', () => {
    const audioRef = { current: null as HTMLAudioElement | null };
    render(
      <AudioRecorderResultStates
        state={previewState}
        audioElementRef={audioRef}
        onStart={vi.fn()}
        onRetake={vi.fn()}
        onReplay={vi.fn()}
        onSubmit={vi.fn()}
        onRetrySubmit={vi.fn()}
        onContinueSuccess={vi.fn()}
        onCloseError={vi.fn()}
      />,
    );

    expect(screen.getByText('practice.audioRecorder.previewTitle')).toBeInTheDocument();
    expect(screen.getByLabelText('practice.audioRecorder.previewPlayer')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'practice.audioRecorder.replay' }),
    ).toBeInTheDocument();
  });

  it('calls onReplay when replay button is clicked', async () => {
    const onReplay = vi.fn();
    const audioRef = { current: null as HTMLAudioElement | null };
    render(
      <AudioRecorderResultStates
        state={previewState}
        audioElementRef={audioRef}
        onStart={vi.fn()}
        onRetake={vi.fn()}
        onReplay={onReplay}
        onSubmit={vi.fn()}
        onRetrySubmit={vi.fn()}
        onContinueSuccess={vi.fn()}
        onCloseError={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'practice.audioRecorder.replay' }));
    expect(onReplay).toHaveBeenCalledTimes(1);
  });

  it('shows retry submit in preview when submit failed without losing audio actions', () => {
    const audioRef = { current: null as HTMLAudioElement | null };
    render(
      <AudioRecorderResultStates
        state={{
          ...previewState,
          errorKind: 'submit-failed',
          errorMessage: 'practice.audioRecorder.submitFailedHint',
        }}
        audioElementRef={audioRef}
        onStart={vi.fn()}
        onRetake={vi.fn()}
        onReplay={vi.fn()}
        onSubmit={vi.fn()}
        onRetrySubmit={vi.fn()}
        onContinueSuccess={vi.fn()}
        onCloseError={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('practice.audioRecorder.submitFailedHint');
    expect(
      screen.getByRole('button', { name: 'practice.audioRecorder.retrySubmit' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'practice.audioRecorder.replay' }),
    ).toBeInTheDocument();
  });

  it('disables actions while submitting', () => {
    const audioRef = { current: null as HTMLAudioElement | null };
    render(
      <AudioRecorderResultStates
        state={{ ...previewState, status: 'submitting' }}
        audioElementRef={audioRef}
        disabled
        onStart={vi.fn()}
        onRetake={vi.fn()}
        onReplay={vi.fn()}
        onSubmit={vi.fn()}
        onRetrySubmit={vi.fn()}
        onContinueSuccess={vi.fn()}
        onCloseError={vi.fn()}
      />,
    );

    expect(screen.getByText('practice.audioRecorder.submitting')).toBeInTheDocument();
  });
});
