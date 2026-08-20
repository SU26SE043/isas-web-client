// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PracticeQuestionCountSetupStep } from './PracticeQuestionCountSetupStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const baseProps = {
  value: 5,
  onChange: vi.fn(),
  onBack: vi.fn(),
  onNext: vi.fn(),
  adaptiveEnabled: true,
  onAdaptiveChange: vi.fn(),
  maxDeepPerQuestion: 3,
  onDepthChange: vi.fn(),
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('PracticeQuestionCountSetupStep', () => {
  it('cho tải lại khi không lấy được lựa chọn số câu từ máy chủ', async () => {
    const onRetryOptions = vi.fn();
    render(
      <PracticeQuestionCountSetupStep
        {...baseProps}
        optionsError="session-options-failed"
        onRetryOptions={onRetryOptions}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('practice.setup.questionCount.optionsError');

    await userEvent.click(
      screen.getByRole('button', { name: 'practice.setup.questionCount.retryOptions' }),
    );

    expect(onRetryOptions).toHaveBeenCalledOnce();
  });

  it('khoá nút tải lại trong lúc đang tải', () => {
    render(
      <PracticeQuestionCountSetupStep
        {...baseProps}
        optionsError="session-options-failed"
        isLoadingOptions
        onRetryOptions={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'practice.setup.questionCount.retryOptions' }),
    ).toBeDisabled();
  });
});
