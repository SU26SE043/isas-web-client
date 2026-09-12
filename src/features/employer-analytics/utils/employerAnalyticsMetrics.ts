import type { EmployerCampaignStatus } from '@/features/employer-campaigns/types/campaignManagement.types';
import type {
  EmployerAnalyticsBucket,
  EmployerAnalyticsGranularity,
  EmployerAnalyticsPreset,
} from '../types/employerAnalytics.types';

const DAY_MS = 24 * 60 * 60 * 1000;
const PRESET_DAYS: Record<Exclude<EmployerAnalyticsPreset, 'ytd'>, number> = { '30d': 30, '90d': 90 };

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Kỳ tính phía client theo UTC (BE so `[from, to)` trên timestamptz). `to` = đầu ngày MAI (UTC) để hôm nay
 * còn nằm trong kỳ; `30d` = 30 ngày kể cả hôm nay; `ytd` = từ 1/1 UTC năm nay.
 */
export function resolveAnalyticsPeriod(preset: EmployerAnalyticsPreset, now: Date) {
  const to = new Date(startOfUtcDay(now).getTime() + DAY_MS);
  const from = preset === 'ytd'
    ? new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
    : new Date(to.getTime() - PRESET_DAYS[preset] * DAY_MS);
  return { from: from.toISOString(), to: to.toISOString() };
}

function truncate(date: Date, granularity: EmployerAnalyticsGranularity) {
  return granularity === 'month'
    ? new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
    : startOfUtcDay(date);
}

function step(date: Date, granularity: EmployerAnalyticsGranularity) {
  return granularity === 'month'
    ? new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1))
    : new Date(date.getTime() + DAY_MS);
}

const EMPTY_BUCKET = { campaignsCreated: 0, invitationsSent: 0, joins: 0, interviewsStarted: 0, scored: 0 };

/**
 * BE không trả bucket rỗng ⇒ FE điền 0 cho mọi mốc trong `[from, to)` theo granularity, để đường biểu đồ
 * không "nối tắt" qua những ngày không có gì (nối tắt trông như có hoạt động). Bucket BE trả ngoài lưới
 * (nếu có) vẫn giữ. So mốc theo epoch-ms vì BE viết `…T00:00:00Z` còn JS viết `…T00:00:00.000Z`.
 */
export function fillAnalyticsBuckets(
  buckets: EmployerAnalyticsBucket[],
  from: string,
  to: string,
  granularity: EmployerAnalyticsGranularity,
): EmployerAnalyticsBucket[] {
  const fromMs = Date.parse(from);
  const toMs = Date.parse(to);
  const byStart = new Map<number, EmployerAnalyticsBucket>();
  for (const bucket of buckets) {
    const ms = Date.parse(bucket.periodStart);
    if (Number.isFinite(ms)) byStart.set(ms, bucket);
  }
  if (Number.isFinite(fromMs) && Number.isFinite(toMs)) {
    for (let cursor = truncate(new Date(fromMs), granularity); cursor.getTime() < toMs; cursor = step(cursor, granularity)) {
      const ms = cursor.getTime();
      if (!byStart.has(ms)) byStart.set(ms, { periodStart: cursor.toISOString(), ...EMPTY_BUCKET });
    }
  }
  return [...byStart.entries()].sort(([a], [b]) => a - b).map(([, bucket]) => bucket);
}

/**
 * Tỷ lệ đạt = passed / (passed + failed). `undetermined` (ngưỡng null) KHÔNG vào mẫu số — cộng vào là
 * phạt chiến dịch chưa đặt ngưỡng. Mẫu 0 ⇒ `null` (hiển thị "—"), không phải 0%.
 */
export function computePassRate(passed: number, failed: number): number | null {
  const sample = passed + failed;
  if (sample <= 0) return null;
  return Math.round((passed / sample) * 1000) / 10;
}

/** Enum `CampaignStatus` phía BE → chip trạng thái dùng chung với danh sách chiến dịch. */
export function toCampaignStatusChip(status: string): EmployerCampaignStatus {
  const normalized = status.trim().toLowerCase();
  if (normalized === 'active' || normalized === 'open' || normalized === 'published') return 'active';
  if (normalized === 'paused' || normalized === 'pause') return 'paused';
  if (normalized === 'archived') return 'archived';
  if (normalized === 'closed' || normalized === 'ended') return 'closed';
  return 'draft';
}

const KNOWN_SIGNALS = new Set([
  'tab_switch', 'paste', 'focus_lost', 'camera_blocked', 'monitoring_gap',
  'face_mismatch', 'no_face', 'multiple_faces', 'multi_voice', 'identity_unverified',
  'fullscreen_exit',
]);

/** Khoá i18n cho loại cờ đã biết; loại lạ trả `null` để UI in nguyên `signalType` thay vì in khoá thô. */
export function flagLabelKey(signalType: string): string | null {
  const normalized = signalType.trim().toLowerCase();
  return KNOWN_SIGNALS.has(normalized) ? `employerAnalytics.flags.${normalized}` : null;
}
