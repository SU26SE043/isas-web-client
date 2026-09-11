import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/shared/languages';
import { campaignManagementService } from '../../services/campaignManagement.service';
import type { CampaignResultItem } from '../../types/campaign.api.types';
import { ClearOverrideDialog } from './ClearOverrideDialog';

afterEach(() => cleanup());

const item = {
  rank: 1,
  candidateId: 'cand-1',
  sessionId: 's1',
  fullName: null,
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

function renderDialog(onClose = vi.fn()) {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
      <LanguageProvider>
        <ClearOverrideDialog open campaignId="c1" item={item} onClose={onClose} />
      </LanguageProvider>
    </QueryClientProvider>,
  );
  return onClose;
}

describe('ClearOverrideDialog', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(campaignManagementService, 'overrideCampaignResult').mockResolvedValue(undefined);
  });

  it('lý do BẮT BUỘC: nút Xóa khoá khi trống / toàn khoảng trắng, mở khi có chữ', () => {
    renderDialog();
    const confirm = screen.getByRole('button', { name: /xóa điều chỉnh/i });
    expect(confirm).toBeDisabled();
    const note = screen.getByLabelText(/Lý do xóa điều chỉnh/i);
    fireEvent.change(note, { target: { value: '   ' } });
    expect(confirm).toBeDisabled();
    expect(screen.getByText('Vui lòng nhập lý do điều chỉnh.')).toBeInTheDocument();
    fireEvent.change(note, { target: { value: 'Nghe lại thấy AI chấm đúng' } });
    expect(confirm).toBeEnabled();
  });

  it('xác nhận → PUT với lý do HR gõ (đã trim), KHÔNG phải câu mẫu; rồi đóng', async () => {
    const onClose = renderDialog();
    fireEvent.change(screen.getByLabelText(/Lý do xóa điều chỉnh/i), { target: { value: '  Nghe lại thấy AI chấm đúng  ' } });
    fireEvent.click(screen.getByRole('button', { name: /xóa điều chỉnh/i }));
    await waitFor(() =>
      expect(campaignManagementService.overrideCampaignResult).toHaveBeenCalledWith('c1', 's1', {
        score: null,
        result: null,
        note: 'Nghe lại thấy AI chấm đúng',
      }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    const [, , payload] = vi.mocked(campaignManagementService.overrideCampaignResult).mock.calls[0];
    expect(payload.note).not.toMatch(/sử dụng lại kết quả AI/);
  });

  it('Hủy → đóng, không gọi API', () => {
    const onClose = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: /^hủy$/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(campaignManagementService.overrideCampaignResult).not.toHaveBeenCalled();
  });
});
