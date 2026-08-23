// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PracticeHistoryToolbar } from './PracticeHistoryToolbar';
import { PRACTICE_SESSION_SOURCE_LABEL_KEYS } from '../../utils/practiceReportLabel';
import type { PracticeHistorySourceFilter } from '../../types/history.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' }),
}));

function renderToolbar(
  overrides: {
    source?: PracticeHistorySourceFilter;
    onSourceChange?: (value: PracticeHistorySourceFilter) => void;
  } = {},
) {
  render(
    <PracticeHistoryToolbar
      search=""
      status="all"
      source={overrides.source ?? 'all'}
      sort="newest"
      isFetching={false}
      compareMode={false}
      onSearchChange={() => {}}
      onStatusChange={() => {}}
      onSourceChange={overrides.onSourceChange ?? (() => {})}
      onSortChange={() => {}}
      onRefresh={() => {}}
      onToggleCompareMode={() => {}}
    />,
  );
}

function sourceSelect() {
  return screen.getByLabelText('practice.history.filterSource') as HTMLSelectElement;
}

afterEach(cleanup);

describe('PracticeHistoryToolbar — ô lọc nguồn buổi luyện', () => {
  it('có đúng ba lựa chọn: tất cả / theo lộ trình / tự do', () => {
    renderToolbar();

    const values = Array.from(sourceSelect().options).map((option) => option.value);
    expect(values).toEqual(['all', 'lesson', 'free']);
  });

  /**
   * Nhãn ô lọc phải là CHÍNH khoá đang hiện trên từng hàng của bảng. Gõ tay một chuỗi khác — dù
   * nghĩa gần giống — bắt người dùng học hai bộ từ vựng cho cùng một khái niệm, và hai chỗ sẽ trôi
   * xa nhau khi một bên được sửa câu chữ.
   */
  it('nhãn lấy đúng khoá i18n mà bảng dùng cho nhãn nguồn của từng hàng', () => {
    renderToolbar();

    const labels = Array.from(sourceSelect().options).map((option) => option.textContent);
    expect(labels).toEqual([
      'practice.history.filters.allSources',
      PRACTICE_SESSION_SOURCE_LABEL_KEYS.lesson,
      PRACTICE_SESSION_SOURCE_LABEL_KEYS.free,
    ]);
  });

  it('chọn "theo lộ trình" ⇒ báo lên đúng giá trị `lesson`', async () => {
    const onSourceChange = vi.fn();
    renderToolbar({ onSourceChange });

    await userEvent.selectOptions(sourceSelect(), 'lesson');

    expect(onSourceChange).toHaveBeenCalledWith('lesson');
  });

  it('chọn "tự do" ⇒ báo lên đúng giá trị `free`', async () => {
    const onSourceChange = vi.fn();
    renderToolbar({ onSourceChange });

    await userEvent.selectOptions(sourceSelect(), 'free');

    expect(onSourceChange).toHaveBeenCalledWith('free');
  });

  it('quay lại "tất cả" ⇒ báo lên `all` (trang sẽ dịch thành KHÔNG gửi `source`)', async () => {
    const onSourceChange = vi.fn();
    renderToolbar({ source: 'lesson', onSourceChange });

    await userEvent.selectOptions(sourceSelect(), 'all');

    expect(onSourceChange).toHaveBeenCalledWith('all');
  });

  it('giá trị đang chọn phản ánh state của trang, không tự giữ state riêng', () => {
    renderToolbar({ source: 'free' });

    expect(sourceSelect().value).toBe('free');
  });

  it('ô lọc trạng thái cũ vẫn còn, không bị ô mới thay chỗ', () => {
    renderToolbar();

    expect(screen.getByLabelText('practice.history.filterStatus')).toBeInTheDocument();
  });
});
