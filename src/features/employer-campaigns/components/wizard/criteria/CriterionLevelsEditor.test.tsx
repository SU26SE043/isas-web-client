/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RubricCriterion } from '../../../types/campaignManagement.types';
import { CriterionLevelsEditor } from './CriterionLevelsEditor';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    // Trả về key trần, GIỮ placeholder — test kiểm được rằng số thật đã được thay vào.
    t: (key: string) => {
      const map: Record<string, string> = {
        'employer.campaigns.wizard.levelsEditor.error.count': 'count {{count}}',
        'employer.campaigns.wizard.levelsEditor.error.duplicate': 'duplicate {{score}}',
        'employer.campaigns.wizard.levelsEditor.error.range': 'range {{max}}',
        'employer.campaigns.wizard.levelsEditor.error.missingMax': 'missingMax {{max}}',
        'employer.campaigns.wizard.levelsEditor.error.descriptor': 'descriptor {{count}}',
        'employer.campaigns.wizard.levelsEditor.charCount': '{{count}}/500',
        'employer.campaigns.wizard.levelsEditor.scaffold': 'scaffold {{max}}',
        'employer.campaigns.wizard.levelsEditor.subtitle': 'subtitle {{max}} {{max}}',
      };
      return map[key] ?? key;
    },
  }),
}));

afterEach(() => cleanup());

const K = 'employer.campaigns.wizard.levelsEditor';
const d = 'Mô tả đủ dài để qua ngưỡng hai mươi ký tự.';

function renderEditor(overrides: Partial<RubricCriterion> = {}) {
  const criterion: RubricCriterion = {
    id: 'c1',
    name: 'Giao tiếp',
    weight: 25,
    description: '',
    maxScore: 10,
    ...overrides,
  };
  const onSave = vi.fn();
  const onClose = vi.fn();
  render(<CriterionLevelsEditor open criterion={criterion} indexLabel="01" onSave={onSave} onClose={onClose} />);
  return { onSave, onClose };
}

const scores = () => screen.getAllByLabelText(`${K}.score`) as HTMLInputElement[];
const descriptors = () => screen.getAllByLabelText(`${K}.descriptor`) as HTMLTextAreaElement[];
const save = () => fireEvent.click(screen.getByRole('button', { name: `${K}.save` }));
const setScore = (index: number, value: string) => fireEvent.change(scores()[index], { target: { value } });
const setDesc = (index: number, value: string) => fireEvent.change(descriptors()[index], { target: { value } });

describe('CriterionLevelsEditor — nạp và chuẩn hoá', () => {
  it('nạp mốc sẵn có, sắp theo điểm tăng dần', () => {
    renderEditor({ levels: [{ score: 10, descriptor: d }, { score: 0, descriptor: d }] });
    expect(scores().map((input) => input.value)).toEqual(['0', '10']);
  });

  it('không có mốc → trạng thái trống + nút tạo khung nói đúng thang', () => {
    renderEditor({ maxScore: 7 });
    expect(screen.getByRole('status')).toHaveTextContent(`${K}.empty`);
    expect(screen.getByRole('button', { name: 'scaffold 7' })).toBeEnabled();
  });

  it('"Tạo khung" sinh đúng mốc 0 và mốc max với mô tả TRỐNG để HR điền', () => {
    renderEditor({ maxScore: 7 });
    fireEvent.click(screen.getByRole('button', { name: 'scaffold 7' }));

    expect(scores().map((input) => input.value)).toEqual(['0', '7']);
    expect(descriptors().map((area) => area.value)).toEqual(['', '']);
    // Đã có đủ hai mốc biên thì nút BIẾN MẤT (không phải disabled: nút xám không hiện tooltip, chỉ gây thắc mắc) — bấm lại không đẻ mốc trùng.
    expect(screen.queryByRole('button', { name: 'scaffold 7' })).not.toBeInTheDocument();
  });

  it('"Thêm mốc" lấy điểm nguyên nhỏ nhất còn trống, không trùng mốc đang có', () => {
    renderEditor({ levels: [{ score: 0, descriptor: d }, { score: 10, descriptor: d }] });
    fireEvent.click(screen.getByRole('button', { name: `${K}.addLevel` }));
    expect(scores().map((input) => input.value)).toEqual(['0', '10', '1']);
  });

  it('ô điểm là số nguyên: step 1, min 0, max = thang của tiêu chí', () => {
    renderEditor({ maxScore: 7, levels: [{ score: 0, descriptor: d }] });
    const input = scores()[0];
    expect(input).toHaveAttribute('step', '1');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '7');
  });

  it('ô mô tả cao theo nội dung (field-sizing-content) — mô tả AI ~190 ký tự không bị cắt giữa câu ở 3 dòng', () => {
    renderEditor({ levels: [{ score: 0, descriptor: d }] });
    expect(descriptors()[0]).toHaveClass('field-sizing-content');
  });

  it('đếm ký tự mô tả theo trần 500, đo sau trim', () => {
    renderEditor({ levels: [{ score: 0, descriptor: '  abc  ' }] });
    expect(screen.getByText('3/500')).toBeInTheDocument();
  });
});

