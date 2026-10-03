/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { ReportOverview } from './ReportOverview';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' }),
}));

function makeView(focusEvents: PracticeSessionResultViewModel['focusEvents'], over: Partial<PracticeSessionResultViewModel> = {}): PracticeSessionResultViewModel {
  return {
    id: 's1', title: 'BA', status: 'Scored', maxScore: 100, answeredCount: 2, skippedCount: 0, totalQuestions: 2,
    strengths: [], improvements: [], nextSteps: [], criteria: [], questions: [], hasResult: true,
    focusTrackingEnabled: focusEvents !== null, focusEvents, ...over,
  };
}

afterEach(() => cleanup());

describe('Tab Tổng quan — mục "Mất tập trung trong buổi" hiện thẳng, không cần mở popup', () => {
  it('có sự kiện → mục chi tiết nằm NGAY trong tab, đủ 3 lỗi user làm (rời buổi · 2 khuôn mặt · che cam)', () => {
    render(<ReportOverview view={makeView([
      { signalType: 'focus_lost', count: 1, firstAt: '2026-10-03T02:17:26Z', lastAt: '2026-10-03T02:17:26Z' },
      { signalType: 'multiple_faces', count: 1, firstAt: '2026-10-03T02:17:47Z', lastAt: '2026-10-03T02:17:47Z' },
      { signalType: 'camera_blocked', count: 2, firstAt: '2026-10-03T02:17:14Z', lastAt: '2026-10-03T02:17:30Z' },
    ], { focusLeaveCount: 1, focusFrameCount: 3 })} />);
    const section = screen.getByRole('region', { name: 'practice.result.focusTracking.title' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(within(section).getByTestId('focus-metric-window')).toHaveTextContent(/^01$/);
    expect(within(section).getByTestId('focus-metric-face')).toHaveTextContent(/^01$/);
    expect(within(section).getByTestId('focus-metric-camera')).toHaveTextContent(/^02$/);
    expect(section).toHaveTextContent('practice.result.focusTracking.type.multiple_faces: 1');
    expect(section).toHaveTextContent('practice.result.focusTracking.type.camera_blocked: 2');
  });

  it('null (không theo dõi) và [] (không ghi nhận gì) → KHÔNG có mục chi tiết', () => {
    const { rerender } = render(<ReportOverview view={makeView(null)} />);
    expect(screen.queryByRole('region', { name: 'practice.result.focusTracking.title' })).not.toBeInTheDocument();
    rerender(<ReportOverview view={makeView([])} />);
    expect(screen.queryByRole('region', { name: 'practice.result.focusTracking.title' })).not.toBeInTheDocument();
  });
});
