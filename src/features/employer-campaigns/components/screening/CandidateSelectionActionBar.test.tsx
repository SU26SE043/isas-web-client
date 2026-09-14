/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { CandidateSelectionActionBar } from './CandidateSelectionActionBar';

const mutateAsync = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('@/shared/languages', () => ({
  // t trả về key, trừ mẫu có placeholder để kiểm được lý do thất bại đi vào toast.
  useLanguage: () => ({
    t: (key: string) =>
      key === 'employer.campaigns.screening.invitation.failedReason'
        ? '{{candidate}}: {{reason}}'
        : key === 'employer.campaigns.screening.ranking.selected'
          ? 'Đã chọn {count} ứng viên' // NGUYÊN VĂN khoá thật: placeholder MỘT ngoặc
          : key,
    language: 'vi' as const,
  }),
}));
vi.mock('react-hot-toast', () => ({
  default: { success: (...a: unknown[]) => toastSuccess(...a), error: (...a: unknown[]) => toastError(...a) },
}));
vi.mock('../../hooks/useCampaignCandidates', () => ({
  useInviteCampaignCandidates: () => ({ isPending: false, mutateAsync }),
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

const c = (id: string, email: string | null = `${id}@x.local`): CampaignCandidateListItem =>
  ({ id, email, status: 'Analyzed', overallMatchScore: 70 }) as CampaignCandidateListItem;

/**
 * SCR1-F3 — nút "Mời N ứng viên đã chọn" phải gọi POST /candidates/invite {candidateIds} rồi
 * REFETCH danh sách (trạng thái → Invited hiện ngay), không còn đường chép email sang tab mời.
 * Trước bản này component không có test ⇒ mutation "bỏ refetch" chạy qua xanh — bịt ở đây.
 */
describe('CandidateSelectionActionBar', () => {
  it('dòng "Đã chọn N ứng viên" nội suy đúng — khoá i18n dùng {count} MỘT ngoặc, không phải {{count}}', () => {
    // Trước bản này code replace('{{count}}') trên khoá '{count}' ⇒ HR thấy nguyên văn "Đã chọn {count} ứng viên"
    // (đo trên dev 14/09). Không lỗi, không cảnh báo; check:i18n không bắt vì nó chỉ so khoá giữa 2 ngôn ngữ.
    render(
      <CandidateSelectionActionBar campaignId="c-1" candidates={[c('a'), c('b')]} selectedIds={new Set(['a', 'b'])}
        isActive onClear={vi.fn()} onRefetch={vi.fn().mockResolvedValue(undefined)} />,
    );
    expect(screen.getByText('Đã chọn 2 ứng viên')).toBeInTheDocument();
    expect(screen.queryByText(/\{count\}/)).toBeNull();
  });

  it('Active: bấm mời ⇒ mutate đúng candidateIds, toast, clear, REFETCH', async () => {
    mutateAsync.mockResolvedValue({ invited: [{ candidateId: 'a', invitationId: 'i', email: 'a@x.local' }], failed: [] });
    const onClear = vi.fn(); const onRefetch = vi.fn().mockResolvedValue(undefined);
    render(
      <CandidateSelectionActionBar campaignId="c-1" candidates={[c('a'), c('b')]} selectedIds={new Set(['a'])}
        isActive onClear={onClear} onRefetch={onRefetch} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.screening.invitation.inviteSelected' }));
    await waitFor(() => expect(onRefetch).toHaveBeenCalledTimes(1));
    expect(mutateAsync).toHaveBeenCalledWith({ candidateIds: ['a'] });
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledTimes(1);
  });

  it('failed[] ⇒ toast lỗi nêu lý do từng người, vẫn refetch', async () => {
    mutateAsync.mockResolvedValue({ invited: [], failed: [{ candidateId: 'b', reason: 'Thiếu email' }] });
    const onRefetch = vi.fn().mockResolvedValue(undefined);
    render(
      <CandidateSelectionActionBar campaignId="c-1" candidates={[c('b', null)]} selectedIds={new Set(['b'])}
        isActive onClear={vi.fn()} onRefetch={onRefetch} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.screening.invitation.inviteSelected' }));
    await waitFor(() => expect(onRefetch).toHaveBeenCalledTimes(1));
    expect(toastError).toHaveBeenCalledTimes(1);
    expect(String(toastError.mock.calls[0][0])).toContain('Thiếu email');
  });

  it('Draft (không onAddCandidates): nút mời disabled + lý do "triển khai trước", KHÔNG gọi API', () => {
    render(
      <CandidateSelectionActionBar campaignId="c-1" candidates={[c('a')]} selectedIds={new Set(['a'])}
        isActive={false} onClear={vi.fn()} onRefetch={vi.fn()} />,
    );
    const btn = screen.getByRole('button', { name: 'employer.campaigns.screening.invitation.inviteSelected' });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(screen.getByText('employer.campaigns.screening.invitation.draftDisabled')).toBeInTheDocument();
  });

  it('Wizard (onAddCandidates): bấm ⇒ đưa vào danh sách mời, KHÔNG gọi API', () => {
    const onAdd = vi.fn();
    render(
      <CandidateSelectionActionBar campaignId="c-1" candidates={[c('a')]} selectedIds={new Set(['a'])}
        isActive={false} onClear={vi.fn()} onRefetch={vi.fn()} onAddCandidates={onAdd} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.screening.invitation.addToList' }));
    expect(onAdd).toHaveBeenCalledWith([expect.objectContaining({ id: 'a' })]);
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
