import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/shared/languages';
import type { CampaignResultItem, CampaignResultOverrideHistoryItem } from '../../../types/campaign.api.types';
import { ResultOverrideHistory } from './ResultOverrideHistory';

afterEach(() => cleanup());

const item: CampaignResultItem = {
  rank: 1,
  candidateId: 'cand-1',
  sessionId: 's1',
  fullName: 'Nguyễn Văn A',
  email: 'a@example.com',
  totalScore: 60,
  aiScore: 35,
  overrideScore: 60,
  overrideResult: 'Fail',
  overrideNote: 'Lý do B',
  overriddenAt: '2026-09-11T08:37:19Z',
  result: 'Fail',
  scoredAt: '2026-09-11T08:00:00Z',
  flags: [],
} as CampaignResultItem;

const history: CampaignResultOverrideHistoryItem[] = [
  { id: 'h3', kind: 'Set', score: 60, result: 'Fail', note: 'Lý do B', actorUserId: 'u1', actorEmail: 'hr@isas.local', at: '2026-09-11T08:37:19Z', source: 'Live' },
  { id: 'h2', kind: 'Clear', score: null, result: null, note: 'về AI', actorUserId: 'u1', actorEmail: null, at: '2026-09-11T08:37:10Z', source: 'AuditBackfill' },
  { id: 'h1', kind: 'Set', score: 72, result: 'Pass', note: 'Lý do A', actorUserId: 'u1', actorEmail: null, at: '2026-09-11T08:37:08Z', source: 'AuditBackfill' },
];

function renderHistory(props: Partial<React.ComponentProps<typeof ResultOverrideHistory>> = {}) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <LanguageProvider>
        <ResultOverrideHistory campaignId="c1" item={item} history={history} isLoading={false} isError={false} {...props} />
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe('ResultOverrideHistory', () => {
  it('dòng thu gọn = lần MỚI NHẤT (điểm · kết quả · email · giờ · số lần)', () => {
    renderHistory();
    expect(screen.getByText(/60% · Không đạt · hr@isas.local · .* · 3 lần/)).toBeInTheDocument();
  });

  it('mở lịch sử: mới-nhất-trước, actor null → "Không rõ người sửa" (KHÔNG để trống), dòng Huỷ ghi "về điểm AI", backfill có nhãn', () => {
    renderHistory();
    fireEvent.click(screen.getByRole('button', { name: /xem lịch sử/i }));
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByText('60% · Không đạt')).toBeInTheDocument();
    expect(within(rows[0]).getByText(/hr@isas.local/)).toBeInTheDocument();
    expect(within(rows[1]).getByText('Huỷ điều chỉnh')).toBeInTheDocument();
    expect(within(rows[1]).getByText('về điểm AI 35%')).toBeInTheDocument();
    expect(within(rows[1]).getByText(/Không rõ người sửa/)).toBeInTheDocument();
    expect(within(rows[1]).getByText(/từ nhật ký hệ thống/)).toBeInTheDocument();
    expect(within(rows[2]).getByText('72% · Đạt')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Lý do A')).toBeInTheDocument();
  });

  it('chưa có lần nào: câu "chưa có điều chỉnh — bằng điểm AI (35%)", không nút Xem lịch sử / Xóa', () => {
    renderHistory({
      history: [],
      item: { ...item, totalScore: 35, overrideScore: null, overrideResult: null, overrideNote: null, overriddenAt: null } as CampaignResultItem,
    });
    expect(screen.getByText(/Chưa có điều chỉnh nào — điểm chính thức đang bằng điểm AI \(35%\)/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /xem lịch sử/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /xóa điều chỉnh/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /điều chỉnh kết quả/i })).toBeInTheDocument();
  });

  it('có override → nút Xóa điều chỉnh; bấm Điều chỉnh mở modal', () => {
    renderHistory();
    expect(screen.getByRole('button', { name: /xóa điều chỉnh/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /điều chỉnh kết quả/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('đang tải / lỗi', () => {
    renderHistory({ isLoading: true });
    expect(screen.getByText('Đang tải lịch sử điều chỉnh...')).toBeInTheDocument();
    cleanup();
    renderHistory({ isError: true });
    expect(screen.getByText(/Không thể tải lịch sử điều chỉnh/)).toBeInTheDocument();
  });
});
