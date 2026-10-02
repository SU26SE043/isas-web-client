import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import type { StartCampaignInterviewResponse } from '../types/campaignCandidate.types';
import { CampaignCandidateError, campaignCandidateService } from './campaignCandidate.service';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { post: vi.fn(), get: vi.fn() },
}));

const mockedApiClient = vi.mocked(apiClient);

function forbiddenResponse(data: Record<string, unknown>) {
  return {
    isAxiosError: true,
    response: { status: 403, data, headers: {} },
  };
}

describe('campaignCandidateService.joinCampaignByToken', () => {
  it('classifies the backend invitation-email mismatch code without relying on 403 alone', async () => {
    mockedApiClient.post.mockRejectedValue(
      forbiddenResponse({ code: 'INVITATION_EMAIL_MISMATCH', message: 'Invitation email does not match current user' }),
    );

    await expect(campaignCandidateService.joinCampaignByToken('invite-token')).rejects.toMatchObject({
      code: 'emailMismatch',
      status: 403,
      apiCode: 'INVITATION_EMAIL_MISMATCH',
    } satisfies Partial<CampaignCandidateError>);
  });

  it('classifies the current Vietnamese backend error message as an email mismatch', async () => {
    mockedApiClient.post.mockRejectedValue(
      forbiddenResponse({ error: 'Email đăng nhập không khớp với email được mời.' }),
    );

    await expect(campaignCandidateService.joinCampaignByToken('invite-token')).rejects.toMatchObject({
      code: 'emailMismatch',
      status: 403,
    } satisfies Partial<CampaignCandidateError>);
  });

  it('keeps other forbidden responses as forbidden', async () => {
    mockedApiClient.post.mockRejectedValue(forbiddenResponse({ code: 'CAMPAIGN_CLOSED', message: 'Campaign closed' }));

    await expect(campaignCandidateService.joinCampaignByToken('invite-token')).rejects.toMatchObject({
      code: 'forbidden',
      status: 403,
      apiCode: 'CAMPAIGN_CLOSED',
    } satisfies Partial<CampaignCandidateError>);
  });
});

/**
 * ATT1-F3 — hợp đồng [C6] [C7] [C8]. Tên khoá JSON đúng từng chữ; field vắng (Backend cũ) ⇒ undefined,
 * KHÔNG điền mặc định (đoán thay server sẽ ẩn/hiện sai trạng thái lượt).
 */
const CMP = 'cmp-att1';

function conflictResponse(data: Record<string, unknown>) {
  return { isAxiosError: true, response: { status: 409, data, headers: {} } };
}

describe('campaignCandidateService — field ATT1 của my-campaigns [C6]', () => {
  it('chi tiết: đọc timeLimitMinutes / maxAttempts / attemptsUsed / lastAttemptAbandoned', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        campaignId: CMP, title: 'ATT1', criteria: [], membershipStatus: 'Joined', interviewStatus: 'NotStarted',
        started: true, sessionId: 's-1', timeLimitMinutes: 45, maxAttempts: 3, attemptsUsed: 1, lastAttemptAbandoned: true,
      },
    });

    const detail = await campaignCandidateService.getMyCampaignById(CMP);

    expect(mockedApiClient.get).toHaveBeenCalledWith(`/api/v1/campaign/my-campaigns/${CMP}`);
    expect(detail).toMatchObject({ timeLimitMinutes: 45, maxAttempts: 3, attemptsUsed: 1, lastAttemptAbandoned: true });
    expect(detail.interviewStatus).toBe('NotStarted');
  });

  it('chi tiết: Backend cũ (field vắng) ⇒ cả bốn field là undefined; timeLimitMinutes null giữ null', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: { campaignId: CMP, title: 'ATT1', criteria: [], membershipStatus: 'Joined', interviewStatus: 'NotStarted', started: false },
    });
    const legacy = await campaignCandidateService.getMyCampaignById(CMP);
    expect(legacy.timeLimitMinutes).toBeUndefined();
    expect(legacy.maxAttempts).toBeUndefined();
    expect(legacy.attemptsUsed).toBeUndefined();
    expect(legacy.lastAttemptAbandoned).toBeUndefined();

    mockedApiClient.get.mockResolvedValueOnce({
      data: { campaignId: CMP, title: 'ATT1', criteria: [], membershipStatus: 'Joined', interviewStatus: 'NotStarted', started: false, timeLimitMinutes: null, maxAttempts: 1, attemptsUsed: 0, lastAttemptAbandoned: false },
    });
    const noLimit = await campaignCandidateService.getMyCampaignById(CMP);
    expect(noLimit.timeLimitMinutes).toBeNull();
    expect(noLimit).toMatchObject({ maxAttempts: 1, attemptsUsed: 0, lastAttemptAbandoned: false });
  });

  it('danh sách: mỗi item đọc đủ bốn field; item thiếu field ⇒ undefined', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: [
        { campaignId: 'a', title: 'A', membershipStatus: 'Joined', interviewStatus: 'NotStarted', timeLimitMinutes: 30, maxAttempts: 2, attemptsUsed: 1, lastAttemptAbandoned: true },
        { campaignId: 'b', title: 'B', membershipStatus: 'Joined', interviewStatus: 'InProgress' },
      ],
      headers: {},
    });

    const page = await campaignCandidateService.getMyCampaigns();

    expect(page.items[0]).toMatchObject({ timeLimitMinutes: 30, maxAttempts: 2, attemptsUsed: 1, lastAttemptAbandoned: true });
    expect(page.items[1].maxAttempts).toBeUndefined();
    expect(page.items[1].attemptsUsed).toBeUndefined();
    expect(page.items[1].timeLimitMinutes).toBeUndefined();
    expect(page.items[1].lastAttemptAbandoned).toBeUndefined();
  });
});

