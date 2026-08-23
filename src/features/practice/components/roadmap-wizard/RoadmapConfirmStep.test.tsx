import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoadmapConfirmStep } from './RoadmapConfirmStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key: string) => key,
  }),
}));

const baseProps = {
  targetLevel: 'junior' as const,
  currentLevel: 'fresher' as const,
  name: '',
  onNameChange: vi.fn(),
  selectedReports: [],
  focus: '',
  onFocusChange: vi.fn(),
  isSubmitting: false,
  onBack: vi.fn(),
  onConfirm: vi.fn(),
};

function renderStep(overrides: Partial<ComponentProps<typeof RoadmapConfirmStep>> = {}) {
  return render(
    <MemoryRouter>
      <RoadmapConfirmStep
        {...baseProps}
        domain={{ id: 'frontend', name: 'Frontend', nameVi: 'Frontend' } as never}
        cvFiles={[]}
        scope="Quick"
        onScopeChange={vi.fn()}
        onCvChange={vi.fn()}
        cvAnalyses={[]}
        completedRoadmaps={[]}
        {...overrides}
      />
    </MemoryRouter>,
  );
}

const analysis = { id: 'analysis-1', jobCategory: 'FE', createdAt: '2026-01-02T00:00:00Z' } as never;
const priorRoadmap = { id: 'roadmap-1', name: 'Earlier path', nameVi: 'Lộ trình cũ' } as never;

/**
 * F5 — TIỀN ĐỀ ĐẢO CÓ CHỦ ĐÍCH. Bộ test cũ khẳng định bước Xác nhận có hai ô `<select>` để chọn
 * bản phân tích CV và roadmap trước đó, và "forwards selected ids". Nhưng bước 3 ("CV") và bước
 * "Roadmap đã hoàn tất" ĐÃ làm đúng việc đó: hai ô nhập cho CÙNG một giá trị là chỗ đẻ ra mâu
 * thuẫn — chọn ở bước 3, sang Xác nhận thấy "Không chọn" thì không biết cái nào thắng. Giữ test
 * cũ là khoá lại chính cái lỗi này.
 *
 * Bước Xác nhận nay trả lời đúng một câu: "tôi sắp tạo cái gì". Đường sửa vẫn còn nhưng dẫn NGƯỢC
 * về bước sở hữu giá trị.
 */
describe('RoadmapConfirmStep — bản tóm tắt CHỈ ĐỌC', () => {
  afterEach(() => cleanup());

  it('không còn ô nhập nào cho bản phân tích CV và roadmap trước đó', () => {
    renderStep({ cvAnalyses: [analysis], completedRoadmaps: [priorRoadmap] });

    expect(
      screen.queryByRole('combobox', { name: 'practice.roadmapWizard.confirm.cvAnalysis' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'practice.roadmapWizard.confirm.priorRoadmap' }),
    ).not.toBeInTheDocument();
  });

  it('hiện giá trị ĐÃ CHỌN chứ không phải danh sách để chọn lại', () => {
    renderStep({
      cvAnalyses: [analysis],
      cvAnalysisId: 'analysis-1',
      completedRoadmaps: [priorRoadmap],
      priorRoadmapId: 'roadmap-1',
    });

    expect(screen.getByText(/FE/)).toBeInTheDocument();
    expect(screen.getByText('Earlier path')).toBeInTheDocument();
    // Là CHỮ, không phải `<option>`. (Ô chọn quy mô vẫn còn options nên không thể hỏi
    // `queryByRole('option')` trống — phải hỏi đúng hai giá trị này.)
    expect(screen.queryByRole('option', { name: 'Earlier path' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /FE/ })).not.toBeInTheDocument();
  });

  // Ba trạng thái phải khác nhau: đã chọn · có thứ để chọn nhưng chưa chọn · không có gì để chọn.
  it('có thứ để chọn mà chưa chọn ⇒ nói "chưa chọn", kèm đường quay lại bước sở hữu', async () => {
    const user = userEvent.setup();
    const onEditCvAnalysis = vi.fn();
    const onEditPriorRoadmap = vi.fn();

    renderStep({
      cvAnalyses: [analysis],
      completedRoadmaps: [priorRoadmap],
      onEditCvAnalysis,
      onEditPriorRoadmap,
    });

    expect(screen.getAllByText('practice.roadmapWizard.confirm.notSelected')).toHaveLength(2);

    await user.click(
      screen.getByRole('button', {
        name: 'practice.roadmapWizard.confirm.edit: practice.roadmapWizard.confirm.cvAnalysis',
      }),
    );
    await user.click(
      screen.getByRole('button', {
        name: 'practice.roadmapWizard.confirm.edit: practice.roadmapWizard.confirm.priorRoadmap',
      }),
    );

    expect(onEditCvAnalysis).toHaveBeenCalledTimes(1);
    expect(onEditPriorRoadmap).toHaveBeenCalledTimes(1);
  });

  // Không có gì để chọn ⇒ KHÔNG vẽ nút dẫn tới một bước không tồn tại trong `steps`.
  it('không có dữ liệu ⇒ nói rõ là không có, và không có nút Sửa', () => {
    renderStep({
      cvAnalyses: [],
      completedRoadmaps: [],
      onEditCvAnalysis: vi.fn(),
      onEditPriorRoadmap: vi.fn(),
    });

    expect(screen.getByText('practice.roadmapWizard.confirm.cvAnalysisNone')).toBeInTheDocument();
    expect(screen.getByText('practice.roadmapWizard.confirm.priorRoadmapNone')).toBeInTheDocument();
    expect(screen.queryByText('practice.roadmapWizard.confirm.edit')).not.toBeInTheDocument();
  });

  // F1 — hàng "Chế độ lộ trình" đã gỡ khỏi bản tóm tắt. Khoá `practice.roadmapWizard.mode.levelUp`
  // chưa bao giờ tồn tại nên hàng đó hiện thẳng khoá thô; và bản thân khái niệm cũng không còn.
  it('không còn hàng "chế độ lộ trình" trong bản tóm tắt', () => {
    const { container } = renderStep();
    expect(container.innerHTML).not.toContain('roadmapWizard.mode');
    expect(screen.queryByText('practice.roadmapWizard.confirm.mode')).not.toBeInTheDocument();
  });
});

