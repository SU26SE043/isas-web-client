/* @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useInviteCampaignCandidates } from './useCampaignCandidates';
import { EMPLOYER_CAMPAIGN_INVITATIONS_QUERY_KEY } from './useCampaignInvitations';

const inviteCampaignCandidates = vi.fn();
vi.mock('../services/campaignManagement.service', () => ({
  campaignManagementService: {
    inviteCampaignCandidates: (...a: unknown[]) => inviteCampaignCandidates(...a),
  },
}));

/**
 * SCR1-review — mời từ shortlist tạo `campaign_invitations` THẬT, nên tab "Danh sách lời mời" (query
 * `EMPLOYER_CAMPAIGN_INVITATIONS_QUERY_KEY`) phải được invalidate như danh sách ứng viên. Đo trên dev
 * 14/09: mời xong, tab lời mời vẫn hiện 3 dòng (thiếu người vừa mời) cho tới khi HR bấm "Làm mới".
 */
describe('useInviteCampaignCandidates', () => {
  it('mời xong ⇒ invalidate CẢ danh sách ứng viên LẪN danh sách lời mời của campaign', async () => {
    inviteCampaignCandidates.mockResolvedValue({ invited: [{ candidateId: 'a', invitationId: 'i', email: 'a@x.local' }], failed: [] });
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useInviteCampaignCandidates('c-1'), { wrapper });

    await act(async () => { await result.current.mutateAsync({ candidateIds: ['a'] }); });

    const keys = invalidate.mock.calls.map((call) => JSON.stringify(call[0]?.queryKey));
    expect(keys).toContain(JSON.stringify([...EMPLOYER_CAMPAIGN_INVITATIONS_QUERY_KEY, 'c-1']));
    expect(keys.some((key) => key.includes('"candidates","c-1"'))).toBe(true);
  });
});
