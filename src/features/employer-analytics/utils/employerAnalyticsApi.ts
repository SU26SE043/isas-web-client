import type {
  EmployerAnalytics,
  EmployerAnalyticsBandCount,
  EmployerAnalyticsBucket,
  EmployerAnalyticsCampaignRow,
  EmployerAnalyticsParams,
  EmployerAnalyticsRiskCount,
  EmployerAnalyticsSignalCount,
  EmployerAnalyticsSkillCount,
  EmployerAnalyticsStatusCount,
} from '../types/employerAnalytics.types';

/** Thứ tự band theo hợp đồng — BE luôn trả đủ 5, FE vẫn điền 0 cho band vắng (phòng thủ, có test). */
export const ANALYTICS_SCORE_BANDS = ['0-19', '20-39', '40-59', '60-79', '80-100'] as const;
/** Thứ tự rủi ro xác minh theo hợp đồng — luôn đủ 3. */
export const ANALYTICS_RISKS = ['Low', 'Medium', 'High'] as const;

const PREFIX = 'Employer analytics';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function requiredRecord(record: Record<string, unknown>, key: string) {
  const value = asRecord(record[key]);
  if (!value) throw new Error(`${PREFIX} missing ${key}`);
  return value;
}

function requiredArray(record: Record<string, unknown>, key: string): unknown[] {
  const value = record[key];
  if (!Array.isArray(value)) throw new Error(`${PREFIX} missing series ${key}`);
  return value;
}

function requiredString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${PREFIX} missing ${key}`);
  return value.trim();
}

/** Đếm: số nguyên ≥ 0. Thiếu khoá hay sai kiểu ⇒ NÉM — không rơi về 0 im lặng (khoá lệch = mất dữ liệu câm). */
function count(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new Error(`${PREFIX} has invalid ${key}`);
  }
  return value;
}

/** Median: số thực hữu hạn hoặc `null` (0 dòng). `undefined`/chuỗi ⇒ ném, vì "không biết" ≠ "không có". */
function nullableScore(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  if (value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${PREFIX} has invalid ${key}`);
  }
  return value;
}

function parseLabelled<T>(
  items: unknown[],
  labelKey: string,
  build: (label: string, value: number) => T,
): T[] {
  return items.map((item) => {
    const record = asRecord(item);
    if (!record) throw new Error(`${PREFIX} has invalid ${labelKey} entry`);
    return build(requiredString(record, labelKey), count(record, 'count'));
  });
}

/**
 * Điền 0 cho nhãn vắng theo thứ tự hợp đồng; nhãn lạ (nếu BE thêm) giữ lại ở cuối thay vì vứt.
 * Có chủ đích: biểu đồ 5 band phải luôn đủ 5 cột kể cả khi BE bỏ band count 0.
 */
export function fillCanonical<T extends { count: number }>(
  items: T[],
  canonical: readonly string[],
  labelOf: (item: T) => string,
  build: (label: string) => T,
): T[] {
  const byLabel = new Map(items.map((item) => [labelOf(item), item] as const));
  const known = canonical.map((label) => byLabel.get(label) ?? build(label));
  const extra = items.filter((item) => !canonical.includes(labelOf(item)));
  return [...known, ...extra];
}

function parseBands(items: unknown[]): EmployerAnalyticsBandCount[] {
  const parsed = parseLabelled(items, 'band', (band, value) => ({ band, count: value }));
  return fillCanonical(parsed, ANALYTICS_SCORE_BANDS, (item) => item.band, (band) => ({ band, count: 0 }));
}

function parseRisks(items: unknown[]): EmployerAnalyticsRiskCount[] {
  const parsed = parseLabelled(items, 'risk', (risk, value) => ({ risk, count: value }));
  return fillCanonical(parsed, ANALYTICS_RISKS, (item) => item.risk, (risk) => ({ risk, count: 0 }));
}

function parseStatuses(items: unknown[]): EmployerAnalyticsStatusCount[] {
  return parseLabelled(items, 'status', (status, value) => ({ status, count: value }));
}

function parseSkills(items: unknown[]): EmployerAnalyticsSkillCount[] {
  return parseLabelled(items, 'skill', (skill, value) => ({ skill, count: value }));
}

