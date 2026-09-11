import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { LanguageProvider } from '@/shared/languages';
import type { CampaignResultItem } from '../../types/campaign.api.types';
import { ResultsRankingTable } from './ResultsRankingTable';

afterEach(() => cleanup());

function row(rank: number, overrides: Partial<CampaignResultItem> = {}): CampaignResultItem {
  return {
    rank,
    candidateId: `cand-${rank}`,
    sessionId: `s-${rank}`,
    fullName: null,
    email: `c${rank}@x.io`,
    totalScore: 35,
    aiScore: 35,
    overrideScore: null,
    overrideResult: null,
    overrideNote: null,
    overriddenAt: null,
    result: 'Fail',
    scoredAt: '2026-09-11T07:01:00Z',
    flags: [],
    seedAnswered: 3,
    seedTotal: 3,
    ...overrides,
  } as CampaignResultItem;
}

const adjusted = row(1, { totalScore: 58, overrideScore: 58, overrideResult: 'Fail', overrideNote: 'Nghe lại câu 2', overriddenAt: '2026-09-11T07:05:00Z' });

function renderTable(items: CampaignResultItem[]) {
  render(
    <LanguageProvider>
      <ResultsRankingTable items={items} onViewDetails={vi.fn()} onOverride={vi.fn()} onClearOverride={vi.fn()} />
    </LanguageProvider>,
  );
  return screen.getByRole('table');
}

/**
 * Bảng từng có 9 cột (Điểm AI + Điều chỉnh đứng riêng dù ô Điểm chính thức đã ghi cả hai) ⇒ tràn khung ở 1440
 * và cột "Thao tác" dính phải ĐÈ lên "Thời gian chấm". Khoá: mỗi thông tin đúng MỘT chỗ trên một hàng.
 */
describe('ResultsRankingTable (desktop) — không lặp thông tin điểm/điều chỉnh', () => {
  it('7 cột: không còn cột "Điểm AI" / "Điều chỉnh" riêng; Thời gian chấm vẫn là cột', () => {
    const table = renderTable([adjusted, row(2)]);
    const headers = within(table).getAllByRole('columnheader').map((th) => th.textContent?.trim());
    expect(headers).toEqual(['Hạng', 'Ứng viên', 'Điểm chính thức', 'Kết quả', 'Cảnh báo', 'Thời gian chấm', 'Thao tác']);
  });

  it('hàng HR đã sửa: điểm AI + số câu gốc trong ô điểm, badge "HR đã điều chỉnh" đúng 1 lần kèm tooltip lý do', () => {
    const table = renderTable([adjusted, row(2)]);
    const rows = within(table).getAllByRole('row').slice(1);
    expect(within(rows[0]).getByText('58%')).toBeInTheDocument();
    expect(within(rows[0]).getByText(/Điểm AI: 35% · 3\/3 câu gốc/)).toBeInTheDocument();
    const badges = within(rows[0]).getAllByText('HR đã điều chỉnh');
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveAttribute('title', expect.stringContaining('Nghe lại câu 2'));
    // Hàng chưa sửa: không badge, không cả chữ "Chưa điều chỉnh" (im lặng = không có gì để nói).
    expect(within(rows[1]).queryByText('HR đã điều chỉnh')).not.toBeInTheDocument();
    expect(within(rows[1]).queryByText('Chưa điều chỉnh')).not.toBeInTheDocument();
  });

  it('nút hành động chính ngắn "Xem chi tiết" (không tràn cột dính)', () => {
    const table = renderTable([row(1)]);
    expect(within(table).getByRole('button', { name: 'Xem chi tiết' })).toBeInTheDocument();
  });
});
