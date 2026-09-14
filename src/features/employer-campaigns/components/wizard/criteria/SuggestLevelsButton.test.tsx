/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RubricCriterion } from '../../../types/campaignManagement.types';
import { SuggestLevelsButton } from './SuggestLevelsButton';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      if (key === 'employer.campaigns.wizard.levelsEditor.suggestApplied') return 'applied {{count}}: {{names}}';
      if (key === 'employer.campaigns.wizard.levelsEditor.mergeDescription') return 'merge {{count}} · fill: {{names}}';
      if (key === 'employer.campaigns.wizard.levelsEditor.suggestUnmatched') return 'unmatched {{count}}: {{names}}';
      return key;
    },
  }),
}));

const suggestMock = vi.hoisted(() => vi.fn());
vi.mock('../../../services/campaignLevels.service', () => ({
  suggestCriterionLevels: suggestMock,
}));

afterEach(() => cleanup());
// Thân hàm PHẢI có ngoặc: `() => suggestMock.mockReset()` trả về chính mock (một hàm), vitest coi
// giá trị trả về của hook là teardown và GỌI mock sau mỗi test ⇒ ca reject nổ thành lỗi test.
beforeEach(() => {
  suggestMock.mockReset();
});

const K = 'employer.campaigns.wizard.levelsEditor';
const d = 'Mô tả đủ dài để qua ngưỡng hai mươi ký tự.';
const own = [{ score: 0, descriptor: `HR ${d}` }, { score: 10, descriptor: `HR ${d}` }];
const ai = [{ score: 0, descriptor: `AI ${d}` }, { score: 10, descriptor: `AI ${d}` }];

const c = (over: Partial<RubricCriterion>): RubricCriterion => ({
  id: 'x',
  name: 'Giao tiếp',
  description: '',
  weight: 50,
  maxScore: 10,
  ...over,
});

function axiosError(status: number, data: unknown) {
  return Object.assign(new Error('http'), { isAxiosError: true, response: { status, data } });
}

function renderButton(props: Partial<React.ComponentProps<typeof SuggestLevelsButton>> = {}) {
  const onChangeRubric = vi.fn();
  const rubric = props.rubric ?? [c({ id: 'a', name: 'Giao tiếp' }), c({ id: 'b', name: 'Kỹ thuật' })];
  render(<SuggestLevelsButton rubric={rubric} onChangeRubric={onChangeRubric} {...props} />);
  return { onChangeRubric, rubric };
}

const button = () => screen.getByRole('button', { name: new RegExp(`${K}\\.suggest$`) });

describe('SuggestLevelsButton — điều kiện bấm', () => {
  it('không có campaignId lẫn onEnsurePersisted → tắt kèm lý do "cần lưu trước"', () => {
    renderButton();
    expect(button()).toBeDisabled();
    expect(screen.getByText(`${K}.suggestNeedsSave`)).toBeInTheDocument();
  });

  it('có campaignId (không có persist) → bấm được, gọi thẳng với id đó', async () => {
    suggestMock.mockResolvedValue({ criteria: [] });
    renderButton({ campaignId: 'camp-1' });
    expect(button()).toBeEnabled();
    expect(screen.queryByText(`${K}.suggestNeedsSave`)).not.toBeInTheDocument();

    fireEvent.click(button());
    await waitFor(() => expect(suggestMock).toHaveBeenCalledWith('camp-1'));
  });

  it('có onEnsurePersisted → gọi nó TRƯỚC và dùng id nó trả về, kể cả khi đã có campaignId', async () => {
    // AI đọc tiêu chí ĐÃ LƯU; id cũ không mang tiêu chí đang gõ dở. Bỏ qua bước persist là
    // đề xuất mốc cho một bộ tiêu chí khác bộ đang trên màn hình.
    suggestMock.mockResolvedValue({ criteria: [] });
    const onEnsurePersisted = vi.fn().mockResolvedValue('persisted-id');
    renderButton({ campaignId: 'stale-id', onEnsurePersisted });

    fireEvent.click(button());
    await waitFor(() => expect(suggestMock).toHaveBeenCalledTimes(1));
    expect(onEnsurePersisted).toHaveBeenCalledTimes(1);
    expect(suggestMock).toHaveBeenCalledWith('persisted-id');
    expect(suggestMock).not.toHaveBeenCalledWith('stale-id');
  });

  it('persist trả null → báo lỗi, KHÔNG gọi AI', async () => {
    const onEnsurePersisted = vi.fn().mockResolvedValue(null);
    renderButton({ onEnsurePersisted });

    fireEvent.click(button());
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(`${K}.suggestNotSaved`));
    expect(suggestMock).not.toHaveBeenCalled();
  });
});

