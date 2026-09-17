/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { B2cPracticeRoomModals } from './B2cPracticeRoomModals';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) =>
      ({
        'practice.finish.confirmDescription': 'CONFIRM_DESCRIPTION',
        'practice.finish.earlySummary': 'EARLY answered={answered} total={total} remaining={remaining}',
        'practice.finish.earlySummaryAllAnswered': 'EARLY_ALL answered={answered}',
        'practice.finish.submittedCount': 'submitted={count}',
        'practice.finish.unansweredCount': 'unanswered={count}',
        'practice.finish.pendingRecording': 'PENDING_RECORDING',
      })[key] ?? key,
  }),
}));

afterEach(() => cleanup());

const baseProps = {
  finishOpen: true,
  isSubmittingSession: false,
  submittedCount: 3,
  unansweredCount: 2,
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

describe('B2cPracticeRoomModals — earlyFinish copy', () => {
  it('B2B / normal finish keeps the old description + submitted/unanswered lines', () => {
    render(<B2cPracticeRoomModals {...baseProps} />);
    expect(screen.getByText('CONFIRM_DESCRIPTION')).toBeInTheDocument();
    expect(screen.getByText('submitted=3')).toBeInTheDocument();
    expect(screen.getByText('unanswered=2')).toBeInTheDocument();
    expect(screen.queryByText(/^EARLY/)).not.toBeInTheDocument();
  });

  it('early finish with remaining questions shows the consequence sentence, not the old counts', () => {
    render(
      <B2cPracticeRoomModals
        {...baseProps}
        earlyFinish
        answeredCount={3}
        totalCount={5}
        remainingCount={2}
      />,
    );
    expect(screen.getByText('EARLY answered=3 total=5 remaining=2')).toBeInTheDocument();
    expect(screen.queryByText('submitted=3')).not.toBeInTheDocument();
    expect(screen.queryByText('CONFIRM_DESCRIPTION')).not.toBeInTheDocument();
  });

  it('early finish with everything answered uses the all-answered sentence', () => {
    render(
      <B2cPracticeRoomModals
        {...baseProps}
        earlyFinish
        answeredCount={5}
        totalCount={5}
        remainingCount={0}
      />,
    );
    expect(screen.getByText('EARLY_ALL answered=5')).toBeInTheDocument();
  });

  it('keeps the pending-recording notice visible even under earlyFinish', () => {
    render(
      <B2cPracticeRoomModals
        {...baseProps}
        hasPendingRecording
        earlyFinish
        answeredCount={1}
        totalCount={3}
        remainingCount={2}
      />,
    );
    expect(screen.getByText('PENDING_RECORDING')).toBeInTheDocument();
  });
});