describe('campaignCandidateService.startCampaignInterview — ATT1 [C7] [C8]', () => {
  it('đọc attemptNo + timeLimitMinutes; Backend cũ ⇒ undefined', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { sessionId: 's-2', campaignId: CMP, questions: [], antiCheatEnabled: true, faceEnrollRequired: false, adaptiveEnabled: false, deadlineAt: '2099-01-01T00:00:00Z', attemptNo: 2, timeLimitMinutes: 30 },
    });
    await expect(campaignCandidateService.startCampaignInterview(CMP)).resolves.toMatchObject({ attemptNo: 2, timeLimitMinutes: 30 });

    mockedApiClient.post.mockResolvedValueOnce({
      data: { sessionId: 's-3', campaignId: CMP, questions: [], antiCheatEnabled: false, faceEnrollRequired: false, adaptiveEnabled: false },
    });
    const legacy = await campaignCandidateService.startCampaignInterview(CMP);
    expect(legacy.attemptNo).toBeUndefined();
    expect(legacy.timeLimitMinutes).toBeUndefined();
  });

  it('[C7] content "" (đề chỉ lộ sau begin) ⇒ GIỮ câu với content "", đủ id/orderNo/timeLimitSec, sắp theo orderNo; câu thiếu id vẫn bỏ', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: {
        sessionId: 's-4', campaignId: CMP, antiCheatEnabled: true, faceEnrollRequired: false, adaptiveEnabled: false, attemptNo: 1, timeLimitMinutes: 30,
        questions: [
          { id: 'q2', orderNo: 2, content: '', timeLimitSec: 90 },
          { id: 'q1', orderNo: 1, content: '', timeLimitSec: 120 },
          { id: '', orderNo: 3, content: '' },
        ],
      },
    });
    const started = await campaignCandidateService.startCampaignInterview(CMP);
    expect(started.questions).toEqual([
      { id: 'q1', orderNo: 1, content: '', timeLimitSec: 120 },
      { id: 'q2', orderNo: 2, content: '', timeLimitSec: 90 },
    ]);
    expectTypeOf<StartCampaignInterviewResponse['questions'][number]['content']>().toEqualTypeOf<string>();
  });

  it('Backend cũ: content có chữ ⇒ trim như trước', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: {
        sessionId: 's-5', campaignId: CMP, antiCheatEnabled: false, faceEnrollRequired: false, adaptiveEnabled: false,
        questions: [{ id: 'q1', orderNo: 1, content: ' Câu 1 ', timeLimitSec: 60 }],
      },
    });
    const started = await campaignCandidateService.startCampaignInterview(CMP);
    expect(started.questions).toEqual([{ id: 'q1', orderNo: 1, content: 'Câu 1', timeLimitSec: 60 }]);
  });

  it('409 ATTEMPT_LIMIT_REACHED ⇒ code attemptLimitReached (đọc code TRƯỚC status)', async () => {
    mockedApiClient.post.mockRejectedValueOnce(
      conflictResponse({ code: 'ATTEMPT_LIMIT_REACHED', error: 'Đã dùng hết lượt.', attemptsUsed: 1, maxAttempts: 1 }),
    );
    await expect(campaignCandidateService.startCampaignInterview(CMP)).rejects.toMatchObject({
      code: 'attemptLimitReached',
      status: 409,
      apiCode: 'ATTEMPT_LIMIT_REACHED',
    } satisfies Partial<CampaignCandidateError>);
  });

  it('409 mã khác vẫn là conflict', async () => {
    mockedApiClient.post.mockRejectedValueOnce(conflictResponse({ code: 'SOMETHING_ELSE', error: 'Xung đột.' }));
    await expect(campaignCandidateService.startCampaignInterview(CMP)).rejects.toMatchObject({ code: 'conflict', status: 409 });
  });
});
