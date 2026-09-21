import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { CandidateRankingTable } from './CandidateRankingTable';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

/**
 * Rà UI 21/09 (góc nhìn designer): (1) badge rủi ro "Thấp/Cao" đứng sát "90%" ⇒ HR đọc thành điểm
 * thấp/cao, màu đảo trực giác; (2) bảng 7 cột tràn khung wizard ⇒ "Xem chi tiết" rơi ra ngoài;
 * (3) "Chọn tất cả" xuất hiện HAI lần (nút rời + header cột tick). Các ca dưới khoá bản sửa.
 */
afterEach(() => cleanup());

const analyzed = (id: string, extra: Partial<CampaignCandidateListItem> = {}): CampaignCandidateListItem =>
  ({ id, status: 'Analyzed', fullName: `Tên ${id}`, email: `${id}@x.com`, overallMatchScore: 80, skills: ['PHP'], ...extra });

function renderTable(candidates: CampaignCandidateListItem[], props: Partial<Parameters<typeof CandidateRankingTable>[0]> = {}) {
  const onToggleAll = vi.fn();
  render(
    <CandidateRankingTable
      candidates={candidates}
      selectedIds={new Set()}
      onToggle={vi.fn()}
      onToggleAll={onToggleAll}
      onViewDetail={vi.fn()}
      hasActiveFilters={false}
      onClearFilters={vi.fn()}
      onChooseFiles={vi.fn()}
      {...props}
    />,
  );
  return onToggleAll;
}

describe('cờ xác minh cạnh điểm', () => {
  it('Low ⇒ KHÔNG badge nào; Medium ⇒ "Nên xác minh" (warning); High ⇒ "Cần xác minh" (destructive)', () => {
    renderTable([
      analyzed('low', { verificationRisk: 'Low' }),
      analyzed('mid', { verificationRisk: 'Medium' }),
      analyzed('high', { verificationRisk: 'High' }),
    ]);
    const flags = screen.getAllByTestId('candidate-verify-flag');
    expect(flags).toHaveLength(2);
    expect(flags[0].textContent).toContain('employer.campaigns.screening.ranking.verifyFlag.Medium');
    expect(flags[1].textContent).toContain('employer.campaigns.screening.ranking.verifyFlag.High');
    // mức rủi ro thô ("Thấp"/"Cao") không còn in cạnh điểm
    expect(screen.queryByText('employer.campaigns.screening.verificationRisk.Low')).toBeNull();
    expect(screen.queryByText('employer.campaigns.screening.verificationRisk.High')).toBeNull();
    // tooltip nói rõ đây là RỦI RO XÁC MINH, không phải điểm
    expect(flags[1].getAttribute('title')).toContain('employer.campaigns.screening.ranking.verifyFlagTitle');
  });
});

describe('bảng 5 cột', () => {
  it('header: tick · ứng viên · điểm · kỹ năng · thao tác — không còn cột Xếp hạng/Trạng thái', () => {
    renderTable([analyzed('a')]);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(5);
    expect(headers[0].querySelector('input[type="checkbox"]')).toBeTruthy();
    expect(headers.map((h) => h.textContent)).toEqual([
      '',
      'employer.campaigns.screening.ranking.candidate',
      'employer.campaigns.screening.ranking.matchScore',
      'employer.campaigns.screening.ranking.skills',
      'employer.campaigns.screening.ranking.actions',
    ]);
  });

  it('hạng nằm trong ô ứng viên dạng "#1", trạng thái "Đã phân tích" KHÔNG in, trạng thái khác thì in dưới tên', () => {
    renderTable([analyzed('a'), analyzed('b', { status: 'Invited' })]);
    const ranks = screen.getAllByTestId('candidate-rank');
    expect(ranks.map((r) => r.textContent)).toEqual(['#1', '#2']);
    expect(ranks[0].closest('td')?.textContent).toContain('Tên a');
    expect(screen.queryByText('employer.campaigns.screening.status.Analyzed')).toBeNull();
    const invited = screen.getByText('employer.campaigns.screening.status.Invited');
    expect(invited.closest('td')?.textContent).toContain('Tên b');
  });

  it('ô kỹ năng in tối đa 3 + "+N"', () => {
    renderTable([analyzed('a', { skills: ['PHP', 'MySQL', 'Redis', 'Docker', 'Kafka'] })]);
    const cell = screen.getByText(/PHP, MySQL, Redis/).closest('td')!;
    expect(cell.textContent).not.toContain('Docker');
    expect(within(cell).getByTestId('candidate-more-skills').textContent).toBe('employer.campaigns.screening.ranking.moreSkills');
  });

  it('nhóm (khi có điều kiện bắt buộc) trải đủ 5 cột', () => {
    renderTable([analyzed('a', { mustHaveTotal: 1, mustHaveMet: 1, eligible: true }), analyzed('b', { mustHaveTotal: 1, mustHaveMet: 0, eligible: false })]);
    const headerCells = screen.getAllByRole('cell').filter((c) => c.getAttribute('colspan'));
    expect(headerCells.map((c) => c.getAttribute('colspan'))).toEqual(['5', '5']);
  });
});

describe('chọn tất cả — chỉ MỘT chỗ', () => {
  it('không còn nút "Chọn tất cả" rời; checkbox header chọn/bỏ toàn bộ dòng chọn được', () => {
    const onToggleAll = renderTable([analyzed('a'), analyzed('b'), analyzed('c', { email: null })], { selectedIds: new Set(['a']) });
    expect(screen.queryByRole('button', { name: 'employer.campaigns.screening.ranking.selectAll' })).toBeNull();
    expect(screen.getByText('employer.campaigns.screening.ranking.selectHint')).toBeTruthy();

    const header = screen.getByRole('checkbox', { name: 'employer.campaigns.screening.ranking.selectAll' }) as HTMLInputElement;
    expect(header.indeterminate).toBe(true);           // 1/2 chọn được đang tick
    fireEvent.click(header);
    expect(onToggleAll).toHaveBeenCalledWith(['a', 'b']);   // c không có email ⇒ không chọn được
  });

  it('đã tick hết ⇒ checkbox header đọc là "Bỏ chọn tất cả" và bấm ⇒ []', () => {
    const onToggleAll = renderTable([analyzed('a'), analyzed('b')], { selectedIds: new Set(['a', 'b']) });
    const header = screen.getByRole('checkbox', { name: 'employer.campaigns.screening.ranking.clearSelection' }) as HTMLInputElement;
    expect(header.checked).toBe(true);
    expect(header.indeterminate).toBe(false);
    fireEvent.click(header);
    expect(onToggleAll).toHaveBeenCalledWith([]);
  });

  it('toàn dòng đang phân tích ⇒ checkbox header bị vô hiệu', () => {
    renderTable([{ id: 'p', status: 'Analyzing', fullName: null, email: 'p@x.com', overallMatchScore: null, skills: null }]);
    const header = screen.getByRole('checkbox', { name: 'employer.campaigns.screening.ranking.selectAll' }) as HTMLInputElement;
    expect(header.disabled).toBe(true);
  });
});
