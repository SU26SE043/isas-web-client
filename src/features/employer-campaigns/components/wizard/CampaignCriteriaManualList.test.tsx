/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CampaignCriteriaManualList,
  criteriaLockCopyKey,
} from './CampaignCriteriaManualList';
import { CRITERIA_ROW_GRID } from './criteria/criteriaRowGrid';
import type { RubricCriterion } from '../../types/campaignManagement.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      if (key === 'employer.campaigns.wizard.rubric.lockedStandard') {
        return 'Đang dùng bộ chuẩn. Bấm “{{action}}” ở khối phía trên.';
      }
      if (key === 'employer.campaigns.wizard.criteriaCustomize') return 'Tùy chỉnh bộ tiêu chí';
      return key;
    },
  }),
}));

afterEach(() => {
  cleanup();
});

const rubric: RubricCriterion[] = [
  { id: 'c1', name: 'Kỹ năng', description: 'Mô tả', weight: 100, maxScore: 10 },
];

const LOCK_TITLE = 'employer.campaigns.wizard.rubric.lockedTitle';
const ADD_LOCKED = 'employer.campaigns.wizard.rubric.addLocked';

function renderList(props: Partial<React.ComponentProps<typeof CampaignCriteriaManualList>> = {}) {
  const onChangeRubric = vi.fn();
  render(
    <CampaignCriteriaManualList rubric={rubric} onChangeRubric={onChangeRubric} {...props} />,
  );
  return { onChangeRubric };
}

function addButton() {
  return screen.getByRole('button', { name: /employer\.campaigns\.wizard\.rubric\.add/ });
}

describe('criteriaLockCopyKey', () => {
  it('không đoán nguyên nhân khi thiếu lockReason', () => {
    expect(criteriaLockCopyKey()).toBe('employer.campaigns.wizard.rubric.lockedGeneric');
  });

  it('ánh xạ đúng từng nguyên nhân', () => {
    expect(criteriaLockCopyKey('standard')).toBe(
      'employer.campaigns.wizard.rubric.lockedStandard',
    );
    expect(criteriaLockCopyKey('saving')).toBe('employer.campaigns.wizard.rubric.lockedSaving');
  });
});

describe('CampaignCriteriaManualList — dấu hiệu khoá', () => {
  it('không khoá thì không có thông báo và nút thêm bấm được', () => {
    const { onChangeRubric } = renderList();

    expect(screen.queryByText(LOCK_TITLE)).not.toBeInTheDocument();
    expect(addButton()).toBeEnabled();
    expect(screen.queryByText(ADD_LOCKED)).not.toBeInTheDocument();

    fireEvent.click(addButton());
    expect(onChangeRubric).toHaveBeenCalledTimes(1);
  });

  it('khoá vì đang dùng bộ chuẩn thì chỉ đúng nhãn nút Tuỳ chỉnh', () => {
    renderList({ disabled: true, lockReason: 'standard' });

    expect(screen.getByText(LOCK_TITLE)).toBeInTheDocument();
    expect(screen.getByText(/Tùy chỉnh bộ tiêu chí/)).toBeInTheDocument();
    // Chuỗi mẫu phải được thay, không để lọt placeholder ra giao diện.
    expect(screen.queryByText(/\{\{action\}\}/)).not.toBeInTheDocument();
  });

  it('khoá vì đang lưu thì KHÔNG bảo người dùng bấm Tuỳ chỉnh', () => {
    renderList({ disabled: true, lockReason: 'saving' });

    expect(screen.getByText('employer.campaigns.wizard.rubric.lockedSaving')).toBeInTheDocument();
    expect(screen.queryByText(/Tùy chỉnh bộ tiêu chí/)).not.toBeInTheDocument();
  });

  it('thiếu lockReason thì nói chung chung, không nêu nguyên nhân có thể sai', () => {
    renderList({ disabled: true });

    expect(screen.getByText(LOCK_TITLE)).toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.wizard.rubric.lockedGeneric')).toBeInTheDocument();
    expect(screen.queryByText(/Tùy chỉnh bộ tiêu chí/)).not.toBeInTheDocument();
  });

  it('nút thêm khi khoá: tắt, có câu giải thích, và không còn class hover', () => {
    const { onChangeRubric } = renderList({ disabled: true, lockReason: 'standard' });

    const button = addButton();
    expect(button).toBeDisabled();
    expect(screen.getByText(ADD_LOCKED)).toBeInTheDocument();
    // `:hover` vẫn khớp trên nút disabled — giữ class hover là nút sáng lên khi rê chuột.
    expect(button.className).not.toMatch(/hover:/);

    fireEvent.click(button);
    expect(onChangeRubric).not.toHaveBeenCalled();
  });

  it('nút thêm khi mở khoá vẫn giữ phản hồi hover', () => {
    renderList();
    expect(addButton().className).toMatch(/hover:/);
  });

  it('thông báo khoá gắn với vùng danh sách qua aria-describedby', () => {
    renderList({ disabled: true, lockReason: 'standard' });

    const note = screen.getByRole('status');
    expect(note).toHaveAttribute('id', 'campaign-rubric-lock-note');
    expect(document.querySelector('[aria-describedby="campaign-rubric-lock-note"]')).not.toBeNull();
  });

  it('danh sách rỗng thì không chồng thông báo khoá lên màn hình chọn cách bắt đầu', () => {
    render(
      <CampaignCriteriaManualList rubric={[]} disabled lockReason="standard" onChangeRubric={vi.fn()} />,
    );

    expect(screen.queryByText(LOCK_TITLE)).not.toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.wizard.rubric.emptyTitle')).toBeInTheDocument();
  });
});

