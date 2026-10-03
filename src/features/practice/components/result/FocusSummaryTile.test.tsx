// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, within } from '@testing-library/react';
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
    const { container } = render(<FocusSummaryTile view={makeView({ focusTrackingEnabled: true, focusEvents: [], focusLeaveCount: 0 })} />);
    expect(within(container).getByText('×0')).toBeInTheDocument();
    expect(within(container).getByTestId('focus-tile-breakdown')).toHaveTextContent('practice.result.focusTracking.empty');
  });

  it('có cả rời buổi lẫn khung hình → tổng gộp + tách nhóm, KHÔNG giấu khuôn mặt / che cam', () => {
    // Trước 2026-10-03 ô này chỉ đếm rời buổi (×1) ⇒ "2 khuôn mặt" và "che cam" không hiện ở đâu trên Tổng quan.
    const { container } = render(
      <FocusSummaryTile
        view={makeView({
          focusTrackingEnabled: true,
          focusEvents: [
            { signalType: 'focus_lost', count: 1, firstAt: '2026-09-15T04:05:00Z', lastAt: '2026-09-15T04:05:00Z' },
            { signalType: 'multiple_faces', count: 2, firstAt: '2026-09-15T04:06:00Z', lastAt: '2026-09-15T04:07:00Z' },
            { signalType: 'camera_blocked', count: 3, firstAt: '2026-09-15T04:08:00Z', lastAt: '2026-09-15T04:09:00Z' },
          ],
          focusLeaveCount: 1,
          focusFrameCount: 5,
        })}
      />,
    );
    expect(within(container).getByText('×6')).toBeInTheDocument();
    const breakdown = within(container).getByTestId('focus-tile-breakdown');
    expect(breakdown).toHaveTextContent('practice.result.focusTracking.short.leave');
    expect(breakdown).toHaveTextContent('practice.result.focusTracking.short.face');
    expect(breakdown).toHaveTextContent('practice.result.focusTracking.short.camera');
  });

  it('chỉ có khung hình → tách nhóm KHÔNG có "rời buổi"', () => {
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
    expect(within(container).getByText('×12')).toBeInTheDocument();
    const breakdown = within(container).getByTestId('focus-tile-breakdown');
    expect(breakdown).toHaveTextContent('practice.result.focusTracking.short.face');
    expect(breakdown).not.toHaveTextContent('practice.result.focusTracking.short.leave');
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
