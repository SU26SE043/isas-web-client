/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampaignViolationDialog } from './CampaignViolationDialog';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

afterEach(cleanup);

function renderDialog(examClockRunning?: boolean, onContinue = vi.fn()) {
  return render(
    <CampaignViolationDialog
      violation={{ id: 'violation-1', kind: 'tab_switch' }}
      pendingCount={0}
      recovering={false}
      recoveryError={null}
      examClockRunning={examClockRunning}
      onContinue={onContinue}
    />,
  );
}

describe('CampaignViolationDialog — tự tiếp tục sau 5 giây', () => {
  afterEach(() => vi.useRealTimers());

  it('tự gọi tiếp tục sau đúng 5 giây', () => {
    vi.useFakeTimers();
    const onContinue = vi.fn();
    renderDialog(false, onContinue);

    act(() => vi.advanceTimersByTime(4_999));
    expect(onContinue).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('dùng chrome cảnh báo đỏ và overlay làm mờ nền', () => {
    renderDialog();

    expect(screen.getByRole('dialog')).toHaveClass('border-error/40');
    expect(screen.getByText('campaigns.violation.title')).toHaveClass('text-error');
    expect(screen.queryByRole('button', { name: 'campaigns.violation.continue' })).not.toBeInTheDocument();
    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).not.toBeNull();
    expect(overlay).toHaveClass('bg-white/70');
    expect(overlay).toHaveClass('backdrop-blur-md');
  });
});

describe('CampaignViolationDialog — ATT1-F4 dòng "Đồng hồ bài thi vẫn chạy"', () => {
  it('buổi tính giờ ⇒ có dòng "vẫn chạy"', async () => {
    renderDialog(true);
    expect(await screen.findByText('campaigns.violation.tabSwitch')).toBeInTheDocument();
    expect(screen.getByTestId('exam-clock-still-running')).toHaveTextContent('practice.examClock.stillRunning');
  });

  it('buổi không tính giờ (B2B cũ) ⇒ không có dòng đó', async () => {
    renderDialog(false);
    expect(await screen.findByText('campaigns.violation.tabSwitch')).toBeInTheDocument();
    expect(screen.queryByTestId('exam-clock-still-running')).not.toBeInTheDocument();
  });
});
