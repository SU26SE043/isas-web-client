// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FocusSummaryTile } from './FocusSummaryTile';
import { SessionSummaryCard } from './SessionSummaryCard';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' }),
}));

function makeView(over: Partial<PracticeSessionResultViewModel>): PracticeSessionResultViewModel {
  return {
    id: 's1',
    title: 'BE',
    status: 'Scored',
    maxScore: 100,
    answeredCount: 3,
    skippedCount: 0,
    totalQuestions: 3,
    strengths: [],
    improvements: [],
    nextSteps: [],
    criteria: [],
    questions: [],
    hasResult: true,
    focusTrackingEnabled: false,
    focusEvents: null,
    ...over,
  };
}

describe('FocusSummaryTile — ba trạng thái D6 (null ≠ [] ≠ có sự kiện)', () => {
  it('null (buổi không theo dõi) → KHÔNG render gì', () => {
    const { container } = render(<FocusSummaryTile view={makeView({ focusEvents: null })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('[] (bật, chưa ghi nhận) → ×0 + câu rỗng, không khen', () => {
    render(<FocusSummaryTile view={makeView({ focusTrackingEnabled: true, focusEvents: [], focusLeaveCount: 0 })} />);
    expect(screen.getByText('×0')).toBeInTheDocument();
    expect(screen.getByText('practice.result.focusTracking.empty')).toBeInTheDocument();
  });

  it('có sự kiện → tổng gộp một số + câu gợi ý kèm vị trí', () => {
    render(
      <FocusSummaryTile
        view={makeView({
          focusTrackingEnabled: true,
          focusEvents: [
            { signalType: 'tab_switch', count: 3, firstAt: '2026-09-15T04:00:00Z', lastAt: '2026-09-15T04:10:00Z' },
            { signalType: 'focus_lost', count: 1, firstAt: '2026-09-15T04:05:00Z', lastAt: '2026-09-15T04:05:00Z' },
          ],
          focusLeaveCount: 4,
          focusLeavePlacement: 'secondHalf',
        })}
      />,
    );
    expect(screen.getByText('×4')).toBeInTheDocument();
    expect(screen.queryByText(/tab_switch|focus_lost/)).not.toBeInTheDocument();
    expect(screen.getByText(/practice\.result\.focusTracking\.message/)).toBeInTheDocument();
  });

  it('chỉ có khung hình → ô "Rời khỏi buổi" ×0 và câu khung hình, KHÔNG phải câu rời buổi/đóng tab', () => {
    // File này không cleanup giữa các test ⇒ scope vào container để "×0" của test trước không khớp nhầm.
    const { container } = render(
      <FocusSummaryTile
        view={makeView({
          focusTrackingEnabled: true,
          focusEvents: [
            { signalType: 'no_face', count: 12, firstAt: '2026-09-15T04:00:00Z', lastAt: '2026-09-15T04:10:00Z' },
          ],
          focusLeaveCount: 0,
          focusFrameCount: 12,
        })}
      />,
    );
    expect(within(container).getByText('×0')).toBeInTheDocument();
    expect(within(container).getByText('practice.result.focusTracking.frameOnly')).toBeInTheDocument();
    expect(within(container).queryByText(/practice\.result\.focusTracking\.message/)).not.toBeInTheDocument();
  });
});

describe('SessionSummaryCard — lưới thống kê', () => {
  it('buổi không theo dõi giữ ĐÚNG 3 cột như trước (không hụt cột)', () => {
    const { container } = render(<SessionSummaryCard view={makeView({ focusEvents: null })} />);
    expect(container.querySelector('.sm\\:grid-cols-3')).not.toBeNull();
    expect(container.querySelector('.sm\\:grid-cols-4')).toBeNull();
  });

  it('buổi có theo dõi mở 4 cột cho ô thứ tư', () => {
    const { container } = render(
      <SessionSummaryCard view={makeView({ focusTrackingEnabled: true, focusEvents: [], focusLeaveCount: 0 })} />,
    );
    expect(container.querySelector('.sm\\:grid-cols-4')).not.toBeNull();
  });
});
