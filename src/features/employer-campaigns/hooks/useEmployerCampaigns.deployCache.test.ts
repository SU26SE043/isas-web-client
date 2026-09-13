import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EmployerCampaign } from '../types/campaignManagement.types';

const deployCampaign = vi.fn();
vi.mock('../services/campaignManagement.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/campaignManagement.service')>();
  return {
    ...actual,
    campaignManagementService: { ...actual.campaignManagementService, deployCampaign },
  };
});

const { CampaignInvitationDeployError } = await import('../services/campaignManagement.service');
const { deployCampaignAndSyncCache, employerCampaignDetailQueryKey, EMPLOYER_CAMPAIGNS_QUERY_KEY } =
  await import('./useEmployerCampaigns');

/**
 * Sau "Triển khai", trang chi tiết đọc cache React Query (staleTime 5 phút). Cache đó được seed
 * lúc tạo NHÁP ⇒ không ghi đè thì HR thấy "Bản nháp" + nút "Triển khai" thứ hai ngay sau khi vừa
 * triển khai xong. Test khoá đúng khe nối đó: cache chi tiết PHẢI mang bản đã deploy.
 */
describe('deployCampaignAndSyncCache', () => {
  const draft = { id: 'c-1', status: 'draft', title: 'Nháp' } as unknown as EmployerCampaign;
  const active = { id: 'c-1', status: 'active', title: 'Nháp' } as unknown as EmployerCampaign;
  let queryClient: QueryClient;

  beforeEach(() => {
    deployCampaign.mockReset();
    queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } } });
    // Mô phỏng wizard đã seed cache từ bước 1 (bản nháp còn "tươi" 5 phút).
    queryClient.setQueryData(employerCampaignDetailQueryKey('c-1'), draft);
    queryClient.setQueryData([...EMPLOYER_CAMPAIGNS_QUERY_KEY, '', 'all'], [draft]);
  });

  it('deploy thành công ⇒ cache chi tiết là bản ĐÃ deploy, danh sách bị đánh dấu stale', async () => {
    deployCampaign.mockResolvedValue({ campaign: active, warnings: [], invitations: null, startNow: 'skipped' });

    const result = await deployCampaignAndSyncCache(queryClient, 'c-1', ['a@x.vn']);

    expect(deployCampaign).toHaveBeenCalledWith('c-1', ['a@x.vn'], undefined);
    expect(result.campaign).toBe(active);
    expect(queryClient.getQueryData(employerCampaignDetailQueryKey('c-1'))).toEqual(active);
    const list = queryClient.getQueryCache().find({ queryKey: [...EMPLOYER_CAMPAIGNS_QUERY_KEY, '', 'all'] });
    expect(list?.isStale()).toBe(true);
  });

  it('publish xong nhưng mời hỏng ⇒ vẫn ghi cache bản Active rồi mới ném lỗi', async () => {
    deployCampaign.mockRejectedValue(new CampaignInvitationDeployError('INVITATIONS_FAILED', active, ['a@x.vn'], 502));

    await expect(deployCampaignAndSyncCache(queryClient, 'c-1', ['a@x.vn'])).rejects.toBeInstanceOf(
      CampaignInvitationDeployError,
    );
    expect(queryClient.getQueryData(employerCampaignDetailQueryKey('c-1'))).toEqual(active);
  });

  // T13 R2 — options đi thẳng xuống service; cache là bản ĐÃ start-now (startsAt=now), không phải bản publish.
  it('startNow=true ⇒ forward options xuống service và cache chi tiết là bản ĐÃ start-now', async () => {
    const startedNow = { id: 'c-1', status: 'active', title: 'Nháp', startsAt: '2026-09-13T10:00:00.000Z' } as unknown as EmployerCampaign;
    deployCampaign.mockResolvedValue({ campaign: startedNow, warnings: [], invitations: null, startNow: 'done' });

    const result = await deployCampaignAndSyncCache(queryClient, 'c-1', [], { startNow: true });

    expect(deployCampaign).toHaveBeenCalledWith('c-1', [], { startNow: true });
    expect(result.startNow).toBe('done');
    expect(queryClient.getQueryData(employerCampaignDetailQueryKey('c-1'))).toEqual(startedNow);
  });

  it('mời hụt SAU start-now ⇒ cache lấy error.campaign — tức bản đã start-now, không phải bản nháp', async () => {
    const startedNow = { id: 'c-1', status: 'active', title: 'Nháp', startsAt: '2026-09-13T10:00:00.000Z' } as unknown as EmployerCampaign;
    deployCampaign.mockRejectedValue(new CampaignInvitationDeployError('INVITATIONS_FAILED', startedNow, ['a@x.vn'], 502));

    await expect(deployCampaignAndSyncCache(queryClient, 'c-1', ['a@x.vn'], { startNow: true })).rejects.toBeInstanceOf(
      CampaignInvitationDeployError,
    );
    expect(queryClient.getQueryData(employerCampaignDetailQueryKey('c-1'))).toEqual(startedNow);
  });

  it('lỗi KHÁC (publish hỏng) ⇒ giữ nguyên cache nháp — không được nói dối là đã mở', async () => {
    deployCampaign.mockRejectedValue(new Error('publish 409'));

    await expect(deployCampaignAndSyncCache(queryClient, 'c-1', [])).rejects.toThrow('publish 409');
    expect(queryClient.getQueryData(employerCampaignDetailQueryKey('c-1'))).toBe(draft);
  });
});

/**
 * Khe nối: helper có test, nhưng nếu trang wizard gọi thẳng service thì helper vô dụng mà không test
 * nào đỏ (lớp lỗ "renderer có test, retry có test, khe giữa chúng thì không" — Q10-M2).
 */
describe('CampaignWizardPage đi qua deployCampaignAndSyncCache', () => {
  const sources = import.meta.glob('/src/features/employer-campaigns/pages/CampaignWizardPage.tsx', {
    query: '?raw', import: 'default', eager: true,
  }) as Record<string, string>;

  it('không gọi campaignManagementService.deployCampaign trực tiếp', () => {
    const [source] = Object.values(sources);
    expect(source).toBeDefined();
    expect(source).not.toMatch(/campaignManagementService\.deployCampaign\(/);
    expect(source).toMatch(/deployCampaignAndSyncCache\(queryClient,/);
  });
});
