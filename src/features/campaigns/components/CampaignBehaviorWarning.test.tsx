/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampaignBehaviorWarning } from './CampaignBehaviorWarning';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('CampaignBehaviorWarning — non-blocking 5-second notice', () => {
  it('hiển thị warning đỏ, không có button và tự biến mất sau 5 giây', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<CampaignBehaviorWarning kind="paste" onDismiss={onDismiss} />);

    const notice = screen.getByRole('status');
    expect(notice).toHaveClass('pointer-events-none', 'backdrop-blur-md');
    expect(screen.getByText('campaigns.violation.title')).toHaveClass('text-error');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(4_999));
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('không render khi không có behavior signal', () => {
    render(<CampaignBehaviorWarning kind={null} onDismiss={vi.fn()} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
