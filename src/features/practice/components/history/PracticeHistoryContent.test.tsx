// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PracticeHistoryContent } from './PracticeHistoryContent';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' }),
}));

function renderContent(overrides: { hasActiveFilters: boolean }) {
  render(
    <MemoryRouter>
      <PracticeHistoryContent
        isLoading={false}
        isError={false}
        isFetching={false}
        pageItems={[]}
        visibleItems={[]}
        hasActiveFilters={overrides.hasActiveFilters}
        compareMode={false}
        selectedIds={[]}
        pageIndex={1}
        pageSize={5}
        canGoPrevious={false}
        canGoNext={false}
        onRetry={() => {}}
        onClearFilters={() => {}}
        onToggleCompare={() => {}}
        onViewResult={() => {}}
        onResume={() => {}}
        onPrevious={() => {}}
        onNext={() => {}}
        onPageSizeChange={() => {}}
      />
    </MemoryRouter>,
  );
}

afterEach(cleanup);

/**
 * 🔴 Bộ lọc nguồn chạy phía SERVER, nên "lọc không ra gì" làm `pageItems` RỖNG — y hệt ca "người
 * dùng chưa từng luyện buổi nào". Trước bản này nhánh rỗng đầu tiên không hỏi có bộ lọc nào đang
 * bật hay không, nên người có sẵn 3 buổi vừa bấm "Theo lộ trình" sẽ đọc được câu "Bạn chưa có buổi
 * luyện phỏng vấn nào" kèm nút "Luyện tập mới": vừa nói sai, vừa chỉ sai việc cần làm (thứ họ cần
 * là XOÁ LỌC).
 */
describe('PracticeHistoryContent — trang rỗng vì bộ lọc, không phải vì chưa có dữ liệu', () => {
  it('rỗng KHI ĐANG lọc ⇒ nói "không tìm thấy phiên phù hợp" và mời xoá lọc', () => {
    renderContent({ hasActiveFilters: true });

    expect(screen.getByText('practice.history.emptyFilteredTitle')).toBeInTheDocument();
    expect(screen.getByText('practice.history.clearFilters')).toBeInTheDocument();
    expect(screen.queryByText('practice.history.emptyTitle')).not.toBeInTheDocument();
  });

  it('rỗng khi KHÔNG lọc gì ⇒ mới được nói "bạn chưa có buổi luyện nào"', () => {
    renderContent({ hasActiveFilters: false });

    expect(screen.getByText('practice.history.emptyTitle')).toBeInTheDocument();
    expect(screen.getByText('practice.history.newPractice')).toBeInTheDocument();
    expect(screen.queryByText('practice.history.emptyFilteredTitle')).not.toBeInTheDocument();
  });
});
