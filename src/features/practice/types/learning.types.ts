export type LearningModuleStatus = 'not_started' | 'in_progress' | 'completed';

export interface RoadmapStep {
  id: string;
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  skillTag: string;
  skillTagVi: string;
  estimatedWeeks: number;
  moduleId?: string;
  completed: boolean;
}

export interface LearningModule {
  id: string;
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  skillTag: string;
  skillTagVi: string;
  durationMinutes: number;
  progressPercent: number;
  status: LearningModuleStatus;
  passThreshold: number;
}

export interface LearningModuleContent {
  id: string;
  sections: LearningSection[];
}

export interface LearningSection {
  id: string;
  title: string;
  titleVi: string;
  body: string;
  bodyVi: string;
}

export interface CertificateRecord {
  id: string;
  title: string;
  titleVi: string;
  issuedAt: string;
  score: number;
  interviewId: string;
  candidateName: string;
}

export interface RoadmapResponse {
  steps: RoadmapStep[];
  regenerateCount: number;
  regenerateLimit: number;
}

export interface ProgressWeekPoint {
  weekLabel: string;
  weekLabelVi: string;
  sessions: number;
  averageScore: number;
}

export interface SkillTrendPoint {
  skill: string;
  skillVi: string;
  current: number;
  previous: number;
}

export interface ProgressDashboardData {
  modulesCompleted: number;
  totalModules: number;
  averageScore: number;
  practiceMinutes: number;
  weeklyActivity: ProgressWeekPoint[];
  skillTrends: SkillTrendPoint[];
}

export interface LeaderboardEntry {
  rank: number;
  candidateName: string;
  score: number;
  sessions: number;
  isCurrentUser?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  earned: boolean;
  earnedAt?: string;
}

export interface LearningPracticePrompt {
  id: string;
  prompt: string;
  promptVi: string;
  durationSeconds: number;
}

export interface LearningPracticeSession {
  sessionId: string;
  moduleId: string;
  prompts: LearningPracticePrompt[];
}
