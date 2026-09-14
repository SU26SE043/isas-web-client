import { describe, expect, it } from 'vitest';
import type { EmployerCampaign } from '@/features/employer-campaigns/types/campaignManagement.types';
import { computeEmployerNextStep, recentCampaigns } from './employerNextStep';

function campaign(partial: Partial<EmployerCampaign> & Pick<EmployerCampaign, 'id' | 'status'>): EmployerCampaign {
  return { title: partial.id, updatedAt: '2026-09-01T00:00:00Z', createdAt: '2026-09-01T00:00:00Z', ...partial } as EmployerCampaign;
}

describe('computeEmployerNextStep — tính từ tín hiệu thật', () => {
  it('chưa có chiến dịch → tạo chiến dịch đầu tiên (kể cả khi ví trống)', () => {
    expect(computeEmployerNextStep([], 0, true).kind).toBe('createFirst');
  });
  it('ví trả trước = 0 → nạp credit; trả sau (periodUsage 0) KHÔNG bị coi là hết credit', () => {
    const list = [campaign({ id: 'a', status: 'active', invitedCount: 3 })];
    expect(computeEmployerNextStep(list, 0, true).kind).toBe('buyCredits');
    expect(computeEmployerNextStep(list, 0, false).kind).toBe('viewResults');
  });
  it('chưa đọc được ví (null) → không kết luận "hết credit"', () => {
    const list = [campaign({ id: 'a', status: 'active', invitedCount: 3 })];
    expect(computeEmployerNextStep(list, null, true).kind).toBe('viewResults');
  });
  it('có chiến dịch đang mở mà 0 lời mời → mời ứng viên vào ĐÚNG chiến dịch đó (nháp không tính)', () => {
    const list = [
      campaign({ id: 'draft', status: 'draft', invitedCount: 0 }),
      campaign({ id: 'open', title: 'Backend .NET', status: 'active', invitedCount: 0 }),
    ];
    const step = computeEmployerNextStep(list, 5, true);
    expect(step).toEqual({ kind: 'invite', to: '/employer/campaigns/open/invitations', campaignTitle: 'Backend .NET' });
  });
});

describe('recentCampaigns', () => {
  it('5 chiến dịch cập nhật gần nhất, mới trước', () => {
    const list = Array.from({ length: 7 }, (_, i) => campaign({ id: `c${i}`, status: 'active', updatedAt: `2026-09-0${i + 1}T00:00:00Z` }));
    expect(recentCampaigns(list).map((c) => c.id)).toEqual(['c6', 'c5', 'c4', 'c3', 'c2']);
  });
});
