import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoadmapPriorStep } from './RoadmapPriorStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => key }),
}));

afterEach(cleanup);

const nav = { onBack: vi.fn(), onNext: vi.fn(), onChange: vi.fn() };

/**
 * 🔴 Ca thật (23/08): bước "Roadmap đã hoàn tất" hiện trong stepper nhưng dropdown chỉ có "Bỏ qua".
 * Bước này CỐ Ý nằm trong `steps` cả khi danh sách còn đang tải (để stepper không nhảy số), nên
 * "đang tải" và "không có gì" trông y hệt nhau nếu không nói ra.
 */
describe('RoadmapPriorStep phân biệt đang tải với không có dữ liệu', () => {
  it('đang tải: nói rõ đang tải, khoá ô chọn, KHÔNG khẳng định là rỗng', () => {
    render(<RoadmapPriorStep roadmaps={[]} isLoading {...nav} />);

    expect(screen.getByText('practice.roadmapWizard.prior.loading')).toBeInTheDocument();
    expect(screen.queryByText('practice.roadmapWizard.prior.empty')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('tải xong mà rỗng: nói rõ chưa có lộ trình nào, mở lại ô chọn', () => {
    render(<RoadmapPriorStep roadmaps={[]} isLoading={false} {...nav} />);

    expect(screen.getByText('practice.roadmapWizard.prior.empty')).toBeInTheDocument();
    expect(screen.queryByText('practice.roadmapWizard.prior.loading')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeEnabled();
  });

  it('có dữ liệu: liệt kê lộ trình, không hiện chú thích nào trong hai cái trên', () => {
    render(
      <RoadmapPriorStep
        roadmaps={[{ id: '2929e93c', name: 'BE mastery', nameVi: 'Lộ trình BE' }] as never}
        isLoading={false}
        {...nav}
      />,
    );

    expect(screen.getByRole('option', { name: 'Lộ trình BE' })).toBeInTheDocument();
    expect(screen.queryByText('practice.roadmapWizard.prior.empty')).not.toBeInTheDocument();
    expect(screen.queryByText('practice.roadmapWizard.prior.loading')).not.toBeInTheDocument();
  });

  it('luôn giữ nút Quay lại / Tiếp theo kể cả khi đang tải', () => {
    render(<RoadmapPriorStep roadmaps={[]} isLoading {...nav} />);

    // Chặn hẳn điều hướng lúc chờ (spinner phủ cả panel) sẽ nhốt người dùng ~chục giây.
    expect(screen.getByRole('button', { name: 'practice.roadmapWizard.back' })).toBeInTheDocument();
  });
});