describe('CampaignCriteriaManualList — nhãn cột khớp ô nhập', () => {
  it('dòng tiêu đề dùng CHUNG khuôn lưới với hàng, không khai riêng một bản', () => {
    // Trước đây tiêu đề khai `1.1fr_1.3fr_…` còn hàng khai `18rem-1.15fr_1.45fr_…`
    // nên nhãn cột không nằm đúng trên ô nó mô tả.
    renderList();

    const header = screen.getByText('employer.campaigns.wizard.rubric.colWeight')
      .parentElement as HTMLElement;
    expect(header.className).toContain(CRITERIA_ROW_GRID);
  });

  it('số nhãn cột khớp đúng số ô trên hàng', () => {
    // Thừa/thiếu một ô là mọi nhãn phía sau trượt sang cột khác mà không có lỗi nào.
    renderList();

    const header = screen.getByText('employer.campaigns.wizard.rubric.colWeight')
      .parentElement as HTMLElement;
    const row = document.querySelector('article > div') as HTMLElement;
    expect(header.children).toHaveLength(row.children.length);
  });

  it('bỏ cột MÔ TẢ khỏi tiêu đề vì mô tả đã chuyển sang popup', () => {
    renderList();

    expect(
      screen.queryByText('employer.campaigns.wizard.rubric.colDescription'),
    ).not.toBeInTheDocument();
  });

  it('nguyên nhân khoá đi tiếp xuống popup chi tiết, không dừng ở thông báo đầu bảng', () => {
    renderList({ disabled: true, lockReason: 'saving' });

    const key = 'employer.campaigns.wizard.rubric.lockedSaving';
    // Chỉ có thông báo đầu bảng trước khi mở popup.
    expect(screen.getAllByText(key)).toHaveLength(1);

    fireEvent.click(
      screen.getByText('employer.campaigns.wizard.rubric.detail').closest('button')!,
    );
    // Popup nói CÙNG nguyên nhân. Không truyền `lockReason` xuống thì nó rơi về
    // `lockedGeneric` và số này vẫn là 1.
    expect(screen.getAllByText(key)).toHaveLength(2);
  });
});

describe('CampaignCriteriaManualList — nút "AI đề xuất mốc" ở header', () => {
  const SUGGEST = /employer\.campaigns\.wizard\.levelsEditor\.suggest$/;
  const NEEDS_SAVE = 'employer.campaigns.wizard.levelsEditor.suggestNeedsSave';

  it('mặc định (không truyền campaignId/onEnsurePersisted) vẫn render: nút hiện nhưng TẮT kèm lý do', () => {
    // Mọi prop mới là optional — `CampaignCriteriaStepV2` chưa nối vẫn chạy như cũ.
    renderList();

    expect(screen.getByRole('button', { name: SUGGEST })).toBeDisabled();
    expect(screen.getByText(NEEDS_SAVE)).toBeInTheDocument();
  });

  it('có campaignId thì nút bấm được, không còn lý do "cần lưu trước"', () => {
    renderList({ campaignId: 'camp-1' });

    expect(screen.getByRole('button', { name: SUGGEST })).toBeEnabled();
    expect(screen.queryByText(NEEDS_SAVE)).not.toBeInTheDocument();
  });

  it('có onEnsurePersisted (chưa có id) cũng bấm được — persist sẽ cấp id', () => {
    renderList({ onEnsurePersisted: vi.fn().mockResolvedValue('camp-2') });

    expect(screen.getByRole('button', { name: SUGGEST })).toBeEnabled();
  });

  it('khoá bảng thì KHÔNG có nút — không có gì để AI điền vào', () => {
    renderList({ disabled: true, lockReason: 'standard', campaignId: 'camp-1' });

    expect(screen.queryByRole('button', { name: SUGGEST })).not.toBeInTheDocument();
  });

  it('danh sách rỗng thì KHÔNG có nút (server cũng trả 400 chưa có tiêu chí)', () => {
    render(<CampaignCriteriaManualList rubric={[]} campaignId="camp-1" onChangeRubric={vi.fn()} />);

    expect(screen.queryByRole('button', { name: SUGGEST })).not.toBeInTheDocument();
  });

  it('nút Sửa mốc của từng hàng cũng chỉ hiện khi mở khoá', () => {
    renderList({ disabled: true, lockReason: 'standard' });
    expect(
      screen.queryByRole('button', { name: /levelsEditor\.open/ }),
    ).not.toBeInTheDocument();

    cleanup();
    renderList();
    expect(screen.getByRole('button', { name: /levelsEditor\.openEmpty/ })).toBeEnabled();
  });
});
