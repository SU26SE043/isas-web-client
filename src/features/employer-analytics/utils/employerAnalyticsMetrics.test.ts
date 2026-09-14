/* @vitest-environment node */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  computePassRate,
  fillAnalyticsBuckets,
  flagLabelKey,
  resolveAnalyticsPeriod,
  toCampaignStatusChip,
} from './employerAnalyticsMetrics';

afterEach(() => vi.useRealTimers());

describe('resolveAnalyticsPeriod — kỳ tính phía client theo UTC', () => {
  // 2026-09-13 10:30 giờ VN (UTC+7) = 03:30Z; ngày UTC vẫn là 13/09.
  const now = new Date('2026-09-13T03:30:00+07:00');

  it('30d: `to` = đầu ngày MAI (UTC, để hôm nay còn trong kỳ), `from` = to − 30 ngày', () => {
    expect(resolveAnalyticsPeriod('30d', now)).toEqual({
      from: '2026-08-14T00:00:00.000Z',
      to: '2026-09-13T00:00:00.000Z',
    });
  });

  it('90d: từ 2026-06-15 tới đầu ngày mai UTC', () => {
    expect(resolveAnalyticsPeriod('90d', now)).toEqual({
      from: '2026-06-15T00:00:00.000Z',
      to: '2026-09-13T00:00:00.000Z',
    });
  });

  it('ytd: từ 1/1 UTC của năm hiện tại', () => {
    expect(resolveAnalyticsPeriod('ytd', now)).toEqual({
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-09-13T00:00:00.000Z',
    });
  });

  it('mốc UTC, không phải giờ máy: 23:30 VN ngày 12/09 vẫn là 16:30Z ngày 12/09 ⇒ to = 13/09', () => {
    expect(resolveAnalyticsPeriod('30d', new Date('2026-09-12T23:30:00+07:00')).to).toBe('2026-09-13T00:00:00.000Z');
    // 06:30 VN ngày 13/09 = 23:30Z ngày 12/09 ⇒ ngày UTC vẫn là 12/09 ⇒ to = 13/09.
    expect(resolveAnalyticsPeriod('30d', new Date('2026-09-13T06:30:00+07:00')).to).toBe('2026-09-13T00:00:00.000Z');
  });

  it('chạy được với đồng hồ giả của hệ thống (page gọi `new Date()`)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-10T12:00:00Z'));
    expect(resolveAnalyticsPeriod('ytd', new Date())).toEqual({
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-02-11T00:00:00.000Z',
    });
  });
});

describe('fillAnalyticsBuckets — điền 0 cho mốc trống', () => {
  const bucket = (periodStart: string, scored: number) => ({
    periodStart, campaignsCreated: 0, invitationsSent: 0, joins: 0, interviewsStarted: 0, scored,
  });

  it('day: đủ mọi ngày trong [from, to), mốc BE (không .000) khớp mốc JS (có .000), sắp tăng dần', () => {
    const filled = fillAnalyticsBuckets(
      [bucket('2026-09-03T00:00:00Z', 2), bucket('2026-09-01T00:00:00Z', 1)],
      '2026-09-01T00:00:00Z',
      '2026-09-05T00:00:00Z',
      'day',
    );
    expect(filled.map((item) => [item.periodStart, item.scored])).toEqual([
      ['2026-09-01T00:00:00Z', 1],
      ['2026-09-02T00:00:00.000Z', 0],
      ['2026-09-03T00:00:00Z', 2],
      ['2026-09-04T00:00:00.000Z', 0],
    ]);
  });

  it('month: lưới bắt đầu từ ĐẦU THÁNG của from, mỗi tháng một mốc, không vượt to', () => {
    const filled = fillAnalyticsBuckets(
      [bucket('2026-08-01T00:00:00Z', 4)],
      '2026-06-15T00:00:00Z',
      '2026-09-13T00:00:00Z',
      'month',
    );
    expect(filled.map((item) => item.periodStart.slice(0, 10))).toEqual(['2026-06-01', '2026-07-01', '2026-08-01', '2026-09-01']);
    expect(filled.map((item) => item.scored)).toEqual([0, 0, 4, 0]);
  });

  it('bucket rỗng đầu vào ⇒ vẫn ra đủ lưới toàn 0 (biểu đồ không nối tắt qua ngày trống)', () => {
    const filled = fillAnalyticsBuckets([], '2026-09-01T00:00:00Z', '2026-09-04T00:00:00Z', 'day');
    expect(filled).toHaveLength(3);
    expect(filled.every((item) => item.scored === 0 && item.joins === 0)).toBe(true);
  });

  it('bucket BE nằm ngoài lưới vẫn giữ, không vứt', () => {
    const filled = fillAnalyticsBuckets([bucket('2026-08-20T00:00:00Z', 9)], '2026-09-01T00:00:00Z', '2026-09-02T00:00:00Z', 'day');
    expect(filled.map((item) => item.scored)).toEqual([9, 0]);
  });

  it('from/to không parse được ⇒ trả nguyên bucket đã sắp, không ném', () => {
    expect(fillAnalyticsBuckets([bucket('2026-09-01T00:00:00Z', 1)], 'nope', 'nope', 'day')).toHaveLength(1);
  });
});

describe('computePassRate — mẫu số CHỈ passed + failed', () => {
  it('12 đạt / 6 không đạt ⇒ 66.7%; undetermined KHÔNG vào mẫu', () => {
    expect(computePassRate(12, 6)).toBe(66.7);
  });
  it('mẫu 0 ⇒ null (hiển thị "—"), không phải 0%', () => {
    expect(computePassRate(0, 0)).toBeNull();
  });
  it('toàn đạt ⇒ 100, toàn rớt ⇒ 0', () => {
    expect(computePassRate(3, 0)).toBe(100);
    expect(computePassRate(0, 3)).toBe(0);
  });
});

describe('toCampaignStatusChip / flagLabelKey', () => {
  it('enum BE → chip dùng chung với danh sách chiến dịch, không phân biệt hoa thường', () => {
    expect(toCampaignStatusChip('Active')).toBe('active');
    expect(toCampaignStatusChip('CLOSED')).toBe('closed');
    expect(toCampaignStatusChip('Archived')).toBe('archived');
    expect(toCampaignStatusChip('Paused')).toBe('paused');
    expect(toCampaignStatusChip('Draft')).toBe('draft');
    expect(toCampaignStatusChip('SomethingNew')).toBe('draft');
  });
  it('cờ đã biết có khoá i18n; cờ lạ ⇒ null để UI in nguyên tên thay vì in khoá thô', () => {
    expect(flagLabelKey('tab_switch')).toBe('employerAnalytics.flags.tab_switch');
    expect(flagLabelKey('Face_Mismatch')).toBe('employerAnalytics.flags.face_mismatch');
    expect(flagLabelKey('weird_new_signal')).toBeNull();
  });
});
