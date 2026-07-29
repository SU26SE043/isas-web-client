import { unwrapAuthPayload } from '@/shared/api/authPayload';
import type {
  AdminAnalytics,
  AdminAnalyticsParams,
  AdminAnalyticsRoleTotal,
} from '../types/adminAnalytics.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredRecord(record: Record<string, unknown>, key: string) {
  const value = asRecord(record[key]);
  if (!value) throw new Error(`Admin analytics missing ${key}`);
  return value;
}

function requiredString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Admin analytics missing ${key}`);
  }
  return value.trim();
}

function nonNegativeInteger(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new Error(`Admin analytics has invalid ${key}`);
  }
  return value;
}

function parseRoleTotal(value: unknown): AdminAnalyticsRoleTotal {
  const record = asRecord(value);
  if (!record) throw new Error('Admin analytics has invalid role total');
  return {
    role: requiredString(record, 'role'),
    count: nonNegativeInteger(record, 'count'),
  };
}

export function parseAdminAnalytics(data: unknown): AdminAnalytics {
  const payload = asRecord(unwrapAuthPayload<unknown>(data));
  if (!payload) throw new Error('Invalid Admin analytics response');
  const totals = requiredRecord(payload, 'totals');
  const activeUsers = requiredRecord(payload, 'activeUsers');
  const byRole = totals.byRole;
  const buckets = payload.buckets;
  if (!Array.isArray(byRole) || !Array.isArray(buckets)) {
    throw new Error('Admin analytics response missing series');
  }

  return {
    from: requiredString(payload, 'from'),
    to: requiredString(payload, 'to'),
    granularity: requiredString(payload, 'granularity'),
    totals: {
      totalUsers: nonNegativeInteger(totals, 'totalUsers'),
      newUsers: nonNegativeInteger(totals, 'newUsers'),
      bannedUsers: nonNegativeInteger(totals, 'bannedUsers'),
      totalOrganizations: nonNegativeInteger(totals, 'totalOrganizations'),
      byRole: byRole.map(parseRoleTotal),
    },
    activeUsers: {
      last7Days: nonNegativeInteger(activeUsers, 'last7Days'),
      last30Days: nonNegativeInteger(activeUsers, 'last30Days'),
    },
    buckets: buckets.map((value) => {
      const bucket = asRecord(value);
      if (!bucket) throw new Error('Admin analytics has invalid bucket');
      return {
        periodStart: requiredString(bucket, 'periodStart'),
        newUsers: nonNegativeInteger(bucket, 'newUsers'),
        logins: nonNegativeInteger(bucket, 'logins'),
        distinctUsers: nonNegativeInteger(bucket, 'distinctUsers'),
      };
    }),
  };
}

export function buildAdminAnalyticsParams(params: AdminAnalyticsParams) {
  return {
    ...(params.from?.trim() ? { from: params.from.trim() } : {}),
    ...(params.to?.trim() ? { to: params.to.trim() } : {}),
    ...(params.groupBy ? { groupBy: params.groupBy } : {}),
  };
}
