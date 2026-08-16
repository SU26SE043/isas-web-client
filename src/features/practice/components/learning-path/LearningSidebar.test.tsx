// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LearningSidebar } from './LearningSidebar';
import type { LearningLesson, LearningRoadmapDetail } from '../../types/learningPath.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => key }),
}));

/**
 * Sidebar rộng 288px (`w-72`), trừ padding còn ~230px — tên bài do AI sinh dài hơn thế là chuyện
 * thường. Fixture phải dùng đúng độ dài thật, tên ngắn thì bài test không chứng minh được gì.
 */
const LONG_LESSON = 'Phân biệt useMemo, useCallback và React.memo — dùng khi nào cho đúng và khi nào là thừa';

const lesson: LearningLesson = {
  id: 'l1',
  title: LONG_LESSON,
  titleVi: LONG_LESSON,
  order: 1,
  theoryStatus: 'available',
  practiceStatus: 'available',
  content: '',
  contentVi: '',
  status: 'in_progress',
} as LearningLesson;

const roadmap: LearningRoadmapDetail = {
  id: 'r1',
  name: 'Lộ trình',
  nameVi: 'Lộ trình',
  milestones: [
    {
      id: 'm1',
      title: 'Mốc 1',
      titleVi: 'Mốc 1',
      order: 1,
      status: 'unlocked',
      progressPercent: 30,
      lessons: [lesson],
    },
  ],
  reports: [],
} as unknown as LearningRoadmapDetail;

afterEach(cleanup);

describe('LearningSidebar — tên bài dài không được mất hẳn', () => {
  it('tên bài luôn tra lại được đầy đủ qua tooltip', () => {
    render(
      <MemoryRouter>
        <LearningSidebar roadmap={roadmap} currentLessonId="l1" />
      </MemoryRouter>,
    );

    expect(screen.getByText(LONG_LESSON)).toHaveAttribute('title', LONG_LESSON);
  });

  it('KHÔNG cắt còn một dòng — trước đây `truncate` cắt và không để lại đường nào đọc phần mất', () => {
    render(
      <MemoryRouter>
        <LearningSidebar roadmap={roadmap} currentLessonId="l1" />
      </MemoryRouter>,
    );

    const title = screen.getByText(LONG_LESSON);
    expect(title.className).toContain('line-clamp-2');
    expect(title.className).not.toContain('truncate');
  });
});
