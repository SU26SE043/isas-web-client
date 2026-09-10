/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RubricCriterion } from '../../../types/campaignManagement.types';
import { CampaignRubricCriterionCard } from './CampaignRubricCriterionCard';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) =>
      // Chuỗi mẫu thật cho badge sàn — trả về key trần thì test không thể phát hiện
      // placeholder `{{value}}` lọt ra giao diện.
      key === 'employer.campaigns.wizard.rubric.floorBadge' ? 'Sàn {{value}}%' : key,
  }),
}));

afterEach(() => {
  cleanup();
});

const K = 'employer.campaigns.wizard.rubric';

function renderCard(
  overrides: Partial<RubricCriterion> = {},
  props: { disabled?: boolean; lockReason?: 'standard' | 'saving' } = {},
) {
  const criterion: RubricCriterion = {
    id: 'c1',
    name: 'Giao tiếp',
    weight: 25,
    description: '',
    maxScore: 10,
    ...overrides,
  };
  const onChange = vi.fn();
  render(
    <CampaignRubricCriterionCard
      criterion={criterion}
      index={0}
      onChange={onChange}
      onRemove={vi.fn()}
      {...props}
    />,
  );
  return {
    onChange,
    name: screen.getByLabelText(`${K}.name`),
    maxScore: screen.getByLabelText(`${K}.maxScore`),
    weight: screen.getByLabelText(`${K}.weight`),
    detailButton: screen.getByText(`${K}.detail`).closest('button') as HTMLButtonElement,
  };
}

function openDetail() {
  fireEvent.click(screen.getByText(`${K}.detail`).closest('button') as HTMLButtonElement);
}

describe('CampaignRubricCriterionCard — kiểu số khớp backend', () => {
  it('maxScore chỉ cho số NGUYÊN (backend là Int32)', () => {
    // `campaign_criteria.max_score` là Int32; gửi 7.5 thì backend trả 400
    // `System.Int32` — lỗi chỉ lộ ra SAU khi employer bấm lưu cả wizard.
    expect(renderCard().maxScore).toHaveAttribute('step', '1');
  });

  it('maxScore thập phân bị đánh dấu KHÔNG hợp lệ ngay tại ô nhập', () => {
    // Chặn ở đây thay vì để backend 400: `step` chỉ chặn nút tăng/giảm, người
    // dùng vẫn gõ tay được.
    expect(renderCard({ maxScore: 7.5 }).maxScore).toHaveAttribute('aria-invalid', 'true');
  });

  it('maxScore nguyên trong dải 1..10 thì hợp lệ', () => {
    expect(renderCard({ maxScore: 7 }).maxScore).toHaveAttribute('aria-invalid', 'false');
  });

  it('weight VẪN cho thập phân (backend là numeric, không phải Int32)', () => {
    // Bất đối xứng có chủ đích — đừng "thống nhất" hai ô về cùng một step.
    expect(renderCard().weight).toHaveAttribute('step', '0.1');
  });
});

describe('CampaignRubricCriterionCard — một băng ô nhập cao bằng nhau', () => {
  it('cả ba ô nhập trên hàng đều cao 36px (h-9)', () => {
    // Bản trước: tên 72px · mô tả 112px · hai ô số 36px ⇒ đáy so le, hàng lởm chởm.
    const { name, weight, maxScore } = renderCard();

    for (const field of [name, weight, maxScore]) expect(field).toHaveClass('h-9');
  });

  it('cả băng hàng là một tầng 36px: chip số và nút xoá cũng size-9', () => {
    renderCard();

    expect(screen.getByText('01')).toHaveClass('size-9');
    expect(screen.getByRole('button', { name: `${K}.remove` })).toHaveClass('size-9');
  });

  it('ô tên là INPUT một dòng, không cắt cụt, và phơi đủ giá trị qua title', () => {
    // ĐỔI TIỀN ĐỀ có chủ đích so với bản trước (`textarea rows=2`): mô tả đã sang popup
    // nên cột tên rộng hẳn ra, và tên tiêu chí là nhãn ngắn ("Chiều sâu kỹ thuật").
    // Ý định cũ — "tên dài không bị cắt cụt" — vẫn được giữ: không có `truncate`,
    // `title` phơi đủ giá trị, và tiêu đề popup hiển thị tên trọn vẹn (test dưới).
    const long = 'Kỹ năng giao tiếp với khách hàng và phối hợp liên phòng ban';
    const { name } = renderCard({ name: long });

    expect(name.tagName).toBe('INPUT');
    expect(name).not.toHaveClass('truncate');
    expect(name).toHaveAttribute('title', long);
  });

  it('tên dài đọc trọn được ở tiêu đề popup', () => {
    const long = 'Kỹ năng giao tiếp với khách hàng và phối hợp liên phòng ban';
    renderCard({ name: long });
    openDetail();

    expect(screen.getByRole('heading', { name: long })).toBeInTheDocument();
  });

  it('thanh tỉ lệ trọng số nằm ĐÈ lên ô nhập, không đẩy cột cao thêm', () => {
    // Đặt thanh bên dưới ô nhập thì riêng cột trọng số cao hơn ~14px và cả băng lệch đáy.
    const { weight } = renderCard();
    const meter = weight.parentElement?.querySelector('[aria-hidden="true"]');

    expect(meter).not.toBeNull();
    expect(meter).toHaveClass('absolute');
  });

  it('đầu hàng chỉ còn MỘT dấu hiệu, không icon trang trí kèm theo', () => {
    // Bản trước có hai chip sát nhau: số thứ tự (`rounded-lg`) + icon lặp theo
    // `index % 4` (`rounded-full`) — icon không mang thông tin nào.
    renderCard();
    const lead = screen.getByText('01').parentElement as HTMLElement;

    expect(lead.querySelectorAll('svg')).toHaveLength(0);
  });
});

