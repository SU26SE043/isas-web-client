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

    expect(screen.getAllByRole('checkbox', { name: 'BE' })[0]).toBeInTheDocument();
    expect(screen.queryByText(/Invalid Date/i)).not.toBeInTheDocument();
  });
});

describe('RoadmapReportsTable — cột Tiêu đề nói đúng buổi nào là buổi nào', () => {
  it('hiện tên bài học thật thay vì mã ngành', () => {
    render(
      <RoadmapReportsTable
        reports={[
          makeReport({ id: 'a', lessonTitle: 'Truy vấn SQL nâng cao (JOIN, GROUP BY)' }),
          makeReport({ id: 'b', lessonTitle: 'Thiết kế API cho tính năng CRUD' }),
        ]}
        selectedIds={[]}
        {...handlers}
      />,
    );

    expect(screen.getAllByText('Truy vấn SQL nâng cao (JOIN, GROUP BY)')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Thiết kế API cho tính năng CRUD')[0]).toBeInTheDocument();
    // Ô tick cũng phải đọc ra tên bài — người dùng màn hình đọc nếu chỉ nghe "BE" thì vẫn mù.
    const rows = screen.getAllByRole('row').slice(1);
    expect(within(rows[0]).getByRole('checkbox').getAttribute('aria-label')).toContain('Truy vấn SQL');
  });

  // 🔑 Ranh giới trung thực: buổi luyện tự do KHÔNG có tên thật, nhãn ghép phải NHÌN RA được là
  // nhãn ghép. Trình bày nó y như tên một bài học là nói dối về nguồn gốc dòng đó.
  it('buổi luyện tự do được đánh dấu, không bị bịa thành tên bài học', () => {
    const { container } = render(
      <RoadmapReportsTable
        reports={[makeReport({ id: 'free', lessonTitle: null })]}
        selectedIds={[]}
        {...handlers}
      />,
    );

    const label = screen.getAllByText(/practice\.roadmapWizard\.reports\.freePractice/)[0];
    expect(label).toBeInTheDocument();
    expect(label.className).toContain('italic');
    expect(container.textContent).toContain('BE');
  });

  it('hai buổi — một có tên bài, một tự do — không hiện giống nhau', () => {
    render(
      <RoadmapReportsTable
        reports={[
          makeReport({ id: 'a', lessonTitle: 'Truy vấn SQL nâng cao' }),
          makeReport({ id: 'b', lessonTitle: null }),
        ]}
        selectedIds={[]}
        {...handlers}
      />,
    );

    const rows = screen.getAllByRole('row').slice(1);
    const labels = rows.map((row) => within(row).getByRole('checkbox').getAttribute('aria-label'));
    expect(labels[0]).not.toEqual(labels[1]);
  });
});
