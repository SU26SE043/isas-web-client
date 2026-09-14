/* @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { employerAnalyticsService } from '../services/employerAnalytics.service';
import { ANALYTICS_RISKS, ANALYTICS_SCORE_BANDS, buildEmployerAnalyticsParams, parseEmployerAnalytics } from './employerAnalyticsApi';
import { buildAnalyticsPayload } from './employerAnalyticsTestFixture';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: vi.fn() },
}));

const mockedApi = vi.mocked(apiClient);

describe('employer analytics service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('gọi ĐÚNG đường gateway `/api/v1/campaign/analytics` với from/to đã trim + groupBy', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: buildAnalyticsPayload() });

    await expect(employerAnalyticsService.getEmployerAnalytics({
      from: ' 2026-08-14T00:00:00.000Z ',
      to: ' 2026-09-13T00:00:00.000Z ',
      groupBy: 'month',
    })).resolves.toMatchObject({
      campaigns: { total: 23 },
      interviews: { medianScore: 55.5, passed: 12 },
      buckets: [{ invitationsSent: 3 }, { invitationsSent: 5 }],
    });
    expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/campaign/analytics', {
      params: { from: '2026-08-14T00:00:00.000Z', to: '2026-09-13T00:00:00.000Z', groupBy: 'month' },
    });
  });

  it('bỏ tham số rỗng để BE dùng mặc định', () => {
    expect(buildEmployerAnalyticsParams({ from: ' ', to: '' })).toEqual({});
  });
});

describe('parseEmployerAnalytics — phòng thủ theo hợp đồng', () => {
  it('round-trip payload đúng hợp đồng, giữ nguyên số và thứ tự', () => {
    const parsed = parseEmployerAnalytics(buildAnalyticsPayload());
    expect(parsed.screening.topSkills).toEqual([{ skill: 'SQL', count: 12 }, { skill: 'React', count: 9 }]);
    expect(parsed.interviews.flagsBySignal[0]).toEqual({ signalType: 'tab_switch', count: 7 });
    expect(parsed.perCampaign[1]).toMatchObject({ campaignId: 'c-2', title: '', medianScore: null });
    expect(parsed.invitations).toEqual({ total: 50, queued: 1, sent: 40, joined: 30, expired: 5, revoked: 4 });
  });

  it('thiếu khối bắt buộc ⇒ NÉM, không rơi về 0 im lặng', () => {
    const { interviews: _omit, ...withoutInterviews } = buildAnalyticsPayload();
    expect(() => parseEmployerAnalytics(withoutInterviews)).toThrow(/missing interviews/);
    const withoutTotal = buildAnalyticsPayload();
    delete (withoutTotal.campaigns as { total?: number }).total;
    expect(() => parseEmployerAnalytics(withoutTotal)).toThrow(/invalid total/);
    expect(() => parseEmployerAnalytics({ ...buildAnalyticsPayload(), buckets: null })).toThrow(/missing series buckets/);
    expect(() => parseEmployerAnalytics({ ...buildAnalyticsPayload(), perCampaign: undefined })).toThrow(/perCampaign/);
  });

  it('khoá lệch tên (`scored` → `Scored`) ⇒ NÉM — đúng lớp bug field rụng im lặng ở biên', () => {
    const payload = buildAnalyticsPayload();
    const { scored: value, ...rest } = payload.interviews;
    expect(() => parseEmployerAnalytics({ ...payload, interviews: { ...rest, Scored: value } })).toThrow(/invalid scored/);
  });

  it('đếm âm / không nguyên / chuỗi ⇒ NÉM', () => {
    const negative = buildAnalyticsPayload();
    negative.interviews.passed = -1;
    expect(() => parseEmployerAnalytics(negative)).toThrow(/passed/);
    const fractional = buildAnalyticsPayload();
    fractional.screening.submissions = 1.5;
    expect(() => parseEmployerAnalytics(fractional)).toThrow(/submissions/);
    const text = buildAnalyticsPayload();
    (text.invitations as { sent: unknown }).sent = '40';
    expect(() => parseEmployerAnalytics(text)).toThrow(/sent/);
  });

  it('median: `null` = không có dòng ⇒ giữ null; `undefined`/chuỗi ⇒ NÉM ("không biết" ≠ "không có")', () => {
    const nulls = buildAnalyticsPayload();
    nulls.interviews.medianScore = null as unknown as number;
    nulls.screening.medianFitScore = null as unknown as number;
    const parsed = parseEmployerAnalytics(nulls);
    expect(parsed.interviews.medianScore).toBeNull();
    expect(parsed.screening.medianFitScore).toBeNull();

    const missing = buildAnalyticsPayload();
    delete (missing.interviews as { medianScore?: number }).medianScore;
    expect(() => parseEmployerAnalytics(missing)).toThrow(/medianScore/);
    const text = buildAnalyticsPayload();
    (text.screening as { medianFitScore: unknown }).medianFitScore = '62.5';
    expect(() => parseEmployerAnalytics(text)).toThrow(/medianFitScore/);
  });

  it('band vắng ⇒ điền 0 ĐÚNG THỨ TỰ hợp đồng (5 band), band lạ giữ ở cuối', () => {
    const payload = buildAnalyticsPayload();
    payload.interviews.scoreDistribution = [
      { band: '80-100', count: 3 },
      { band: '40-59', count: 8 },
      { band: '100-120', count: 1 },
    ];
    const parsed = parseEmployerAnalytics(payload);
    expect(parsed.interviews.scoreDistribution.map((band) => band.band)).toEqual([...ANALYTICS_SCORE_BANDS, '100-120']);
    expect(parsed.interviews.scoreDistribution.map((band) => band.count)).toEqual([0, 0, 8, 0, 3, 1]);
  });

  it('risk vắng ⇒ điền 0 theo Low·Medium·High', () => {
    const payload = buildAnalyticsPayload();
    payload.screening.riskBySeverity = [{ risk: 'High', count: 1 }];
    const parsed = parseEmployerAnalytics(payload);
    expect(parsed.screening.riskBySeverity.map((item) => item.risk)).toEqual([...ANALYTICS_RISKS]);
    expect(parsed.screening.riskBySeverity.map((item) => item.count)).toEqual([0, 0, 1]);
  });

  it('band có count sai kiểu ⇒ NÉM chứ không điền 0 (khác với band VẮNG)', () => {
    const payload = buildAnalyticsPayload();
    (payload.screening.fitDistribution[0] as { count: unknown }).count = null;
    expect(() => parseEmployerAnalytics(payload)).toThrow(/count/);
  });

  it('bucket thiếu mốc hay perCampaign thiếu id ⇒ NÉM', () => {
    const noStart = buildAnalyticsPayload();
    delete (noStart.buckets[0] as { periodStart?: string }).periodStart;
    expect(() => parseEmployerAnalytics(noStart)).toThrow(/periodStart/);
    const noId = buildAnalyticsPayload();
    delete (noId.perCampaign[0] as { campaignId?: string }).campaignId;
    expect(() => parseEmployerAnalytics(noId)).toThrow(/campaignId/);
  });
});
