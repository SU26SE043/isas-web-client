// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PracticeDepthChoice } from './PracticeDepthChoice';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const baseProps = {
  adaptiveEnabled: true,
  onAdaptiveChange: vi.fn(),
  maxDeepPerQuestion: 2,
  onDepthChange: vi.fn(),
  depthMin: 1,
  depthMax: 3,
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('PracticeDepthChoice', () => {
  it('chỉ vẽ các mức nằm trong dải server cho phép', () => {
    render(<PracticeDepthChoice {...baseProps} depthMin={1} depthMax={2} />);
    expect(screen.getByText('practice.setup.depth.1')).toBeInTheDocument();
    expect(screen.getByText('practice.setup.depth.2')).toBeInTheDocument();
    // Mức 3 server sẽ từ chối ⇒ không được vẽ ra. Vẽ rồi để người dùng bấm và nhận 400 là đúng lỗi
    // đã dính một lần với `questionCount`.
    expect(screen.queryByText('practice.setup.depth.3')).not.toBeInTheDocument();
  });

  it('ẩn hẳn cả khối khi server không cho chọn', () => {
    const { container } = render(<PracticeDepthChoice {...baseProps} depthMin={0} depthMax={0} />);
    // Không phải "hiện ô rồi vô hiệu hoá" — một ô không có tác dụng là mời hiểu nhầm.
    expect(container).toBeEmptyDOMElement();
  });

  it('ẩn ô độ sâu khi ứng viên chọn buổi tĩnh', () => {
    render(<PracticeDepthChoice {...baseProps} adaptiveEnabled={false} />);
    expect(screen.getByText('practice.setup.depth.modeExact')).toBeInTheDocument();
    expect(screen.queryByText('practice.setup.depth.1')).not.toBeInTheDocument();
    expect(screen.queryByText('practice.setup.depth.totalUnchanged')).not.toBeInTheDocument();
  });

  it('bấm một mức thì báo ra ngoài', async () => {
    const onDepthChange = vi.fn();
    render(<PracticeDepthChoice {...baseProps} onDepthChange={onDepthChange} />);
    await userEvent.click(screen.getByText('practice.setup.depth.3'));
    expect(onDepthChange).toHaveBeenCalledWith(3);
  });

  it('bấm chế độ thì báo ra ngoài', async () => {
    const onAdaptiveChange = vi.fn();
    render(<PracticeDepthChoice {...baseProps} onAdaptiveChange={onAdaptiveChange} />);
    await userEvent.click(screen.getByText('practice.setup.depth.modeExact'));
    expect(onAdaptiveChange).toHaveBeenCalledWith(false);
  });

  // Tổng số câu KHÔNG đổi theo độ sâu — độ sâu chỉ phân bổ lại giữa "nhiều chủ đề" và "đào kỹ từng
  // chủ đề". Hiện một con số thời lượng đứng yên khi bấm qua lại 1/2/3 làm người dùng tin rằng lựa
  // chọn của họ vô nghĩa, nên khối này nói thẳng điều đó thay vì bịa một ước lượng.
  it('nói rõ tổng số câu không đổi, không bịa ước lượng thời lượng', () => {
    render(<PracticeDepthChoice {...baseProps} />);
    expect(screen.getByText('practice.setup.depth.totalUnchanged')).toBeInTheDocument();
  });
});
