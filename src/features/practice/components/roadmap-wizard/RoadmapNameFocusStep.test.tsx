// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoadmapNameFocusStep } from './RoadmapNameFocusStep';
import { ROADMAP_FOCUS_MAX_CHARS, ROADMAP_NAME_MAX_CHARS } from '../../types/learning.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

afterEach(cleanup);

function renderStep(over: Partial<Parameters<typeof RoadmapNameFocusStep>[0]> = {}) {
  const props = {
    name: '',
    onNameChange: vi.fn(),
    focus: '',
    onFocusChange: vi.fn(),
    onBack: vi.fn(),
    onNext: vi.fn(),
    ...over,
  };
  render(<RoadmapNameFocusStep {...props} />);
  return props;
}

const nextButton = () => screen.getByRole('button', { name: 'practice.roadmapWizard.next' });

// Bước này chỉ có test ở tầng payload trước đó (`buildCreateRoadmapRequest.test.ts`), không có
// test nào chạm giao diện — nên khi hai ô nhập được DỜI từ bước Xác nhận sang đây, toàn bộ suite
// vẫn xanh. Cùng khe đã để lọt ở FE-3 và FE-5: lớp "dữ liệu đúng" có phủ, lớp "người dùng nhập
// được và giá trị đi đúng chỗ" thì không.
describe('bước Tên & mục tiêu', () => {
  it('hiện cả hai ô nhập', () => {
    renderStep();
    expect(screen.getByPlaceholderText('practice.roadmapWizard.confirm.namePlaceholder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('practice.roadmapWizard.confirm.focusPlaceholder')).toBeInTheDocument();
  });

  it('gõ tên thì báo ra ngoài từng ký tự', async () => {
    const user = userEvent.setup();
    const props = renderStep();
    await user.type(screen.getByPlaceholderText('practice.roadmapWizard.confirm.namePlaceholder'), 'Ôn BA');
    expect(props.onNameChange).toHaveBeenCalled();
  });

  it('bỏ trống cả hai vẫn đi tiếp được — cả hai là TUỲ CHỌN', async () => {
    const user = userEvent.setup();
    const props = renderStep();
    expect(nextButton()).toBeEnabled();
    await user.click(nextButton());
    expect(props.onNext).toHaveBeenCalledTimes(1);
  });

  it('tên vượt trần thì khoá nút đi tiếp', () => {
    renderStep({ name: 'x'.repeat(ROADMAP_NAME_MAX_CHARS + 1) });
    expect(nextButton()).toBeDisabled();
  });

  it('tên dài ĐÚNG BẰNG trần vẫn đi tiếp được — chặn ở biên là chặn nhầm', () => {
    renderStep({ name: 'x'.repeat(ROADMAP_NAME_MAX_CHARS) });
    expect(nextButton()).toBeEnabled();
  });

  it('mục tiêu vượt trần thì khoá nút đi tiếp', () => {
    renderStep({ focus: 'y'.repeat(ROADMAP_FOCUS_MAX_CHARS + 1) });
    expect(nextButton()).toBeDisabled();
  });

  it('đếm ký tự theo bản đã cắt khoảng trắng, không theo chuỗi thô', () => {
    renderStep({ name: '   abc   ' });
    expect(screen.getByText(`3/${ROADMAP_NAME_MAX_CHARS}`)).toBeInTheDocument();
  });
});
