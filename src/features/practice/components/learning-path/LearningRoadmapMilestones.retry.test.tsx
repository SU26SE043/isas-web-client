import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LearningRoadmapMilestones } from './LearningRoadmapMilestones';
import type { LearningLesson, LearningRoadmapDetail } from '../../types/learningPath.types';

/**
 * Dùng BỘ DỊCH THẬT (không phải `t: (k) => k`) để test đồng thời chứng minh khoá
 * có trong bundle vi: thiếu khoá thì `getTranslation` trả nguyên chuỗi
 * `practice.learningPath.*` ra cho người dùng — hỏng im lặng, không lỗi.
 */
vi.mock('@/shared/languages', async () => {
  const { practiceTranslations } = await import('../../languages/translations');
  return {
    useLanguage: () => ({
      t: (key: string) => practiceTranslations.vi[key] ?? key,
    }),
  };
});

afterEach(cleanup);

function lesson(overrides: Partial<LearningLesson> = {}): LearningLesson {
  return {
    id: 'ls-1',
    title: 'Lesson one',
    titleVi: 'Bài một',
    order: 1,
    theoryStatus: 'completed',
    practiceStatus: 'completed',
    content: '',
    contentVi: '',
    status: 'completed',
    apiStatus: 'Done',
    sessionId: null,
    attemptCount: 1,
    canRetry: true,
    ...overrides,
  };
}

function roadmap(lessons: LearningLesson[], readOnly = false): LearningRoadmapDetail {
  return {
    id: 'rm-1',
    name: 'R', nameVi: 'R',
    domainId: 'be', domainLabel: 'BE', domainLabelVi: 'BE',
    targetLevel: 'junior',
    status: 'in_progress',
    progressPercent: 50,
    currentMilestoneId: 'ms-1', currentMilestoneTitle: 'M', currentMilestoneTitleVi: 'M',
    currentLessonId: 'ls-1', currentLessonTitle: 'L', currentLessonTitleVi: 'L',
    estimatedRemainingHours: 1,
    updatedAt: '2026-08-21T00:00:00Z',
    readOnly,
    milestones: [{
      id: 'ms-1', title: 'M', titleVi: 'M', order: 1,
      status: 'current', progressPercent: 50, lessons,
    }],
    reports: [],
  };
}

type Props = Parameters<typeof LearningRoadmapMilestones>[0];

function renderList(detail: LearningRoadmapDetail, props: Partial<Props> = {}) {
  const onRetryPractice = vi.fn();
  render(
    <MemoryRouter>
      <LearningRoadmapMilestones
        roadmap={detail}
        language="vi"
        launchingLessonId={null}
        onOpenPractice={vi.fn()}
        onRetryPractice={onRetryPractice}
        {...props}
      />
    </MemoryRouter>,
  );
  return { onRetryPractice };
}

const RETRY = /Làm lại bài/;

describe('LearningRoadmapMilestones — nút làm lại bài', () => {
  it('hiện nút khi server nói canRetry=true', () => {
    renderList(roadmap([lesson()]));
    expect(screen.getByRole('button', { name: RETRY })).toBeInTheDocument();
  });

  it('KHÔNG hiện nút khi server nói canRetry=false, dù bài đã Done', () => {
    // Chốt chặn quan trọng nhất: nút bám `canRetry` của SERVER, không bám
    // `apiStatus === 'Done'`. Suy ở FE thì hai bên lệch nhau ngay lần đổi luật
    // đầu tiên, triệu chứng là nút hiện ra rồi bấm vào báo lỗi.
    renderList(roadmap([lesson({ canRetry: false })]));
    expect(screen.queryByRole('button', { name: RETRY })).not.toBeInTheDocument();
  });

  it('HIỆN nút khi server nói canRetry=true dù bài chưa Done', () => {
    renderList(roadmap([lesson({
      canRetry: true, apiStatus: 'Theory', practiceStatus: 'locked', status: 'not_started',
    })]));
    expect(screen.getByRole('button', { name: RETRY })).toBeInTheDocument();
  });

  it('báo giá 1 credit NGAY trên nút, không đợi server trả 402', () => {
    renderList(roadmap([lesson()]));
    expect(screen.getByRole('button', { name: RETRY })).toHaveTextContent('Tốn 1 credit');
  });

  it('bấm nút chỉ báo lên trên (xác nhận nằm ở page, không tự gọi API)', async () => {
    const { onRetryPractice } = renderList(roadmap([lesson()]));
    await userEvent.click(screen.getByRole('button', { name: RETRY }));
    expect(onRetryPractice).toHaveBeenCalledWith('ls-1', 'Bài một');
  });

  it('khoá nút khi buổi luyện lại đang được tạo', async () => {
    const { onRetryPractice } = renderList(roadmap([lesson()]), { retryingLessonId: 'ls-1' });
    const button = screen.getByRole('button', { name: /Đang tạo buổi luyện/ });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onRetryPractice).not.toHaveBeenCalled();
  });

  it('chỉ khoá đúng bài đang chạy, bài khác vẫn bấm được', () => {
    renderList(roadmap([lesson(), lesson({ id: 'ls-2', titleVi: 'Bài hai' })]), {
      retryingLessonId: 'ls-1',
    });
    expect(screen.getByRole('button', { name: RETRY })).toBeEnabled();
  });

  it('hiện đúng SỐ lần đã luyện khi > 1', () => {
    renderList(roadmap([lesson({ attemptCount: 3 })]));
    expect(screen.getByText('Đã luyện 3 lần')).toBeInTheDocument();
  });

  it('KHÔNG hiện số lần khi mới làm 1 lần', () => {
    renderList(roadmap([lesson({ attemptCount: 1 })]));
    expect(screen.queryByText(/Đã luyện/)).not.toBeInTheDocument();
  });

  it('lộ trình chỉ-xem thì không cho làm lại', () => {
    renderList(roadmap([lesson()], true));
    expect(screen.queryByRole('button', { name: RETRY })).not.toBeInTheDocument();
  });
});
