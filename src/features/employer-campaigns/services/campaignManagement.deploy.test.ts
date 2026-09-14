import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { campaignManagementEndpoints } from './campaignManagement.endpoints';
import { CampaignInvitationDeployError, campaignManagementService } from './campaignManagement.service';

/**
 * T13 R2 — thứ tự deploy CỐ ĐỊNH publish → start-now → mời, và I7: start-now lỗi KHÔNG phá
 * hai bước kia. Spy thẳng `apiClient.post` để đếm ĐÚNG lời gọi HTTP + thứ tự (không mock method
 * của service — mock ở tầng đó thì "publish → start-now → mời" có thể vẫn xanh khi thứ tự HTTP sai).
 */
const ID = '11111111-2222-4333-8444-555555555555';
const FUTURE = '2099-01-01T02:00:00.000Z';

function campaignBody(overrides: Record<string, unknown> = {}) {
  return {
    id: ID,
    orgId: 'org-1',
    title: 'T13',
    domain: 'Backend',
    status: 'Active',
    language: 'vi',
    maxCandidates: 10,
    timeLimitMinutes: 60,
    startsAt: FUTURE,
    expiresAt: '2099-02-01T02:00:00.000Z',
    jdText: 'jd',
    questions: [],
    criteria: [],
    createdAt: '2098-12-01T00:00:00.000Z',
    updatedAt: '2098-12-01T00:00:00.000Z',
    ...overrides,
  };
}

const paths = () => ({
  publish: campaignManagementEndpoints.publish(ID),
  startNow: campaignManagementEndpoints.startNow(ID),
  invitations: campaignManagementEndpoints.invitations(ID),
});

/** Ghi lại thứ tự url được POST; `handlers` quyết định từng url trả gì / ném gì. */
function installPost(handlers: Partial<Record<'publish' | 'startNow' | 'invitations', () => unknown>>) {
  const calls: string[] = [];
  const p = paths();
  vi.spyOn(apiClient, 'post').mockImplementation(async (url: string) => {
    calls.push(url);
    if (url === p.publish) return { data: (handlers.publish ?? (() => campaignBody()))() } as never;
    if (url === p.startNow) return { data: (handlers.startNow ?? (() => campaignBody({ startsAt: '2026-09-13T10:00:00.000Z' })))() } as never;
    if (url === p.invitations) return { data: (handlers.invitations ?? (() => ({ created: [{ id: 'i1', email: 'a@x.vn' }], failed: [] })))() } as never;
    throw new Error(`unexpected POST ${url}`);
  });
  return { calls, p };
}

afterEach(() => vi.restoreAllMocks());

describe('deployCampaign — thứ tự publish → start-now → mời (T13 R2)', () => {
  it('startNow=false (mặc định) ⇒ đúng 2 lời gọi theo thứ tự publish, invitations; result.startNow = skipped', async () => {
    const { calls, p } = installPost({});
    const result = await campaignManagementService.deployCampaign(ID, ['a@x.vn']);
    expect(calls).toEqual([p.publish, p.invitations]);
    expect(result.startNow).toBe('skipped');
    expect(result.startNowError).toBeUndefined();
    expect(result.campaign.startsAt).toBe(FUTURE);
  });

  it('startNow=true ⇒ 3 lời gọi ĐÚNG THỨ TỰ publish, start-now, invitations; campaign trả về là bản ĐÃ start-now', async () => {
    const { calls, p } = installPost({});
    const result = await campaignManagementService.deployCampaign(ID, ['a@x.vn'], { startNow: true });
    expect(calls).toEqual([p.publish, p.startNow, p.invitations]);
    expect(result.startNow).toBe('done');
    // Bản publish có startsAt=FUTURE; bản start-now đã kéo về 2026-09-13 — result phải mang bản SAU.
    expect(result.campaign.startsAt).toBe('2026-09-13T10:00:00.000Z');
    expect(result.invitations?.created).toHaveLength(1);
  });

  it('I7: start-now NÉM ⇒ KHÔNG throw, vẫn gọi invitations, result.startNow = failed kèm status/message', async () => {
    const { calls, p } = installPost({
      startNow: () => {
        throw Object.assign(new Error('Campaign có khung giờ phỏng vấn'), {
          isAxiosError: true,
          response: { status: 409, data: 'Campaign có khung giờ phỏng vấn' },
        });
      },
    });
    const result = await campaignManagementService.deployCampaign(ID, ['a@x.vn'], { startNow: true });
    expect(calls).toEqual([p.publish, p.startNow, p.invitations]);
    expect(result.startNow).toBe('failed');
    expect(result.startNowError).toEqual({ status: 409, message: 'Campaign có khung giờ phỏng vấn' });
    // Không start-now được ⇒ campaign là bản publish (giờ mở CŨ), không bịa startsAt=now.
    expect(result.campaign.startsAt).toBe(FUTURE);
    expect(result.invitations?.created).toHaveLength(1);
  });

  it('startNow=true + không có email ⇒ publish, start-now, KHÔNG gọi invitations; invitations = null', async () => {
    const { calls, p } = installPost({});
    const result = await campaignManagementService.deployCampaign(ID, [], { startNow: true });
    expect(calls).toEqual([p.publish, p.startNow]);
    expect(result.startNow).toBe('done');
    expect(result.invitations).toBeNull();
  });

  it('mời HỤT sau start-now ⇒ CampaignInvitationDeployError.campaign là bản ĐÃ start-now (cache sync đúng)', async () => {
    const { calls, p } = installPost({
      invitations: () => {
        throw Object.assign(new Error('Invitation service is temporarily unavailable.'), {
          isAxiosError: true,
          response: { status: 502, data: { message: 'down' } },
        });
      },
    });
    const error = await campaignManagementService
      .deployCampaign(ID, ['a@x.vn'], { startNow: true })
      .then(() => null, (err: unknown) => err);
    expect(error).toBeInstanceOf(CampaignInvitationDeployError);
    const deployError = error as CampaignInvitationDeployError;
    expect(deployError.campaign.startsAt).toBe('2026-09-13T10:00:00.000Z');
    expect(deployError.status).toBe(502);
    expect(calls).toEqual([p.publish, p.startNow, p.invitations]);
  });

  it('publish NÉM ⇒ throw ngay, KHÔNG gọi start-now lẫn invitations (không bao giờ start-now trước publish)', async () => {
    const { calls, p } = installPost({
      publish: () => {
        throw Object.assign(new Error('conflict'), { isAxiosError: true, response: { status: 409, data: 'conflict' } });
      },
    });
    await expect(campaignManagementService.deployCampaign(ID, ['a@x.vn'], { startNow: true })).rejects.toThrow('conflict');
    expect(calls).toEqual([p.publish]);
  });
});
