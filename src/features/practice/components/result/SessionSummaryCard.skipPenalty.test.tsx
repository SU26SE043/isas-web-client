// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionSummaryCard } from './SessionSummaryCard';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';

// Mock `t` trả TEMPLATE để kiểm cả việc thay placeholder (mock trả key thì đếm sai vẫn xanh —
// bài học FocusEventsButton 2026-09-15).
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) =>
      key === 'practice.result.skipPenaltyApplied'
        ? 'AVG {{before}} × {{answered}}/{{total}} = {{after}}'
        : key === 'practice.result.skipPenaltyNone'
          ? 'FULL {{total}}/{{total}}'
          : key,
    language: 'vi',
  }),
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
  } as PracticeSessionResultViewModel;
}

afterEach(() => cleanup());

describe('SessionSummaryCard — CAMP-21 note', () => {
  it('phạt ⇒ in đúng 80 × 2/3 = 53.3 (số lấy từ skipPenalty, không từ answeredCount)', () => {
    render(
      <SessionSummaryCard
        view={makeView({
          overallScore: 53.33,
          answeredCount: 3,
          totalQuestions: 4,
          skipPenalty: { applied: true, seedAnswered: 2, seedTotal: 3, scoreBefore: 80, scoreAfter: 53.33 },
        })}
      />,
    );
    const note = screen.getByTestId('skip-penalty-note');
    expect(note).toHaveTextContent(/^AVG 80 × 2\/3 = 53\.3$/);
    expect(note.className).toContain('text-warning');
  });

  it('đủ câu chính ⇒ dòng "không bị trừ", không phải màu cảnh báo', () => {
    render(
      <SessionSummaryCard
        view={makeView({
          overallScore: 80,
          skipPenalty: { applied: false, seedAnswered: 3, seedTotal: 3, scoreBefore: 80, scoreAfter: 80 },
        })}
      />,
    );
    const note = screen.getByTestId('skip-penalty-note');
    expect(note).toHaveTextContent(/^FULL 3\/3$/);
    expect(note.className).not.toContain('text-warning');
  });

  it('buổi cũ (không luật) ⇒ không render dòng nào', () => {
    render(<SessionSummaryCard view={makeView({ overallScore: 80, answeredCount: 1, totalQuestions: 3 })} />);
    expect(screen.queryByTestId('skip-penalty-note')).toBeNull();
  });
});
