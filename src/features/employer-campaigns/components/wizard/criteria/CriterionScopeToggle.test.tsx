/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CriterionScopeToggle } from './CriterionScopeToggle';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

afterEach(() => {
  cleanup();
});

const K = 'employer.campaigns.wizard.rubric.scope';

describe('CriterionScopeToggle', () => {
  it('vắng scope (chưa qua mapper) ⇒ coi như Always đang được chọn', () => {
    render(<CriterionScopeToggle onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: `${K}.always` })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: `${K}.whenTargeted` })).toHaveAttribute('aria-pressed', 'false');
  });

  it('scope=WhenTargeted ⇒ nút WhenTargeted đang được chọn', () => {
    render(<CriterionScopeToggle scope="WhenTargeted" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: `${K}.always` })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: `${K}.whenTargeted` })).toHaveAttribute('aria-pressed', 'true');
  });

  it('bấm WhenTargeted ⇒ onChange("WhenTargeted"); bấm Always ⇒ onChange("Always")', () => {
    const onChange = vi.fn();
    render(<CriterionScopeToggle scope="Always" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: `${K}.whenTargeted` }));
    expect(onChange).toHaveBeenCalledWith('WhenTargeted');

    fireEvent.click(screen.getByRole('button', { name: `${K}.always` }));
    expect(onChange).toHaveBeenCalledWith('Always');
  });

  it('tooltip giải thích hậu quả có mặt (title trên vùng công tắc)', () => {
    render(<CriterionScopeToggle onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: `${K}.always` }).closest('[title]')).toHaveAttribute(
      'title',
      `${K}.hint`,
    );
  });

  it('disabled ⇒ cả hai nút đều tắt, bấm không gọi onChange', () => {
    const onChange = vi.fn();
    render(<CriterionScopeToggle scope="Always" disabled onChange={onChange} />);

    const always = screen.getByRole('button', { name: `${K}.always` });
    const whenTargeted = screen.getByRole('button', { name: `${K}.whenTargeted` });
    expect(always).toBeDisabled();
    expect(whenTargeted).toBeDisabled();

    fireEvent.click(whenTargeted);
    expect(onChange).not.toHaveBeenCalled();
  });
});