function parseSignals(items: unknown[]): EmployerAnalyticsSignalCount[] {
  return parseLabelled(items, 'signalType', (signalType, value) => ({ signalType, count: value }));
}

function parseBucket(value: unknown): EmployerAnalyticsBucket {
  const bucket = asRecord(value);
  if (!bucket) throw new Error(`${PREFIX} has invalid bucket`);
  return {
    periodStart: requiredString(bucket, 'periodStart'),
    campaignsCreated: count(bucket, 'campaignsCreated'),
    invitationsSent: count(bucket, 'invitationsSent'),
    joins: count(bucket, 'joins'),
    interviewsStarted: count(bucket, 'interviewsStarted'),
    scored: count(bucket, 'scored'),
  };
}

function parseCampaignRow(value: unknown): EmployerAnalyticsCampaignRow {
  const row = asRecord(value);
  if (!row) throw new Error(`${PREFIX} has invalid perCampaign row`);
  return {
    campaignId: requiredString(row, 'campaignId'),
    title: typeof row.title === 'string' ? row.title : '',
    status: requiredString(row, 'status'),
    createdAt: requiredString(row, 'createdAt'),
    invited: count(row, 'invited'),
    joined: count(row, 'joined'),
    started: count(row, 'started'),
    scored: count(row, 'scored'),
    passed: count(row, 'passed'),
    medianScore: nullableScore(row, 'medianScore'),
  };
}

export function parseEmployerAnalytics(data: unknown): EmployerAnalytics {
  const payload = asRecord(data);
  if (!payload) throw new Error(`Invalid ${PREFIX} response`);
  const campaigns = requiredRecord(payload, 'campaigns');
  const screening = requiredRecord(payload, 'screening');
  const invitations = requiredRecord(payload, 'invitations');
  const interviews = requiredRecord(payload, 'interviews');

  return {
    from: requiredString(payload, 'from'),
    to: requiredString(payload, 'to'),
    granularity: requiredString(payload, 'granularity'),
    campaigns: {
      total: count(campaigns, 'total'),
      byStatus: parseStatuses(requiredArray(campaigns, 'byStatus')),
    },
    screening: {
      submissions: count(screening, 'submissions'),
      analyzed: count(screening, 'analyzed'),
      byStatus: parseStatuses(requiredArray(screening, 'byStatus')),
      medianFitScore: nullableScore(screening, 'medianFitScore'),
      fitDistribution: parseBands(requiredArray(screening, 'fitDistribution')),
      riskBySeverity: parseRisks(requiredArray(screening, 'riskBySeverity')),
      topSkills: parseSkills(requiredArray(screening, 'topSkills')),
    },
    invitations: {
      total: count(invitations, 'total'),
      queued: count(invitations, 'queued'),
      sent: count(invitations, 'sent'),
      joined: count(invitations, 'joined'),
      expired: count(invitations, 'expired'),
      revoked: count(invitations, 'revoked'),
    },
    interviews: {
      joined: count(interviews, 'joined'),
      started: count(interviews, 'started'),
      inProgress: count(interviews, 'inProgress'),
      completed: count(interviews, 'completed'),
      scored: count(interviews, 'scored'),
      pendingScore: count(interviews, 'pendingScore'),
      passed: count(interviews, 'passed'),
      failed: count(interviews, 'failed'),
      undetermined: count(interviews, 'undetermined'),
      medianScore: nullableScore(interviews, 'medianScore'),
      scoreDistribution: parseBands(requiredArray(interviews, 'scoreDistribution')),
      flagsBySignal: parseSignals(requiredArray(interviews, 'flagsBySignal')),
    },
    buckets: requiredArray(payload, 'buckets').map(parseBucket),
    perCampaign: requiredArray(payload, 'perCampaign').map(parseCampaignRow),
  };
}

export function buildEmployerAnalyticsParams(params: EmployerAnalyticsParams) {
  return {
    ...(params.from?.trim() ? { from: params.from.trim() } : {}),
    ...(params.to?.trim() ? { to: params.to.trim() } : {}),
    ...(params.groupBy ? { groupBy: params.groupBy } : {}),
  };
}