describe('CampaignRubricCriterionCard — dải tóm tắt giữ dấu hiệu của phần đã giấu', () => {
  it('nói rõ đã có hay chưa có mô tả', () => {
    renderCard({ description: 'Mô tả đủ dài để AI hiểu tiêu chí.' });
    expect(screen.getByText(`${K}.hasDesc`)).toBeInTheDocument();

    cleanup();
    renderCard({ description: '   ' });
    expect(screen.getByText(`${K}.noDesc`)).toBeInTheDocument();
  });

  it('đếm mốc điểm, và nói "chưa có mốc" khi rỗng', () => {
    renderCard({ levels: [{ score: 0, descriptor: 'Kém' }, { score: 10, descriptor: 'Tốt' }] });
    expect(screen.getByText(`2 ${K}.levels`)).toBeInTheDocument();

    cleanup();
    renderCard();
    expect(screen.getByText(`${K}.noLevels`)).toBeInTheDocument();
  });

  it('hiện điểm sàn kèm số thật khi có, và im lặng khi chưa đặt', () => {
    renderCard({ minPct: 40 });
    expect(screen.getByText('Sàn 40%')).toBeInTheDocument();
    // Placeholder phải được thay, không để lọt ra giao diện.
    expect(screen.queryByText(/\{\{value\}\}/)).not.toBeInTheDocument();

    cleanup();
    renderCard({ minPct: null });
    expect(screen.queryByText(/^Sàn /)).not.toBeInTheDocument();
  });
});

describe('CampaignRubricCriterionCard — popup chi tiết', () => {
  it('mô tả không còn nằm trên hàng, chỉ có trong popup', () => {
    renderCard({ description: 'Mô tả dài cho tiêu chí.' });
    expect(screen.queryByLabelText(`${K}.criterionDesc`)).not.toBeInTheDocument();

    openDetail();
    expect(screen.getByLabelText(`${K}.criterionDesc`)).toHaveValue('Mô tả dài cho tiêu chí.');
  });

  it('sửa mô tả trong popup chảy thẳng ra onChange của hàng', () => {
    // Không có state trung gian: popup ghi đúng vào nguồn dữ liệu của hàng.
    const { onChange } = renderCard();
    openDetail();

    fireEvent.change(screen.getByLabelText(`${K}.criterionDesc`), {
      target: { value: 'Mô tả mới' },
    });
    expect(onChange).toHaveBeenCalledWith({ description: 'Mô tả mới' });
  });

  it('sửa điểm sàn trong popup cũng chảy ra onChange, xoá trắng thành null', () => {
    const { onChange } = renderCard({ minPct: 40 });
    openDetail();

    const floor = screen.getByLabelText(`${K}.minPct`);
    fireEvent.change(floor, { target: { value: '55' } });
    expect(onChange).toHaveBeenCalledWith({ minPct: 55 });

    fireEvent.change(floor, { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith({ minPct: null });
  });

  it('liệt kê mốc điểm của tiêu chí', () => {
    renderCard({ levels: [{ score: 4, descriptor: 'Đạt cơ bản' }] });
    openDetail();

    expect(screen.getByText(/Đạt cơ bản/)).toBeInTheDocument();
  });

  it('đóng được bằng phím Escape', () => {
    renderCard();
    openDetail();
    expect(screen.getByLabelText(`${K}.criterionDesc`)).toBeInTheDocument();

    fireEvent.keyDown(screen.getByLabelText(`${K}.criterionDesc`), { key: 'Escape' });
    expect(screen.queryByLabelText(`${K}.criterionDesc`)).not.toBeInTheDocument();
  });
});

describe('CampaignRubricCriterionCard — khoá bảng', () => {
  it('popup KHÔNG phải cửa hậu: mọi ô trong đó cũng bị khoá', () => {
    const { onChange } = renderCard({ description: 'Mô tả', minPct: 40 }, { disabled: true });
    openDetail();

    expect(screen.getByLabelText(`${K}.criterionDesc`)).toBeDisabled();
    expect(screen.getByLabelText(`${K}.minPct`)).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('popup nêu ĐÚNG nguyên nhân khoá, không đoán bừa', () => {
    renderCard({}, { disabled: true, lockReason: 'saving' });
    openDetail();

    expect(screen.getByText(`${K}.lockedSaving`)).toBeInTheDocument();
    expect(screen.queryByText(`${K}.lockedStandard`)).not.toBeInTheDocument();
  });

  it('khoá là cấm SỬA chứ không cấm ĐỌC — vẫn mở được popup để xem', () => {
    // Bộ chuẩn khoá bảng; employer vẫn cần đọc mô tả và mốc điểm trước khi quyết định.
    const { detailButton } = renderCard({ description: 'Mô tả' }, { disabled: true });

    expect(detailButton).toBeEnabled();
    openDetail();
    expect(screen.getByLabelText(`${K}.criterionDesc`)).toHaveValue('Mô tả');
  });
});
