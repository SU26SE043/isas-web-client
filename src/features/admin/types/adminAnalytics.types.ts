export type AdminAnalyticsGranularity = 'day' | 'month';

export interface AdminAnalyticsParams {
  from?: string;
  to?: string;
  groupBy?: AdminAnalyticsGranularity;
}

export interface AdminAnalyticsRoleTotal {
  role: string;
  count: number;
}

export interface AdminAnalyticsBucket {
  periodStart: string;
  newUsers: number;
  logins: number;
  distinctUsers: number;
}

export interface AdminAnalytics {
  from: string;
  to: string;
  granularity: string;
  totals: {
    totalUsers: number;
    newUsers: number;
    bannedUsers: number;
    totalOrganizations: number;
    byRole: AdminAnalyticsRoleTotal[];
  };
  activeUsers: {
    last7Days: number;
    last30Days: number;
  };
  buckets: AdminAnalyticsBucket[];
}
