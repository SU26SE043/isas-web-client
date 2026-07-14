export type ProgressTimeRange = '7d' | '30d' | '90d' | '6m' | '1y' | 'all';

export type ProgressDomainId =
  | 'all'
  | 'frontend'
  | 'backend'
  | 'mobile'
  | 'devops'
  | 'data'
  | 'ai'
  | 'qa'
  | 'uiux'
  | 'ba'
  | 'pm';

export type ProgressTrendDirection = 'increasing' | 'stable' | 'decreasing';

export type ProgressExportKind =
  | 'progress'
  | 'readiness'
  | 'learning'
  | 'skill'
  | 'portfolio';

export interface ProgressOverallSummary {
  overallSkillScore: number;
  interviewReadinessPercent: number;
  totalPracticeSessions: number;
  totalMockInterviews: number;
  totalLearningHours: number;
  completedRoadmaps: number;
  activeRoadmaps: number;
  totalDomains: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionScore: number;
  highestScore: number;
  lastPracticeDate: string;
}

export interface ProgressReadinessDimension {
  id: string;
  label: string;
  labelVi: string;
  percent: number;
}

export interface ProgressInterviewReadiness {
  overallPercent: number;
  dimensions: ProgressReadinessDimension[];
  aiConfidenceScore: number;
  skillsToImprove: Array<{ id: string; label: string; labelVi: string }>;
}

export interface ProgressDomainCard {
  id: ProgressDomainId;
  name: string;
  nameVi: string;
  currentScore: number;
  improvementPercent: number;
  practiceSessions: number;
  mockInterviews: number;
  roadmapProgressPercent: number;
  lastPracticeDate: string;
  interviewReadinessPercent: number;
  currentLevel: string;
  currentLevelVi: string;
}

export interface ProgressScoreHistoryPoint {
  id: string;
  date: string;
  domainId: ProgressDomainId;
  overall: number;
  technical: number;
  communication: number;
  confidence: number;
  problemSolving: number;
  behavioral: number;
  systemDesign?: number;
  reportId?: string;
  label: string;
  labelVi: string;
}

export interface ProgressSkillItem {
  id: string;
  name: string;
  nameVi: string;
  currentScore: number;
  improvementPercent: number;
  trend: ProgressTrendDirection;
  aiAssessment: string;
  aiAssessmentVi: string;
}

export interface ProgressStrengthItem {
  id: string;
  name: string;
  nameVi: string;
  score: number;
  stability: number;
  frequency: number;
}

export interface ProgressWeaknessItem {
  id: string;
  name: string;
  nameVi: string;
  score: number;
  practiceHref: string;
}

export interface ProgressImprovementItem {
  id: string;
  name: string;
  nameVi: string;
  deltaPercent: number;
  trend: ProgressTrendDirection;
}

export interface ProgressTimelineItem {
  id: string;
  relativeLabel: string;
  relativeLabelVi: string;
  title: string;
  titleVi: string;
  domain: string;
  domainVi: string;
  score: number;
  reportId?: string;
  date: string;
}

export interface ProgressHeatmapDay {
  date: string;
  sessions: number;
  hours: number;
  intensity: 0 | 1 | 2 | 3 | 4;
}

export interface ProgressGoal {
  id: string;
  domain: string;
  domainVi: string;
  targetPercent: number;
  currentPercent: number;
  remainingPercent: number;
  estimatedSessionsRemaining: number;
}

export interface ProgressRoadmapItem {
  id: string;
  name: string;
  nameVi: string;
  currentMilestone: string;
  currentMilestoneVi: string;
  completionPercent: number;
  estimatedFinishDate: string;
  remainingModules: number;
  completedModules: number;
}

export interface ProgressAchievementPreview {
  id: string;
  title: string;
  titleVi: string;
  earned: boolean;
  earnedAt?: string;
}

export interface ProgressAiInsight {
  id: string;
  title: string;
  titleVi: string;
  body: string;
  bodyVi: string;
}

export interface ProgressRecommendation {
  id: string;
  title: string;
  titleVi: string;
  reason: string;
  reasonVi: string;
  practiceHref: string;
}

export interface ProgressComparativePeriod {
  id: string;
  label: string;
  labelVi: string;
  improvementPercent: number;
  practiceFrequency: number;
  averageScore: number;
  learningHours: number;
}

export interface ProgressSessionAnalytics {
  averageSessionDurationMinutes: number;
  averageScore: number;
  averageAiQuestions: number;
  averageResponseTimeSeconds: number;
  averageRetryCount: number;
  averageConfidence: number;
  averageSpeakingSpeedWpm: number;
  averageThinkingTimeSeconds: number;
}

export interface ProgressAnalyticsDashboard {
  domainFilter: ProgressDomainId;
  rangeFilter: ProgressTimeRange;
  availableDomains: Array<{ id: ProgressDomainId; name: string; nameVi: string }>;
  overall: ProgressOverallSummary;
  readiness: ProgressInterviewReadiness;
  domains: ProgressDomainCard[];
  scoreHistory: ProgressScoreHistoryPoint[];
  skills: ProgressSkillItem[];
  strengths: ProgressStrengthItem[];
  weaknesses: ProgressWeaknessItem[];
  improvementTrends: ProgressImprovementItem[];
  timeline: ProgressTimelineItem[];
  heatmap: ProgressHeatmapDay[];
  goals: ProgressGoal[];
  roadmaps: ProgressRoadmapItem[];
  achievements: ProgressAchievementPreview[];
  insights: ProgressAiInsight[];
  recommendations: ProgressRecommendation[];
  comparative: ProgressComparativePeriod[];
  sessionAnalytics: ProgressSessionAnalytics;
}

export interface ProgressDashboardQuery {
  domain?: ProgressDomainId;
  range?: ProgressTimeRange;
}
