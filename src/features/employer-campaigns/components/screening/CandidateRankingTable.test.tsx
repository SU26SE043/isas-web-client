import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CandidateRankingTable } from './CandidateRankingTable';
import { employerCampaignTranslations } from '../../languages/translations';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ language: 'vi', t }) }));
const t = (key: string) => employerCampaignTranslations.vi[key] ?? key;
const candidate: CampaignCandidateListItem = { id: 'cv-5', fullName: 'Nguyễn An', email: 'an@example.com', status: 'Filtered', mustHaveMet: 1, mustHaveTotal: 2, eligible: false, missingMustHave: ['TypeScript'], verificationRisk: 'High', overallMatchScore: 99 };
function show(items = [candidate], selectedIds = new Set<string>()) {
  const props = { candidates: items, selectedIds, onToggle: vi.fn(), onToggleAll: vi.fn(), onViewDetail: vi.fn(), hasActiveFilters: false, onClearFilters: vi.fn(), onChooseFiles: vi.fn() };
  render(<CandidateRankingTable {...props} />); return props;
}
afterEach(cleanup);
describe('F5 evidence-first screening table', () => {
  it('has exactly the evidence table headers and no ranking column', () => {
    show();
    expect(screen.getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(['', ...['candidate', 'matchScore', 'skills', 'status', 'actions'].map((key) => t(`employer.campaigns.screening.ranking.${key}`))]);
    expect(screen.getByRole('columnheader', { name: 'Đối chiếu nhu cầu' })).toBeInTheDocument();
  });
  it('displays evidence count rather than numerical match score', () => {
    show(); expect(screen.getByText('1/2 có bằng chứng')).toBeVisible();
    expect(screen.queryByText('99')).not.toBeInTheDocument();
    expect(screen.getByLabelText('1/2').firstElementChild).toHaveStyle({ width: '50%' });
  });
  it('combines missing count and named conditions in one line', () => {
    show(); const row = screen.getByText('Nguyễn An').closest('tr')!;
    expect(within(row).getByText('Thiếu 1/2 — TypeScript')).toBeVisible();
    expect(within(row).getAllByText(/Thiếu/)).toHaveLength(1);
    expect(within(row).queryByText('Không đủ điều kiện')).not.toBeInTheDocument();
  });
  it.each([['Low', 'Thấp'], ['Medium', 'Trung bình'], ['High', 'Cao']] as const)('localizes %s verification risk', (risk, label) => {
    show([{ ...candidate, verificationRisk: risk }]);
    expect(screen.getByText(`${t('employer.campaigns.screening.ranking.verificationRisk')}: ${label}`)).toBeVisible();
    expect(screen.queryByText(new RegExp(`: ${risk}$`))).not.toBeInTheDocument();
  });
  it('offers exactly one select-all action and excludes already invited and rejected candidates', () => {
    const props = show([candidate, { ...candidate, id: 'invited', status: 'Invited' }, { ...candidate, id: 'rejected', status: 'Rejected' }]);
    const buttons = screen.getAllByRole('button', { name: t('employer.campaigns.screening.ranking.selectAll') });
    expect(buttons).toHaveLength(1); fireEvent.click(buttons[0]);
    expect(props.onToggleAll).toHaveBeenCalledWith(['cv-5']);
    expect(screen.getAllByRole('checkbox').filter((input) => (input as HTMLInputElement).disabled)).toHaveLength(2);
  });
  it('clears selection when all eligible rows are selected', () => {
    const props = show([candidate], new Set(['cv-5']));
    fireEvent.click(screen.getByRole('button', { name: t('employer.campaigns.screening.ranking.clearSelection') }));
    expect(props.onToggleAll).toHaveBeenCalledWith([]);
  });
});
