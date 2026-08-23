import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoadmapReportsTable } from './RoadmapReportsTable';
import type { InterviewHistoryItem } from '../../types/history.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => key }),
}));

afterEach(cleanup);

/**
 * 🔴 Ca thật (23/08): mọi buổi cùng một ngành hiện cùng chữ "BE" ở cột Tiêu đề, người dùng không
 * biết mình đang tick buổi nào. API không trả tên buổi ⇒ dùng mốc giờ có sẵn để tách.
 */
function makeReport(overrides: Partial<InterviewHistoryItem>): InterviewHistoryItem {
  return {
    id: 'a',
    jobTitle: 'BE',
    company: '',
    date: '2026-08-20T07:32:00Z',
    status: 'completed',
    overallScore: 0,
    duration: 2,
    domainId: 'backend',
    level: 'fresher',
    ...overrides,
  };
}

const handlers = { onToggle: vi.fn(), onSelectAll: vi.fn(), onUnselectAll: vi.fn() };

describe('RoadmapReportsTable — hai buổi cùng ngành phải phân biệt được', () => {
  it('mỗi dòng có mốc giờ riêng, ô tick cũng đọc ra mốc đó', () => {
    render(
      <RoadmapReportsTable
        reports={[
          makeReport({ id: 'a', date: '2026-08-20T07:32:00Z' }),
          makeReport({ id: 'b', date: '2026-08-20T11:05:00Z' }),
        ]}
        selectedIds={[]}
        {...handlers}
      />,
    );

    const rows = screen.getAllByRole('row').slice(1);
    const labels = rows.map((row) => within(row).getByRole('checkbox').getAttribute('aria-label'));
    expect(labels[0]).not.toEqual(labels[1]);
    expect(labels[0]).toContain('BE');
    expect(labels[0]).toMatch(/\d{1,2}:\d{2}/);

    const texts = rows.map((row) => row.textContent ?? '');
    expect(texts[0]).not.toEqual(texts[1]);
  });

  it('thiếu mốc thời gian thì vẫn hiện tiêu đề, không rơi ra "Invalid Date"', () => {
    render(
      <RoadmapReportsTable
        reports={[makeReport({ id: 'a', date: '' })]}
        selectedIds={[]}
        {...handlers}
      />,
    );

    expect(screen.getByRole('checkbox', { name: 'BE' })).toBeInTheDocument();
    expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
  });
});