describe('SuggestLevelsButton — ghép kết quả', () => {
  it('chưa tiêu chí nào có mốc → ghép ngay theo TÊN (không hỏi), báo số đã điền', async () => {
    suggestMock.mockResolvedValue({
      criteria: [
        { criterionId: 'srv-1', name: 'giao TIẾP', maxScore: 10, levels: ai },
        { criterionId: 'srv-2', name: 'Không khớp', maxScore: 10, levels: ai },
      ],
    });
    const { onChangeRubric } = renderButton({ campaignId: 'camp-1' });

    fireEvent.click(button());
    await waitFor(() => expect(onChangeRubric).toHaveBeenCalledTimes(1));
    const next = onChangeRubric.mock.calls[0][0] as RubricCriterion[];
    // id server 'srv-1' ≠ id local 'a' — chỉ tên mới ghép được.
    expect(next[0]).toMatchObject({ id: 'a', levels: ai });
    expect(next[1].levels).toBeUndefined();
    // N2 designer review: gọi TÊN tiêu chí vừa điền (tên local, không phải "giao TIẾP" của server).
    expect(screen.getByRole('status')).toHaveTextContent('applied 1: Giao tiếp');
    expect(screen.getByRole('status')).toHaveTextContent('Không khớp');
  });

  it('không tên nào khớp → thông báo, KHÔNG đổi rubric', async () => {
    suggestMock.mockResolvedValue({ criteria: [{ criterionId: 's', name: 'Khác', maxScore: 10, levels: ai }] });
    const { onChangeRubric } = renderButton({ campaignId: 'camp-1' });

    fireEvent.click(button());
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(`${K}.suggestNoMatch`));
    expect(onChangeRubric).not.toHaveBeenCalled();
  });

  it('có tiêu chí đã có mốc → HỎI; "Chỉ điền chỗ trống" giữ mốc HR', async () => {
    suggestMock.mockResolvedValue({
      criteria: [
        { criterionId: 's1', name: 'Giao tiếp', maxScore: 10, levels: ai },
        { criterionId: 's2', name: 'Kỹ thuật', maxScore: 10, levels: ai },
      ],
    });
    const { onChangeRubric } = renderButton({
      campaignId: 'camp-1',
      rubric: [c({ id: 'a', name: 'Giao tiếp', levels: own }), c({ id: 'b', name: 'Kỹ thuật' })],
    });

    fireEvent.click(button());
    await screen.findByText(`${K}.mergeTitle`);
    expect(onChangeRubric).not.toHaveBeenCalled();
    // N1: hộp thoại gọi tên chỗ trống SẼ được điền — không chỉ "1 tiêu chí đã có mốc".
    expect(screen.getByText('merge 1 · fill: Kỹ thuật')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: `${K}.mergeFillEmpty` }));
    const next = onChangeRubric.mock.calls[0][0] as RubricCriterion[];
    expect(next[0].levels).toEqual(own);
    expect(next[1].levels).toEqual(ai);
    expect(screen.getByRole('status')).toHaveTextContent('applied 1: Kỹ thuật');
  });

  it('"Thay hết" ghi đè cả mốc HR đã soạn', async () => {
    suggestMock.mockResolvedValue({ criteria: [{ criterionId: 's1', name: 'Giao tiếp', maxScore: 10, levels: ai }] });
    const { onChangeRubric } = renderButton({
      campaignId: 'camp-1',
      rubric: [c({ id: 'a', name: 'Giao tiếp', levels: own })],
    });

    fireEvent.click(button());
    await screen.findByText(`${K}.mergeTitle`);
    fireEvent.click(screen.getByRole('button', { name: `${K}.mergeReplaceAll` }));

    const next = onChangeRubric.mock.calls[0][0] as RubricCriterion[];
    expect(next[0].levels).toEqual(ai);
    expect(screen.getByRole('status')).toHaveTextContent('applied 1: Giao tiếp');
  });
});

describe('SuggestLevelsButton — lỗi phải nổi lên, không bịa mốc', () => {
  it('502 → hiện NGUYÊN câu server, KHÔNG rơi về dải mặc định, rubric không đổi', async () => {
    suggestMock.mockRejectedValue(axiosError(502, 'AIService: Gemini 503 high demand'));
    const { onChangeRubric } = renderButton({ campaignId: 'camp-1' });

    fireEvent.click(button());
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('AIService: Gemini 503 high demand'),
    );
    expect(onChangeRubric).not.toHaveBeenCalled();
  });

  it('502 body rỗng → câu chung "AI không soạn được", vẫn không đổi rubric', async () => {
    suggestMock.mockRejectedValue(axiosError(502, ''));
    const { onChangeRubric } = renderButton({ campaignId: 'camp-1' });

    fireEvent.click(button());
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(`${K}.suggestAiFailed`));
    expect(onChangeRubric).not.toHaveBeenCalled();
  });

  it('409 → "chiến dịch đã đóng"', async () => {
    suggestMock.mockRejectedValue(axiosError(409, 'Campaign is closed'));
    renderButton({ campaignId: 'camp-1' });

    fireEvent.click(button());
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(`${K}.suggestClosed`));
  });

  it('400 → câu server (chưa có tiêu chí)', async () => {
    suggestMock.mockRejectedValue(axiosError(400, 'Chiến dịch chưa có tiêu chí'));
    renderButton({ campaignId: 'camp-1' });

    fireEvent.click(button());
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Chiến dịch chưa có tiêu chí'));
  });

  it('đang gọi thì nút khoá (không bắn hai request)', async () => {
    let resolve: (value: unknown) => void = () => undefined;
    suggestMock.mockReturnValue(new Promise((r) => { resolve = r; }));
    renderButton({ campaignId: 'camp-1' });

    fireEvent.click(button());
    await waitFor(() => expect(screen.getByRole('button', { name: /suggesting/ })).toBeDisabled());
    resolve({ criteria: [] });
    await waitFor(() => expect(button()).toBeEnabled());
    expect(suggestMock).toHaveBeenCalledTimes(1);
  });
});
