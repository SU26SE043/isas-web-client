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
  id?: string;
  steps: RoadmapStep[];
  regenerateCount: number;
  regenerateLimit: number;
  domainId?: string;
  targetLevel?: string;
  name?: string;
  sourceReportIds?: string[];
  jobCategory?: 'BA' | 'BE' | 'FE' | string;
  language?: 'vi' | 'en' | string;
  level?: RoadmapLevel | string;
  mode?: RoadmapMode;
  status?: 'Active' | 'Completed' | 'Abandoned' | string;
  createdAt?: string;
  completedAt?: string | null;
  milestones?: RoadmapApiMilestone[];
}

export interface RoadmapApiMilestone {
  id: string;
  orderNo: number;
  title: string;
  focusCriteria: string[];
  status: 'Pending' | 'InProgress' | 'Completed' | string;
  mistakeCount?: number;
  improvement: Array<{ criterionName: string; deltaPct: number }> | null;
  lessons: Array<{
    id: string;
    orderNo: number;
    title: string;
    theoryContent?: string | null;
    sessionId?: string | null;
    status: 'Theory' | 'Practicing' | 'Done' | string;
    resources: Array<{ title: string; type: string; publisher?: string | null; url?: string | null }>;
    citations?: Array<{ chunkId: string; sourceUrl: string; sourceTitle: string }> | null;
  }>;
}

/**
 * Wizard input for creating a roadmap.
 * Live API accepts jobCategory + level (+ optional context fields).
 */
export interface CreateRoadmapInput {
  domainId: string;
  currentLevel?: string;
  targetLevel: string;
  name?: string;
  reportIds?: string[];
  /** Selected scored practice sessions used as baseline (sent as sessionIds). */
  sessionIds?: string[];
  cvId?: string;
  cvAnalysisId?: string;
  priorRoadmapId?: string;
  focus?: string;
  language?: 'vi' | 'en';
  /** Roadmap size; omitted by the backend means Standard. */
  scope?: RoadmapScope;
}

export type RoadmapMode = 'LevelUp' | 'Reinforce';
  /**
   * Quy mô lộ trình. Backend nhận "Quick" (2 chặng × 2 bài) hoặc "Standard"
   * (4 chặng × 3 bài); không gửi ⇒ Standard.
   *
   * Đây là lựa chọn có GIÁ: mỗi bài tiêu 1 credit, mà suất dùng thử chỉ có 3.
   * Trước khi nối trường này, mọi lộ trình tạo qua giao diện đều là Standard —
   * người mới tạo xong sẽ chạm 402 ở bài thứ tư mà không hiểu vì sao.
   */
export const ROADMAP_SCOPES = ['Quick', 'Standard'] as const;
export type RoadmapScope = (typeof ROADMAP_SCOPES)[number];
/** Số bài mỗi quy mô sinh ra — dùng để báo giá credit TRƯỚC khi bấm tạo. */
export const ROADMAP_SCOPE_LESSONS: Record<RoadmapScope, number> = { Quick: 4, Standard: 12 };

export type RoadmapLevel = 'Fresher' | 'Junior' | 'Middle' | 'Senior';

/** Request body for POST /api/v1/interview/practice/roadmaps */
export interface CreateRoadmapApiRequest {
  jobCategory: string;
  currentLevel?: string;
  level: RoadmapLevel | string;
  name?: string;
  cvId?: string;
  sessionIds?: string[];
  cvAnalysisId?: string;
  priorRoadmapId?: string;
  focus?: string;
  language?: 'vi' | 'en';
  scope?: RoadmapScope;
}

export const ROADMAP_FOCUS_MAX_CHARS = 2000;
export const ROADMAP_NAME_MAX_CHARS = 120;

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
