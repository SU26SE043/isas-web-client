// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LearningRoadmapCardView } from './LearningRoadmapCardView';
import type { LearningRoadmapCard } from '../../types/learningPath.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => key }),
}));

/** Đúng độ dài thực tế của tên do AI sinh — tên ngắn thì bài test không chứng minh được gì. */
const LONG_NAME = 'Lộ trình Frontend nâng cao: tối ưu re-render, quản lý state phía máy chủ và kiểm thử giao diện';
const LONG_MILESTONE = 'Hiểu vòng đời component và các bẫy re-render thường gặp trong React';
const LONG_LESSON = 'Phân biệt useMemo, useCallback và React.memo — dùng khi nào cho đúng';

const roadmap: LearningRoadmapCard = {
  id: 'r1',
  name: LONG_NAME,
  nameVi: LONG_NAME,
  domainId: 'fe',
  domainLabel: 'Frontend',
  domainLabelVi: 'Lập trình Frontend',
  targetLevel: 'junior',
  status: 'in_progress',
  progressPercent: 40,
  currentMilestoneId: 'm1',
  currentMilestoneTitle: LONG_MILESTONE,
  currentMilestoneTitleVi: LONG_MILESTONE,
  currentLessonId: 'l1',
  currentLessonTitle: LONG_LESSON,
  currentLessonTitleVi: LONG_LESSON,
  estimatedRemainingHours: 5,
  updatedAt: '2026-08-01T00:00:00Z',
  readOnly: false,
} as LearningRoadmapCard;

function renderCard() {
  return render(
    <MemoryRouter>
      <LearningRoadmapCardView roadmap={roadmap} />
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe('LearningRoadmapCardView — chữ dài không được mất hẳn', () => {
  it('tên lộ trình luôn tra lại được đầy đủ qua tooltip', () => {
    renderCard();
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('title', LONG_NAME);
  });

  it('tên mốc và tên bài hiện tại cũng có tooltip đầy đủ', () => {
    renderCard();
    expect(screen.getByText(LONG_MILESTONE)).toHaveAttribute('title', LONG_MILESTONE);
    expect(screen.getByText(LONG_LESSON)).toHaveAttribute('title', LONG_LESSON);
  });

  it('KHÔNG cắt còn một dòng: chữ dài phải được nới 2 dòng thay vì `truncate`', () => {
    const { container } = renderCard();
    // `truncate` = overflow-hidden + text-overflow ellipsis + nowrap ⇒ mất chữ không dấu vết.
    expect(container.querySelector('.truncate.text-xl')).toBeNull();
    expect(screen.getByRole('heading', { level: 2 }).className).toContain('line-clamp-2');
    expect(screen.getByText(LONG_MILESTONE).className).toContain('line-clamp-2');
  });

  it('dòng phụ (lĩnh vực · cấp độ) tuy vẫn một dòng nhưng phải có tooltip', () => {
    renderCard();
    const subtitle = screen.getByText(/Lập trình Frontend/);
    expect(subtitle.getAttribute('title')).toContain('Lập trình Frontend');
  });

  // F1 — "chế độ lộ trình" KHÔNG còn là khái niệm người dùng thấy: ôn tập và nâng trình đã gộp
  // thành một bản trộn. Hai khoá `practice.roadmapWizard.mode.reinforce|levelUp` chưa bao giờ tồn
  // tại trong `translations.ts`, nên thẻ hiện thẳng khoá thô cho người dùng
  // (`Backend Developer · practice.roadmapWizard.mode.l…`). `check:i18n` KHÔNG bắt được vì nó chỉ
  // so cân bằng vi/en chứ không kiểm khoá có tồn tại.
  //
  // `t` bị mock thành hàm đồng nhất, nên còn gọi `t('practice.roadmapWizard.mode.…')` là chuỗi đó
  // nằm nguyên trong DOM ⇒ phép kiểm này bắt được cả trường hợp ai đó thêm lại khoá dịch.
  it('không nhắc tới chế độ lộ trình ở bất kỳ đâu trên thẻ', () => {
    const { container } = renderCard();
    expect(container.textContent ?? '').not.toContain('roadmapWizard.mode');
    expect(container.innerHTML).not.toContain('roadmapWizard.mode');
  });
});
