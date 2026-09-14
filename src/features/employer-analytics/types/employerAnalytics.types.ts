/**
 * Hợp đồng `GET /api/v1/campaign/analytics` (phân tích tuyển dụng theo TỔ CHỨC).
 *
 * Stock vs flow: mọi khối `campaigns` / `screening` / `invitations` / `interviews` / `perCampaign` là
 * trạng thái HIỆN TẠI của cả org (không lọc theo kỳ); chỉ `buckets` là dòng chảy trong `[from, to)`.
 */
export type EmployerAnalyticsGranularity = 'day' | 'month';

/** Kỳ do client chọn; `from`/`to` tính phía client (UTC) rồi gửi lên. */
export type EmployerAnalyticsPreset = '30d' | '90d' | 'ytd';

export interface EmployerAnalyticsParams {
  from?: string;
  to?: string;
  groupBy?: EmployerAnalyticsGranularity;
}

export interface EmployerAnalyticsStatusCount {
  /** Enum string phía BE (`CampaignStatus` / `CvSubmissionStatus`). */
  status: string;
  count: number;
}

/** Band điểm: `0-19 · 20-39 · 40-59 · 60-79 · 80-100` (biên dưới bao gồm, 100 rơi vào band cuối). */
export interface EmployerAnalyticsBandCount {
  band: string;
  count: number;
}

export type EmployerAnalyticsRisk = 'Low' | 'Medium' | 'High';

export interface EmployerAnalyticsRiskCount {
  risk: string;
  count: number;
}

export interface EmployerAnalyticsSkillCount {
  skill: string;
  count: number;
}

export interface EmployerAnalyticsSignalCount {
  signalType: string;
  count: number;
}

export interface EmployerAnalyticsBucket {
  periodStart: string;
  campaignsCreated: number;
  invitationsSent: number;
  joins: number;
  interviewsStarted: number;
  scored: number;
}

export interface EmployerAnalyticsCampaignRow {
  campaignId: string;
  title: string;
  status: string;
  createdAt: string;
  invited: number;
  joined: number;
  started: number;
  scored: number;
  passed: number;
  medianScore: number | null;
}

export interface EmployerAnalytics {
  from: string;
  to: string;
  granularity: string;
  campaigns: {
    total: number;
    byStatus: EmployerAnalyticsStatusCount[];
  };
  screening: {
    submissions: number;
    analyzed: number;
    byStatus: EmployerAnalyticsStatusCount[];
    medianFitScore: number | null;
    fitDistribution: EmployerAnalyticsBandCount[];
    riskBySeverity: EmployerAnalyticsRiskCount[];
    topSkills: EmployerAnalyticsSkillCount[];
  };
  invitations: {
    total: number;
    queued: number;
    sent: number;
    joined: number;
    expired: number;
    revoked: number;
  };
  interviews: {
    joined: number;
    started: number;
    inProgress: number;
    completed: number;
    scored: number;
    pendingScore: number;
    passed: number;
    failed: number;
    undetermined: number;
    medianScore: number | null;
    scoreDistribution: EmployerAnalyticsBandCount[];
    flagsBySignal: EmployerAnalyticsSignalCount[];
  };
  buckets: EmployerAnalyticsBucket[];
  perCampaign: EmployerAnalyticsCampaignRow[];
}
