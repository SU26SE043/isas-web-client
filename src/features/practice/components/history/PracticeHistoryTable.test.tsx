// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PracticeHistoryTable } from './PracticeHistoryTable';
import type { PracticeSessionHistoryItem } from '../../types/history.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' }),
}));

function session(overrides: Partial<PracticeSessionHistoryItem> = {}): PracticeSessionHistoryItem {
  return {
    id: 'session-1',
    status: 'Scored',
    jobCategory: 'BE',
    createdAt: '2026-08-20T07:00:00Z',
    completedAt: '2026-08-20T07:20:00Z',
    overallScore: 70,
    seniority: 'Junior',
    lessonTitle: null,
    ...overrides,
  };
}

function renderTable(items: PracticeSessionHistoryItem[]) {
  return render(
    <PracticeHistoryTable items={items} onViewResult={() => {}} onResume={() => {}} />,
  );
}

/** Bảng render hai lần (desktop + thẻ mobile) nên mỗi nhãn xuất hiện 2 lần — đọc bản đầu. */
function desktopRow() {
  return within(screen.getAllByRole('row')[1]);
}

afterEach(cleanup);

/**
 * 🔴 Ca thật (23/08): cột tiêu đề lấy thẳng `jobCategory`, nên buổi sinh từ bài học và buổi luyện
 * tự do CÙNG ngành hiện y hệt nhau — đúng một chữ "BE". Người dùng vừa học xong một bài mở Lịch sử
 * ra không có cách nào nhận ra buổi đó, và hai loại buổi khác hẳn nhau về ý nghĩa bị trộn làm một.
 */
describe('PracticeHistoryTable — nhãn nguồn buổi luyện', () => {
  it('buổi sinh từ bài học: lấy TÊN BÀI làm tiêu đề và nói rõ là theo lộ trình', () => {
    renderTable([session({ lessonTitle: 'Hiểu rõ HTTP Methods' })]);

    const row = desktopRow();
    expect(row.getByText('Hiểu rõ HTTP Methods')).toBeInTheDocument();
    expect(row.getByText(/practice\.history\.source\.lesson/)).toBeInTheDocument();
  });

  it('buổi luyện tự do: giữ tên ngành và nói rõ là luyện tự do', () => {
    renderTable([session({ lessonTitle: null })]);

    const row = desktopRow();
    expect(row.getByText('BE')).toBeInTheDocument();
    expect(row.getByText('practice.history.source.free')).toBeInTheDocument();
  });

  // Vế quyết định: trước bản này hai dòng dưới đây hiện GIỐNG HỆT nhau.
  it('hai buổi cùng ngành khác nguồn KHÔNG còn hiện giống nhau', () => {
    renderTable([
      session({ id: 'a', lessonTitle: 'Ôn tập OOP', jobCategory: 'BE' }),
      session({ id: 'b', lessonTitle: null, jobCategory: 'BE' }),
    ]);

    const rows = screen.getAllByRole('row');
    const lesson = within(rows[1]);
    const free = within(rows[2]);
    expect(lesson.getByText('Ôn tập OOP')).toBeInTheDocument();
    expect(lesson.getByText(/practice\.history\.source\.lesson/)).toBeInTheDocument();
    expect(free.getByText('practice.history.source.free')).toBeInTheDocument();
    expect(free.queryByText(/practice\.history\.source\.lesson/)).not.toBeInTheDocument();
  });

  it('buổi bài học vẫn giữ được ngành ở dòng phụ — đổi tiêu đề không được làm mất thông tin cũ', () => {
    renderTable([session({ lessonTitle: 'Ôn tập OOP', jobCategory: 'BE' })]);

    expect(desktopRow().getByText('practice.history.source.lesson · BE')).toBeInTheDocument();
  });

  it('buổi tự do KHÔNG nhắc lại ngành ở dòng phụ (tiêu đề đã là ngành)', () => {
    renderTable([session({ lessonTitle: null, jobCategory: 'BE' })]);

    expect(desktopRow().queryByText(/· BE/)).not.toBeInTheDocument();
  });

  it('không có cả tên bài lẫn ngành ⇒ vẫn có nhãn thay thế, không phải ô trống', () => {
    renderTable([session({ lessonTitle: null, jobCategory: '   ' })]);

    expect(desktopRow().getByText('practice.history.unknownCategory')).toBeInTheDocument();
  });

  it('tên bài toàn khoảng trắng ⇒ xử như buổi tự do, không phải bài học tên rỗng', () => {
    renderTable([session({ lessonTitle: '   ', jobCategory: 'FE' })]);

    const row = desktopRow();
    expect(row.getByText('FE')).toBeInTheDocument();
    expect(row.getByText('practice.history.source.free')).toBeInTheDocument();
  });

  it('thẻ mobile nói cùng một điều với bảng desktop', () => {
    renderTable([session({ lessonTitle: 'Ôn tập OOP' })]);

    // 2 = 1 dòng bảng desktop + 1 thẻ mobile; thiếu một bên nghĩa là một cỡ màn hình bị bỏ sót.
    expect(screen.getAllByText('Ôn tập OOP')).toHaveLength(2);
    expect(screen.getAllByText('practice.history.source.lesson · BE')).toHaveLength(2);
  });
});

