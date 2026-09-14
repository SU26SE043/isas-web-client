/** Payload mẫu ĐÚNG hợp đồng `GET /api/v1/campaign/analytics` — dùng chung cho test parser / hook / page / e2e. */
export function buildAnalyticsPayload() {
  return {
    from: '2026-08-14T00:00:00Z',
    to: '2026-09-13T00:00:00Z',
    granularity: 'day',
    campaigns: {
      total: 23,
      byStatus: [
        { status: 'Active', count: 5 },
        { status: 'Draft', count: 12 },
        { status: 'Closed', count: 6 },
      ],
    },
    screening: {
      submissions: 40,
      analyzed: 30,
      byStatus: [
        { status: 'Analyzed', count: 30 },
        { status: 'Filtered', count: 10 },
      ],
      medianFitScore: 62.5,
      fitDistribution: [
        { band: '0-19', count: 1 },
        { band: '20-39', count: 0 },
        { band: '40-59', count: 3 },
        { band: '60-79', count: 5 },
        { band: '80-100', count: 2 },
      ],
      riskBySeverity: [
        { risk: 'Low', count: 10 },
        { risk: 'Medium', count: 4 },
        { risk: 'High', count: 1 },
      ],
      topSkills: [
        { skill: 'SQL', count: 12 },
        { skill: 'React', count: 9 },
      ],
    },
    invitations: { total: 50, queued: 1, sent: 40, joined: 30, expired: 5, revoked: 4 },
    interviews: {
      joined: 30,
      started: 25,
      inProgress: 3,
      completed: 22,
      scored: 20,
      pendingScore: 2,
      passed: 12,
      failed: 6,
      undetermined: 2,
      medianScore: 55.5,
      scoreDistribution: [
        { band: '0-19', count: 0 },
        { band: '20-39', count: 2 },
        { band: '40-59', count: 8 },
        { band: '60-79', count: 7 },
        { band: '80-100', count: 3 },
      ],
      flagsBySignal: [
        { signalType: 'tab_switch', count: 7 },
        { signalType: 'face_mismatch', count: 2 },
        { signalType: 'weird_new_signal', count: 1 },
      ],
    },
    buckets: [
      { periodStart: '2026-08-14T00:00:00Z', campaignsCreated: 1, invitationsSent: 3, joins: 2, interviewsStarted: 2, scored: 1 },
      { periodStart: '2026-09-01T00:00:00Z', campaignsCreated: 0, invitationsSent: 5, joins: 4, interviewsStarted: 3, scored: 2 },
    ],
    perCampaign: [
      {
        campaignId: 'c-1',
        title: 'Backend Engineer',
        status: 'Active',
        createdAt: '2026-09-01T08:00:00Z',
        invited: 5,
        joined: 4,
        started: 3,
        scored: 2,
        passed: 1,
        medianScore: 60,
      },
      {
        campaignId: 'c-2',
        title: '',
        status: 'Draft',
        createdAt: '2026-08-20T08:00:00Z',
        invited: 0,
        joined: 0,
        started: 0,
        scored: 0,
        passed: 0,
        medianScore: null,
      },
    ],
  };
}

export function buildEmptyAnalyticsPayload() {
  const payload = buildAnalyticsPayload();
  return {
    ...payload,
    campaigns: { total: 0, byStatus: [] },
    screening: {
      submissions: 0,
      analyzed: 0,
      byStatus: [],
      medianFitScore: null,
      fitDistribution: payload.screening.fitDistribution.map((band) => ({ ...band, count: 0 })),
      riskBySeverity: payload.screening.riskBySeverity.map((risk) => ({ ...risk, count: 0 })),
      topSkills: [],
    },
    invitations: { total: 0, queued: 0, sent: 0, joined: 0, expired: 0, revoked: 0 },
    interviews: {
      ...payload.interviews,
      joined: 0, started: 0, inProgress: 0, completed: 0, scored: 0, pendingScore: 0,
      passed: 0, failed: 0, undetermined: 0, medianScore: null,
      scoreDistribution: payload.interviews.scoreDistribution.map((band) => ({ ...band, count: 0 })),
      flagsBySignal: [],
    },
    buckets: [],
    perCampaign: [],
  };
}
