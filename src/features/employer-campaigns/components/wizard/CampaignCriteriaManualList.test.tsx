/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CampaignCriteriaManualList,
  criteriaLockCopyKey,
} from './CampaignCriteriaManualList';
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
