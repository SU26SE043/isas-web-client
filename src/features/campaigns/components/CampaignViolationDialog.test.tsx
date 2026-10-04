/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampaignViolationDialog } from './CampaignViolationDialog';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

afterEach(cleanup);

function renderDialog(examClockRunning?: boolean, onContinue = vi.fn()) {
  return render(
    <CampaignViolationDialog
      violation={{ id: 'violation-1', kind: 'fullscreen_exit' }}
      pendingCount={0}
      recovering={false}
      recoveryError={null}
      examClockRunning={examClockRunning}
      onContinue={onContinue}
    />,
  );
}

describe('CampaignViolationDialog — blocking violation', () => {
  it('hiển thị nút Continue để ứng viên khắc phục fullscreen', () => {
    renderDialog();

    expect(screen.getByRole('dialog')).toHaveClass('border-error/40');
    expect(screen.getByText('campaigns.violation.title')).toHaveClass('text-error');
    expect(screen.getByRole('button', { name: 'campaigns.violation.continue' })).toBeInTheDocument();
    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).not.toBeNull();
    expect(overlay).toHaveClass('bg-white/70');
    expect(overlay).toHaveClass('backdrop-blur-md');
  });
});

describe('CampaignViolationDialog — ATT1-F4 dòng "Đồng hồ bài thi vẫn chạy"', () => {
  it('buổi tính giờ ⇒ có dòng "vẫn chạy"', async () => {
    renderDialog(true);
    expect(await screen.findByText('campaigns.violation.fullscreenExit')).toBeInTheDocument();
    expect(screen.getByTestId('exam-clock-still-running')).toHaveTextContent('practice.examClock.stillRunning');
  });

  it('buổi không tính giờ (B2B cũ) ⇒ không có dòng đó', async () => {
    renderDialog(false);
    expect(await screen.findByText('campaigns.violation.fullscreenExit')).toBeInTheDocument();
    expect(screen.queryByTestId('exam-clock-still-running')).not.toBeInTheDocument();
  });
});
