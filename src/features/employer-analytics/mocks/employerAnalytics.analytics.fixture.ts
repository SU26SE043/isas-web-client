import type { AnalyticsSnapshot } from '../types/employerAnalytics.types';

export const MOCK_ANALYTICS: AnalyticsSnapshot = {
  totalCandidates: 128,
  completionRate: 82,
  interviewMedianScore: 78,
  screeningMedianScore: null,
  pendingScoreCount: 0,
  timeToHireDays: 18,
  exportableRows: 128,
  funnel: [
    { status: 'invited', count: 22 },
    { status: 'invite_pending', count: 18 },
    { status: 'in_progress', count: 14 },
    { status: 'paused_violation', count: 4 },
    { status: 'auto_submitted', count: 6 },
    { status: 'completed', count: 64 },
  ],
  scoreDistribution: [
    { band: '90-100', count: 14 },
    { band: '80-89', count: 31 },
    { band: '70-79', count: 38 },
    { band: '60-69', count: 28 },
    { band: '<60', count: 17 },
  ],
  topSkills: [
    { skill: 'React', demand: 92, medianScore: 81 },
    { skill: 'TypeScript', demand: 84, medianScore: 79 },
    { skill: 'Testing', demand: 67, medianScore: 76 },
    { skill: 'Accessibility', demand: 48, medianScore: 83 },
  ],
  weeklyTrend: [
    { week: 'W27', completed: 18, shortlisted: 3 },
    { week: 'W28', completed: 24, shortlisted: 5 },
    { week: 'W29', completed: 31, shortlisted: 6 },
    { week: 'W30', completed: 21, shortlisted: 4 },
  ],
};
