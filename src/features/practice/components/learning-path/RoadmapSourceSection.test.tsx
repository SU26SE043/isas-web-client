import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { RoadmapSourceSection } from './RoadmapSourceSection';

const t = (key: string) =>
  key === 'practice.learningPath.sourceSessionScore' ? '{score} điểm' : key;

describe('RoadmapSourceSection', () => {
  afterEach(cleanup);

  // Lỗi đo trên prod 2026-10-04: mọi ô in "Ngày phiên luyện chưa có" dù buổi có ngày thật. Nay mỗi
  // ô có ngày giờ đã định dạng + tên bài (hoặc "buổi luyện tự do") + điểm.
  it('hiện ngày giờ đã định dạng, tên bài và điểm của từng buổi nguồn', () => {
    render(
      <RoadmapSourceSection
        language="vi"
        t={t}
        resolvedFrom={{
          baselineAvailable: true,
          scope: '',
          sessions: [
            { id: 's-1', date: '2026-10-04T10:44:55Z', score: 41.2, lessonTitle: 'DML cơ bản' },
            { id: 's-2', date: '2026-09-17T07:02:10Z', score: null, lessonTitle: null },
          ],
        }}
      />,
    );

    const items = screen.getAllByTestId('roadmap-source-session');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent(/4\/10\/26/);
    expect(items[0]).not.toHaveTextContent('2026-10-04T');           // không in chuỗi ISO thô
    expect(items[0]).toHaveTextContent('DML cơ bản · 41.2 điểm');
    expect(items[1]).toHaveTextContent(/17\/9\/26/);
    expect(items[1]).toHaveTextContent('practice.learningPath.sourceSessionFree');
    expect(items[1]).not.toHaveTextContent('điểm');
    expect(screen.queryByText('practice.learningPath.sourceSessionDateUnavailable')).not.toBeInTheDocument();
  });

  it('BE cũ chỉ trả id trần ⇒ nói thật là chưa có ngày', () => {
    render(
      <RoadmapSourceSection
        language="vi"
        t={t}
        resolvedFrom={{ baselineAvailable: true, scope: '', sessions: [{ id: 's-9', date: null, score: null, lessonTitle: null }] }}
      />,
    );
    expect(screen.getByText('practice.learningPath.sourceSessionDateUnavailable')).toBeInTheDocument();
  });
});
