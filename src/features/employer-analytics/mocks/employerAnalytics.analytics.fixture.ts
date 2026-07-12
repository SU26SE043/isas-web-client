import type { AnalyticsSnapshot } from '../types/employerAnalytics.types';

export const MOCK_ANALYTICS: AnalyticsSnapshot = {
  totalCandidates: 128,
  completionRate: 82,
  averageScore: 78,
  timeToHireDays: 18,
  exportableRows: 128,
  funnel: [
    { stage: 'applied', count: 128 },
    { stage: 'interviewed', count: 94 },
    { stage: 'reviewed', count: 68 },
    { stage: 'shortlisted', count: 18 },
    { stage: 'rejected', count: 50 },
  ],
  scoreDistribution: [
    { band: '90-100', count: 14 },
    { band: '80-89', count: 31 },
    { band: '70-79', count: 38 },
    { band: '60-69', count: 28 },
    { band: '<60', count: 17 },
  ],
  topSkills: [
    { skill: 'React', demand: 92, averageScore: 81 },
    { skill: 'TypeScript', demand: 84, averageScore: 79 },
    { skill: 'Testing', demand: 67, averageScore: 76 },
    { skill: 'Accessibility', demand: 48, averageScore: 83 },
  ],
  weeklyTrend: [
    { week: 'W27', completed: 18, shortlisted: 3 },
    { week: 'W28', completed: 24, shortlisted: 5 },
    { week: 'W29', completed: 31, shortlisted: 6 },
    { week: 'W30', completed: 21, shortlisted: 4 },
  ],
};
