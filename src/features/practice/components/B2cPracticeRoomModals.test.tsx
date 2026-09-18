// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { B2cPracticeRoomModals } from './B2cPracticeRoomModals';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'practice.finish.confirmDescription': 'Các câu chưa trả lời có thể nhận 0 điểm.',
        'practice.finish.earlySummary': 'Bạn đã trả lời {answered}/{total} câu. Còn {remaining} câu chưa trả lời.',
        'practice.finish.earlySummaryAllAnswered': 'Bạn đã trả lời hết các câu hỏi.',
        'practice.finish.submittedCount': 'Đã nộp: {count}',
        'practice.finish.unansweredCount': 'Chưa trả lời: {count}',
      };
      return map[key] ?? key;
    },
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const baseProps = {
  finishOpen: true,
  isSubmittingSession: false,
  submittedCount: 2,
  unansweredCount: 3,
  hasPendingRecording: false,
  onCloseFinish: vi.fn(),
  onConfirmFinish: vi.fn(),
  overwriteConfirmOpen: false,
  onCloseOverwrite: vi.fn(),
  onConfirmOverwrite: vi.fn(),
  retryConfirmOpen: false,
  onCloseRetry: vi.fn(),
  onConfirmRetry: vi.fn(),
};

describe('B2cPracticeRoomModals — finish dialog', () => {
  it('shows the normal description and both counts when not early finish', () => {
    render(<B2cPracticeRoomModals {...baseProps} />);
    expect(screen.getByText('Các câu chưa trả lời có thể nhận 0 điểm.')).toBeInTheDocument();
    expect(screen.getByText('Đã nộp: 2')).toBeInTheDocument();
    expect(screen.getByText('Chưa trả lời: 3')).toBeInTheDocument();
  });

  it('shows the early-finish description with remaining count when finishing early with questions left', () => {
    render(
      <B2cPracticeRoomModals {...baseProps} earlyFinish answeredCount={2} totalCount={5} remainingCount={3} />,
    );
    expect(
      screen.getByText('Bạn đã trả lời 2/5 câu. Còn 3 câu chưa trả lời.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Đã nộp: 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Chưa trả lời: 3')).not.toBeInTheDocument();
  });

  it('shows the all-answered variant when early finish with 0 remaining', () => {
    render(
      <B2cPracticeRoomModals {...baseProps} earlyFinish answeredCount={5} totalCount={5} remainingCount={0} />,
    );
    expect(screen.getByText('Bạn đã trả lời hết các câu hỏi.')).toBeInTheDocument();
  });

  it('still shows the pending-recording line during early finish', () => {
    render(<B2cPracticeRoomModals {...baseProps} earlyFinish hasPendingRecording remainingCount={1} />);
    expect(screen.getByText('practice.finish.pendingRecording')).toBeInTheDocument();
  });
});