/**
 * Ba lỗi người dùng chụp màn hình gửi về (23/08).
 */
describe('PracticeHistoryTable — trạng thái và thời lượng', () => {
  // L1
  it('header cột dùng tiêu đề "Trạng thái", KHÔNG dùng nhãn của ô lọc', () => {
    renderTable([session()]);

    expect(
      screen.getByRole('columnheader', { name: 'practice.history.columns.status' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: 'practice.history.filterStatus' }),
    ).not.toBeInTheDocument();
  });

  // L2 — ca chụp màn hình: chuỗi máy `SessionAbandoned` đứng cạnh nhãn đã dịch.
  it('buổi bỏ ngang hiện nhãn đã dịch, KHÔNG in chuỗi máy `SessionAbandoned`', () => {
    renderTable([session({ status: 'SessionAbandoned' })]);

    expect(screen.queryByText('SessionAbandoned')).not.toBeInTheDocument();
    expect(desktopRow().getByText('practice.history.status.sessionAbandoned')).toBeInTheDocument();
  });

  it('trạng thái backend chưa có nhóm cũng không lọt chuỗi máy ra UI', () => {
    renderTable([session({ status: 'GeneratingQuestions' })]);

    expect(screen.queryByText('GeneratingQuestions')).not.toBeInTheDocument();
    expect(
      desktopRow().getByText('practice.history.status.generatingQuestions'),
    ).toBeInTheDocument();
  });

  it('trạng thái thật sự lạ ⇒ nói không biết, không in giá trị máy', () => {
    renderTable([session({ status: 'SomethingBrandNew' })]);

    expect(screen.queryByText('SomethingBrandNew')).not.toBeInTheDocument();
    expect(desktopRow().getByText('practice.history.status.unknown')).toBeInTheDocument();
  });

  // L3 — ca chụp màn hình: buổi bỏ ngang hiện "2 giờ 7 phút" = độ trễ sweeper.
  it('buổi bỏ ngang KHÔNG hiện thời lượng tính từ lúc sweeper đóng buổi', () => {
    renderTable([
      session({
        status: 'SessionAbandoned',
        createdAt: '2026-08-20T18:18:00Z',
        completedAt: '2026-08-20T20:25:00Z',
      }),
    ]);

    const row = desktopRow();
    expect(row.getByText('practice.history.durationUnknown')).toBeInTheDocument();
    expect(row.queryByText(/durationHours|durationMinutes/)).not.toBeInTheDocument();
  });

  it('buổi người dùng tự kết thúc vẫn hiện thời lượng thật', () => {
    renderTable([
      session({
        status: 'Scored',
        createdAt: '2026-08-20T18:00:00Z',
        completedAt: '2026-08-20T18:20:00Z',
      }),
    ]);

    expect(desktopRow().queryByText('practice.history.durationUnknown')).not.toBeInTheDocument();
  });
});
