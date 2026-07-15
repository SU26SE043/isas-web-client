/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { InterviewControls } from '../components/InterviewControls';

vi.mock('../../../shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en' as const,
    setLanguage: vi.fn(),
  }),
}));

const baseProps = {
  sessionId: 'session-123',
  remainingSeconds: 60,
  isSubmitting: false,
  isPaused: false,
  isLocked: false,
  micEnabled: true,
  cameraEnabled: true,
  isRecording: true,
  chunksUploaded: 0,
  onSubmit: vi.fn(),
  onTogglePause: vi.fn(),
  onToggleMic: vi.fn(),
  onToggleCamera: vi.fn(),
  onToggleRecording: vi.fn(),
};

describe('InterviewControls camera toggle', () => {
  afterEach(() => cleanup());

  it('shows camera toggle for B2C practice when cameraAlwaysOn is false', async () => {
    const onToggleCamera = vi.fn();
    render(
      <MemoryRouter>
        <InterviewControls {...baseProps} cameraAlwaysOn={false} onToggleCamera={onToggleCamera} />
      </MemoryRouter>,
    );

    const camera = screen.getByRole('button', { name: 'practice.flow.controls.camera' });
    expect(camera).toBeInTheDocument();
    await userEvent.click(camera);
    expect(onToggleCamera).toHaveBeenCalledTimes(1);
  });

  it('hides camera toggle for B2B exam when cameraAlwaysOn is true', () => {
    render(
      <MemoryRouter>
        <InterviewControls {...baseProps} cameraAlwaysOn />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('button', { name: 'practice.flow.controls.camera' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'practice.flow.controls.mic' })).toBeInTheDocument();
  });
});
