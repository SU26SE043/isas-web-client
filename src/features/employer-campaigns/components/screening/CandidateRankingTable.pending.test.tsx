import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { CandidateRankingTable } from './CandidateRankingTable';
import { CandidateEmailCell } from './CandidateEmailCell';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

/**
 * Đo 21/09 trên prod: HR bấm Phân tích thấy 4 dòng toàn "—" + ô "Lưu email" trống ⇒ đọc thành hỏng.
 * (1) dòng đang sàng vẽ skeleton + spinner, KHÔNG có ô nhập/nút "Lưu email", không tick/mở chi tiết
 * được; (2) email hiện dạng CHỮ, ô nhập chỉ mở khi HR bấm sửa/thêm.
 */
afterEach(() => cleanup());

const analyzed = (id: string, email: string | null = `${id}@x.com`): CampaignCandidateListItem =>
  ({ id, status: 'Analyzed', fullName: `Tên ${id}`, email, overallMatchScore: 80, skills: ['PHP'] });
const analyzing = (id: string, email: string | null = `${id}@x.com`): CampaignCandidateListItem =>
  ({ id, status: 'Analyzing', fullName: null, email, overallMatchScore: null, skills: null });

function renderTable(candidates: CampaignCandidateListItem[], onUpdateEmail = vi.fn(async () => undefined)) {
  render(
    <CandidateRankingTable
      candidates={candidates}
      selectedIds={new Set()}
      onToggle={vi.fn()}
      onToggleAll={vi.fn()}
      onViewDetail={vi.fn()}
      hasActiveFilters={false}
      onClearFilters={vi.fn()}
      onChooseFiles={vi.fn()}
      onUpdateEmail={onUpdateEmail}
    />,
  );
  return onUpdateEmail;
}

describe('dòng đang sàng (Analyzing/Filtered)', () => {
  it('MỘT ô gộp có spinner + trạng thái (không skeleton từng ô), hiện email đã tách, KHÔNG có ô nhập/Lưu email, không tick/mở chi tiết được', () => {
    renderTable([analyzing('a'), { ...analyzing('f'), status: 'Filtered' }]);

    const rows = screen.getAllByTestId('candidate-analyzing-row');
    expect(rows).toHaveLength(2);
    const first = within(rows[0]);
    expect(rows[0].querySelectorAll('[data-slot="skeleton"]').length).toBe(0);
    expect(rows[0].querySelector('.animate-spin')).toBeTruthy();
    // điểm + kỹ năng + trạng thái gộp làm một ô ⇒ tổng số ô = 7 cột − 2
    expect(rows[0].querySelectorAll('td').length).toBe(5);
    expect(rows[0].querySelector('td[colspan="3"]')).toBeTruthy();
    expect(first.getByText('a@x.com')).toBeTruthy();
    expect(first.getByText('employer.campaigns.screening.status.Analyzing')).toBeTruthy();
    expect(first.queryByRole('textbox')).toBeNull();
    expect(first.queryByText('employer.campaigns.screening.ranking.saveEmail')).toBeNull();
    expect((first.getByRole('checkbox') as HTMLInputElement).disabled).toBe(true);
    expect((first.getByRole('button', { name: 'employer.campaigns.screening.ranking.viewDetail' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText('—')).toBeNull();
  });

  it('dòng đã phân tích vẫn là dòng thường (điểm, kỹ năng, mở chi tiết được)', () => {
    renderTable([analyzed('z'), analyzing('a')]);
    expect(screen.getAllByTestId('candidate-analyzing-row')).toHaveLength(1);
    expect(screen.getByText('80%')).toBeTruthy();
    expect(screen.getByText('PHP')).toBeTruthy();
    const buttons = screen.getAllByRole('button', { name: 'employer.campaigns.screening.ranking.viewDetail' }) as HTMLButtonElement[];
    expect(buttons.map((b) => b.disabled)).toEqual([false, true]);
  });
});

describe('ô email', () => {
  it('có email ⇒ hiện chữ + nút sửa, KHÔNG có ô nhập thường trực', () => {
    render(<CandidateEmailCell candidate={analyzed('a')} onUpdateEmail={vi.fn(async () => undefined)} updating={false} />);
    expect(screen.getByText('a@x.com')).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByText('employer.campaigns.screening.ranking.saveEmail')).toBeNull();
    expect(screen.getByRole('button', { name: 'employer.campaigns.screening.ranking.editEmail' })).toBeTruthy();
  });

  it('chưa có email ⇒ "Chưa có email" + nút Thêm email; bấm ⇒ ô nhập; lưu ⇒ gọi API rồi đóng', async () => {
    const onUpdateEmail = vi.fn(async () => undefined);
    render(<CandidateEmailCell candidate={analyzed('a', null)} onUpdateEmail={onUpdateEmail} updating={false} />);
    expect(screen.getByText('employer.campaigns.screening.ranking.noEmail')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.screening.ranking.addEmail' }));

    const input = screen.getByRole('textbox') as HTMLInputElement;
    const save = screen.getByText('employer.campaigns.screening.ranking.saveEmail').closest('button') as HTMLButtonElement;
    expect(save.disabled).toBe(true);                       // chưa gõ gì ⇒ không lưu
    fireEvent.change(input, { target: { value: 'new@x.com' } });
    expect(save.disabled).toBe(false);
    fireEvent.click(save);
    expect(onUpdateEmail).toHaveBeenCalledWith('a', 'new@x.com');
    await screen.findByRole('button', { name: 'employer.campaigns.screening.ranking.addEmail' });   // đã đóng ô nhập
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('Huỷ ⇒ đóng ô nhập, không gọi API', () => {
    const onUpdateEmail = vi.fn(async () => undefined);
    render(<CandidateEmailCell candidate={analyzed('a')} onUpdateEmail={onUpdateEmail} updating={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.screening.ranking.editEmail' }));
    expect(screen.getByRole('textbox')).toBeTruthy();
    fireEvent.click(screen.getByText('employer.campaigns.screening.ranking.cancelEmail'));
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(onUpdateEmail).not.toHaveBeenCalled();
  });

  it('không có quyền sửa (onUpdateEmail vắng) ⇒ chỉ chữ', () => {
    render(<CandidateEmailCell candidate={analyzed('a')} updating={false} />);
    expect(screen.getByText('a@x.com')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
