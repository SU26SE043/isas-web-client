// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { B2cInterviewControls } from './B2cInterviewControls';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const baseProps = {
  micEnabled: true,
  cameraEnabled: true,
  onToggleMic: vi.fn(),
  onToggleCamera: vi.fn(),
  onFinish: vi.fn(),
  finishLabel: 'Kết thúc',
};

describe('B2cInterviewControls', () => {
  it('renders no finish button when neither finishPrimary nor allowEarlyFinish is set', () => {
    render(<B2cInterviewControls {...baseProps} />);
    expect(screen.queryByRole('button', { name: 'Kết thúc' })).not.toBeInTheDocument();
  });

  it('renders a filled primary finish button when finishPrimary', () => {
    render(<B2cInterviewControls {...baseProps} finishPrimary />);
    const button = screen.getByRole('button', { name: 'Kết thúc' });
    expect(button).toHaveClass('btn-primary');
  });

  it('renders a red outline early-finish button when allowEarlyFinish alone', () => {
    render(<B2cInterviewControls {...baseProps} allowEarlyFinish />);
    const button = screen.getByRole('button', { name: 'Kết thúc' });
    expect(button).not.toHaveClass('btn-primary');
    expect(button.className).toContain('text-error-300');
  });

  it('uses finishDisabled to override disabled for the finish button only', () => {
    render(<B2cInterviewControls {...baseProps} allowEarlyFinish disabled={false} finishDisabled />);
    expect(screen.getByRole('button', { name: 'Kết thúc' })).toBeDisabled();
    expect(screen.getByLabelText('practice.flow.controls.mic')).not.toBeDisabled();
  });

  it('falls back to disabled when finishDisabled is not provided', () => {
    render(<B2cInterviewControls {...baseProps} finishPrimary disabled />);
    expect(screen.getByRole('button', { name: 'Kết thúc' })).toBeDisabled();
  });
});
