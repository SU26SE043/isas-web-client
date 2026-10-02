/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampaignViolationDialog } from './CampaignViolationDialog';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

afterEach(cleanup);

function renderDialog(examClockRunning?: boolean) {
  return render(
    <CampaignViolationDialog
      violation={{ kind: 'tab_switch' } as never}
      pendingCount={0}
      recovering={false}
      recoveryError={null}
      examClockRunning={examClockRunning}
      onContinue={vi.fn()}
    />,
  );
}

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
