import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => key }),
}));

import { MilestoneScoreCriterionRow } from './MilestoneScoreCriterionRow';
import type { MilestoneScoreCriterion } from '../../types/roadmapPractice.api.types';

function criterion(overrides: Partial<MilestoneScoreCriterion> = {}): MilestoneScoreCriterion {
  return {
    name: 'Thuật ngữ chuyên ngành',
    currentAveragePercentage: 44,
    currentSessions: [
      { sessionId: 'c-1', lessonTitle: 'DML cơ bản', attemptNo: 1, percentage: 44, scoredAt: '2026-10-04T10:44:52.216754Z' },
    ],
    referenceAveragePercentage: 10,
    referenceSessions: [
      { sessionId: 'r-1', lessonTitle: '', attemptNo: 1, percentage: 20, scoredAt: '2026-09-15T12:45:35Z' },
      { sessionId: 'r-2', lessonTitle: 'JOIN', attemptNo: 2, percentage: 0, scoredAt: '2026-09-17T07:03:03Z' },
    ],
    deltaPct: 34,
    headlineDeltaPct: null,
    ...overrides,
  };
}

describe('MilestoneScoreCriterionRow', () => {
  afterEach(cleanup);

  it('liệt kê buổi đứng sau mốc ban đầu; ngày giờ định dạng, không in chuỗi ISO thô', () => {
    render(<MilestoneScoreCriterionRow criterion={criterion()} comparedWith="baseline" />);

    expect(screen.queryByText(/2026-10-04T10:44/)).not.toBeInTheDocument();
    expect(screen.getByText(/4\/10\/26/)).toBeInTheDocument();
    // Buổi luyện tự do không có tên bài ⇒ nhãn riêng thay vì ô trống.
    expect(screen.getByText('practice.milestoneReport.freeSession')).toBeInTheDocument();
    expect(screen.getByText('JOIN')).toBeInTheDocument();
    expect(screen.queryByText('practice.milestoneReport.noSessions')).not.toBeInTheDocument();
  });

  // Mốc ban đầu có số mà không đối chiếu được buổi nào (lộ trình cũ) ⇒ KHÔNG nói "chưa có buổi
  // nào được chấm" (sai: số mốc đang hiện ngay bên trên).
  it('mốc ban đầu có số nhưng không có buổi ⇒ câu "không xác định", không phải "chưa chấm"', () => {
    render(<MilestoneScoreCriterionRow criterion={criterion({ referenceSessions: [] })} comparedWith="baseline" />);

    expect(screen.getByText('practice.milestoneReport.baselineSessionsUnknown')).toBeInTheDocument();
    expect(screen.queryByText('practice.milestoneReport.noSessions')).not.toBeInTheDocument();
  });

  it('chặng trước chưa có buổi ⇒ vẫn là "chưa có buổi nào được chấm"', () => {
    render(
      <MilestoneScoreCriterionRow
        criterion={criterion({ referenceSessions: [], referenceAveragePercentage: null, deltaPct: null })}
        comparedWith="previousMilestone"
      />,
    );
    expect(screen.getByText('practice.milestoneReport.noSessions')).toBeInTheDocument();
  });
});
