// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PracticeSeniorityStep } from './PracticeSeniorityStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const baseProps = {
  value: null,
  onSelect: vi.fn(),
  onBack: vi.fn(),
  onNext: vi.fn(),
};

const LEVELS = ['fresher', 'junior', 'middle', 'senior'] as const;

const nextButton = () => screen.getByRole('button', { name: 'practice.wizard.next' });

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('PracticeSeniorityStep', () => {
  it('không tiền chọn mức nào khi ứng viên chưa chọn', () => {
    render(<PracticeSeniorityStep {...baseProps} />);

    const pressed = screen
      .getAllByRole('button')
      .filter((button) => button.getAttribute('aria-pressed') === 'true');

    expect(pressed).toHaveLength(0);
  });

  it('khoá nút đi tiếp khi chưa chọn trình độ', () => {
    render(<PracticeSeniorityStep {...baseProps} />);

    expect(nextButton()).toBeDisabled();
  });

  it('mở nút đi tiếp sau khi đã chọn trình độ', () => {
    render(<PracticeSeniorityStep {...baseProps} value="Senior" />);

    expect(nextButton()).toBeEnabled();
  });

  it('báo đúng trình độ ứng viên bấm', async () => {
    const onSelect = vi.fn();
    render(<PracticeSeniorityStep {...baseProps} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button', { name: /practice\.wizard\.level\.senior/ }));

    expect(onSelect).toHaveBeenCalledWith('Senior');
  });

  it('mỗi mức kèm một dòng mô tả — chọn mù thì không biết mình đang đổi cái gì', () => {
    render(<PracticeSeniorityStep {...baseProps} />);

    for (const level of LEVELS) {
      expect(screen.getByText(`practice.wizard.level.${level}`)).toBeInTheDocument();
      expect(screen.getByText(`practice.wizard.level.${level}.desc`)).toBeInTheDocument();
    }
  });

  it('vẫn khoá nút đi tiếp khi đang tạo buổi luyện', () => {
    render(<PracticeSeniorityStep {...baseProps} value="Middle" disabled />);

    expect(nextButton()).toBeDisabled();
  });
});