/**
 * F6 — lộ trình sinh ra từ KHOẢNG CÁCH giữa trình độ hiện tại và cấp độ mục tiêu. Bản tóm tắt chỉ
 * hiện vế mục tiêu là giấu mất một nửa dữ kiện quyết định nội dung.
 */
describe('RoadmapConfirmStep — hiện đủ cả hai vế của khoảng cách', () => {
  afterEach(() => cleanup());

  it('hiện trình độ hiện tại bên cạnh cấp độ mục tiêu', () => {
    renderStep({ currentLevel: 'junior', targetLevel: 'senior' });

    expect(screen.getByText('practice.roadmapWizard.confirm.currentLevel')).toBeInTheDocument();
    expect(screen.getByText('practice.roadmapWizard.level.junior')).toBeInTheDocument();
    expect(screen.getByText('practice.roadmapWizard.confirm.level')).toBeInTheDocument();
    expect(screen.getByText('practice.roadmapWizard.level.senior')).toBeInTheDocument();
  });

  // Hai vế phải đọc ra được RIÊNG từng cái. Lấy nhầm biến (hiện tại ↔ mục tiêu) thì hai hàng
  // trùng giá trị mà vẫn "có hiển thị" — đúng kiểu sai không ai để ý.
  it('hai hàng đọc hai giá trị khác nhau, không cùng một biến', () => {
    renderStep({ currentLevel: 'fresher', targetLevel: 'middle' });

    expect(screen.getByText('practice.roadmapWizard.level.fresher')).toBeInTheDocument();
    expect(screen.getByText('practice.roadmapWizard.level.middle')).toBeInTheDocument();
    expect(screen.queryAllByText('practice.roadmapWizard.level.middle')).toHaveLength(1);
  });
});

/**
 * Quy mô là ô NHẬP duy nhất còn lại — có chủ đích: nó không có bước riêng nào khác nên chỉ có MỘT
 * nguồn nhập, không rơi vào lỗi mà F5 sửa. Khoá lại để lần dọn sau không gỡ nhầm mất đường chọn.
 */
describe('RoadmapConfirmStep — quy mô vẫn chọn được tại chỗ', () => {
  afterEach(() => cleanup());

  it('giữ ô chọn quy mô kèm báo giá credit', async () => {
    const user = userEvent.setup();
    const onScopeChange = vi.fn();
    renderStep({ scope: 'Quick', onScopeChange });

    const select = screen.getByRole('combobox', { name: 'practice.roadmapWizard.confirm.scope' });
    await user.selectOptions(select, 'Standard');
    expect(onScopeChange).toHaveBeenCalledWith('Standard');
  });
});
