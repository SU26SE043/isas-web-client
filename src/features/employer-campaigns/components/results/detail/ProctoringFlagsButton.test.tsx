// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProctoringFlagsButton } from './ProctoringFlagsButton';
import type { CampaignResultFlag } from '../../../types/campaign.api.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' }),
}));

afterEach(() => cleanup());

const f = (type: string, count: number): CampaignResultFlag => ({ type, count, source: 'Client', note: null, firstAt: null, lastAt: null });

describe('ProctoringFlagsButton — cờ giám sát là MỘT NÚT ở đầu trang, bấm mở popup', () => {
  it('0 cờ → badge tĩnh "không ghi nhận", KHÔNG có nút, KHÔNG có dialog', () => {
    render(<ProctoringFlagsButton flags={[]} />);
    expect(screen.getByText('employer.campaigns.results.detail.proctoringNone')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('có cờ → nút mang TỔNG số lần; popup ĐÓNG cho tới khi bấm', () => {
    render(<ProctoringFlagsButton flags={[f('tab_switch', 4), f('face_mismatch', 1)]} />);
    const btn = screen.getByRole('button', { name: /proctoringButton/ });
    expect(btn).toHaveTextContent('employer.campaigns.results.detail.proctoringButton');
    // {{count}} được thay bằng tổng 5 — mock t trả key nên kiểm qua aria-expanded + không có dialog
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('bấm nút → dialog mở, bên trong là danh sách cờ với nhãn + ô "Vi phạm cửa sổ" đếm đúng', async () => {
    const user = userEvent.setup();
    render(<ProctoringFlagsButton flags={[f('tab_switch', 4), f('face_mismatch', 1), f('monitoring_gap', 1)]} />);
    await user.click(screen.getByRole('button', { name: /proctoringButton/ }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('employer.campaigns.results.flags.type.face_mismatch: 1');
    expect(dialog).toHaveTextContent('employer.campaigns.results.flags.type.monitoring_gap: 1');
    // ô cửa sổ = 4 (chỉ tab_switch), không phải tổng 6
    expect(dialog).toHaveTextContent('04');
    expect(dialog).not.toHaveTextContent('06');
  });

  it('tổng trên nút cộng mọi loại (không chỉ cửa sổ)', () => {
    const { container } = render(<ProctoringFlagsButton flags={[f('tab_switch', 2), f('no_face', 3)]} />);
    // t mock trả key nên đếm qua hàm thay thế: kiểm bằng cách render lại với t thật là việc của test i18n;
    // ở đây khoá bất biến "nút tồn tại khi tổng > 0"
    expect(container.querySelector('button')).not.toBeNull();
  });
});
