/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { B2cInterviewControls } from './B2cInterviewControls';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

afterEach(() => cleanup());

const baseProps = {
  micEnabled: true,
  cameraEnabled: true,
  onToggleMic: vi.fn(),
  onToggleCamera: vi.fn(),
  onFinish: vi.fn(),
  finishLabel: 'Kết thúc',
};

describe('B2cInterviewControls — allowEarlyFinish', () => {
  it('does not render the finish button when neither finishPrimary nor allowEarlyFinish is set (B2B default)', () => {
    render(<B2cInterviewControls {...baseProps} finishPrimary={false} />);
    expect(screen.queryByRole('button', { name: 'Kết thúc' })).not.toBeInTheDocument();
  });

  it('shows the finish button when allowEarlyFinish is true, even with finishPrimary=false', () => {
    render(<B2cInterviewControls {...baseProps} finishPrimary={false} allowEarlyFinish />);
    expect(screen.getByRole('button', { name: 'Kết thúc' })).toBeInTheDocument();
  });

  it('finishDisabled=false enables Finish even when disabled=true (bấm được lúc AI đang đọc câu)', () => {
    render(
      <B2cInterviewControls
        {...baseProps}
        finishPrimary={false}
        allowEarlyFinish
        disabled
        finishDisabled={false}
      />,
    );
    const finishButton = screen.getByRole('button', { name: 'Kết thúc' });
    expect(finishButton).not.toBeDisabled();
    // Mic vẫn khoá — chỉ nút Kết thúc được cởi trói.
    expect(screen.getByLabelText('practice.flow.controls.mic')).toBeDisabled();
  });

  it('falls back to `disabled` when finishDisabled is not provided', () => {
    render(<B2cInterviewControls {...baseProps} finishPrimary allowEarlyFinish disabled />);
    expect(screen.getByRole('button', { name: 'Kết thúc' })).toBeDisabled();
  });

  it('does not render allowEarlyFinish button for B2B usage that never passes the prop', () => {
    render(
      <B2cInterviewControls
        {...baseProps}
        finishPrimary={false}
        onSubmitAnswer={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Kết thúc' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'practice.room.submitAnswer' })).toBeInTheDocument();
  });
});