describe('CriterionLevelsEditor — lưu', () => {
  it('bộ hợp lệ: onSave nhận mốc đã trim + sắp tăng dần, rồi đóng', () => {
    const { onSave, onClose } = renderEditor({
      levels: [{ score: 10, descriptor: ` ${d} ` }, { score: 0, descriptor: d }],
    });
    save();
    expect(onSave).toHaveBeenCalledWith([
      { score: 0, descriptor: d },
      { score: 10, descriptor: d },
    ]);
    expect(onClose).toHaveBeenCalled();
  });

  it('0 mốc → lưu [] (mốc là tuỳ chọn), không báo lỗi đếm', () => {
    const { onSave } = renderEditor({ levels: [{ score: 0, descriptor: d }] });
    fireEvent.click(screen.getByRole('button', { name: /removeLevel/ }));
    save();
    expect(onSave).toHaveBeenCalledWith([]);
  });

  it('chỉ 1 mốc → chặn với lỗi đếm, KHÔNG gọi onSave', () => {
    const { onSave } = renderEditor({ levels: [{ score: 0, descriptor: d }] });
    save();
    expect(screen.getByRole('alert')).toHaveTextContent('count 1');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('thiếu mốc 0 → chặn, lỗi hiện ở CUỐI bảng (không gắn hàng nào)', () => {
    const { onSave } = renderEditor({ levels: [{ score: 5, descriptor: d }, { score: 10, descriptor: d }] });
    save();
    expect(screen.getByRole('alert')).toHaveTextContent(`${K}.error.missingZero`);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('thiếu mốc max → chặn, câu lỗi mang đúng số max', () => {
    const { onSave } = renderEditor({ maxScore: 7, levels: [{ score: 0, descriptor: d }, { score: 5, descriptor: d }] });
    save();
    expect(screen.getByRole('alert')).toHaveTextContent('missingMax 7');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('mô tả ngắn → lỗi hiện NGAY DƯỚI hàng sai kèm số ký tự hiện có', () => {
    const { onSave } = renderEditor({ levels: [{ score: 0, descriptor: 'ngắn' }, { score: 10, descriptor: d }] });
    save();
    const rows = screen.getAllByRole('listitem');
    expect(within(rows[0]).getByRole('alert')).toHaveTextContent('descriptor 4');
    expect(within(rows[1]).queryByRole('alert')).not.toBeInTheDocument();
    expect(scores()[0]).toHaveAttribute('aria-invalid', 'true');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('trùng điểm → chặn, lỗi gắn vào hàng trùng thứ hai', () => {
    const { onSave } = renderEditor({ levels: [{ score: 0, descriptor: d }, { score: 10, descriptor: d }] });
    fireEvent.click(screen.getByRole('button', { name: `${K}.addLevel` }));
    setScore(2, '10');
    setDesc(2, d);
    save();
    const rows = screen.getAllByRole('listitem');
    expect(within(rows[2]).getByRole('alert')).toHaveTextContent('duplicate 10');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('điểm ngoài thang → chặn với lỗi range', () => {
    const { onSave } = renderEditor({ maxScore: 7, levels: [{ score: 0, descriptor: d }, { score: 7, descriptor: d }] });
    setScore(1, '9');
    save();
    expect(screen.getByRole('alert')).toHaveTextContent('range 7');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('ô điểm để TRỐNG không được coi là 0 — báo lỗi số nguyên', () => {
    // 0 là mốc bắt buộc; coi ô trống là 0 sẽ che mất lỗi thiếu mốc 0.
    const { onSave } = renderEditor({ levels: [{ score: 0, descriptor: d }, { score: 10, descriptor: d }] });
    setScore(0, '');
    save();
    expect(screen.getByRole('alert')).toHaveTextContent(`${K}.error.integer`);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('chỉ kiểm sau lần Lưu đầu; sửa xong lỗi tự biến mất và lưu được', () => {
    const { onSave } = renderEditor({ levels: [{ score: 0, descriptor: 'ngắn' }, { score: 10, descriptor: d }] });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    save();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    setDesc(0, d);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    save();
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('Huỷ đóng mà không lưu', () => {
    const { onSave, onClose } = renderEditor({ levels: [{ score: 0, descriptor: d }, { score: 10, descriptor: d }] });
    fireEvent.click(screen.getByRole('button', { name: `${K}.cancel` }));
    expect(onClose).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });
});
