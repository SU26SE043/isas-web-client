export type LearningPathStatus = 'not_started' | 'in_progress' | 'completed';

export type MilestoneGateStatus = 'locked' | 'current' | 'completed';

export type LessonPartStatus = 'locked' | 'available' | 'completed';

export interface LearningPracticeQuestionFeedback {
  score: number;
  strengths: string[];
  strengthsVi: string[];
  weaknesses: string[];
  weaknessesVi: string[];
  missingKnowledge: string[];
  missingKnowledgeVi: string[];
  betterAnswer: string;
  betterAnswerVi: string;
  tips: string[];
  tipsVi: string[];
}

export interface LearningPracticeQuestion {
  id: string;
  prompt: string;
  promptVi: string;
}

export interface LearningPracticeReport {
  id: string;
  lessonId: string;
  roadmapId: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  strengths: string[];
  strengthsVi: string[];
  weaknesses: string[];
  weaknessesVi: string[];
  knowledgeGaps: string[];
  knowledgeGapsVi: string[];
  recommendedTopics: string[];
  recommendedTopicsVi: string[];
  aiSummary: string;
  aiSummaryVi: string;
  nextActions: string[];
  nextActionsVi: string[];
  questionFeedback: Array<{
    questionId: string;
    prompt: string;
    promptVi: string;
    feedback: LearningPracticeQuestionFeedback;
  }>;
  createdAt: string;
}

export type LearningLessonApiStatus = 'Theory' | 'Practicing' | 'Done';

export interface LearningLesson {
  id: string;
  title: string;
  titleVi: string;
  order: number;
  theoryStatus: LessonPartStatus;
  practiceStatus: LessonPartStatus;
  /** Lesson body HTML (English). Populated only after open-lesson API. */
  content: string;
  /** Lesson body HTML (Vietnamese). Populated only after open-lesson API. */
  contentVi: string;
  status: LearningPathStatus;
  /** Backend lesson status when known from API. */
  apiStatus?: LearningLessonApiStatus;
  /** Practice session id when status is Practicing. */
  sessionId?: string | null;
  practiceReportId?: string;
  /** Số lần đã luyện bài này (server đếm). 0 = chưa làm lần nào. */
  attemptCount: number;
  /** SERVER quyết định — TUYỆT ĐỐI không suy từ `apiStatus`/`practiceStatus`. */
  canRetry: boolean;
  theoryContent?: string | null;
  resources?: Array<{ title: string; type: string; publisher?: string | null; url?: string | null }>;
  citations?: Array<{ chunkId: string; sourceUrl: string; sourceTitle: string }> | null;
}

export interface LearningMilestone {
  id: string;
  title: string;
  titleVi: string;
  order: number;
  status: MilestoneGateStatus;
  progressPercent: number;
  lessons: LearningLesson[];
  focusCriteria?: string[];
  improvement?: Array<{ criterionName: string; deltaPct: number }> | null;
}

export interface LearningRoadmapResolvedSession {
  id: string;
  date: string | null;
}

export interface LearningRoadmapResolvedFrom {
  sessions: LearningRoadmapResolvedSession[];
  baselineAvailable: boolean;
  scope: string;
}

export interface LearningRoadmapCard {
  id: string;
  name: string;
  nameVi: string;
  domainId: string;
  domainLabel: string;
  domainLabelVi: string;
  targetLevel: string;
  status: LearningPathStatus;
  progressPercent: number;
  currentMilestoneId: string;
  currentMilestoneTitle: string;
  currentMilestoneTitleVi: string;
  currentLessonId: string;
  currentLessonTitle: string;
  currentLessonTitleVi: string;
  estimatedRemainingHours: number;
  updatedAt: string;
  readOnly: boolean;
  jobCategory?: string;
  language?: 'vi' | 'en' | string;
  level?: string;
  apiStatus?: 'Active' | 'Completed' | 'Abandoned' | string;
  createdAt?: string;
  completedAt?: string | null;
}

export interface LearningRoadmapDetail extends LearningRoadmapCard {
  milestones: LearningMilestone[];
  reports: LearningPracticeReport[];
  resolvedFrom?: LearningRoadmapResolvedFrom | null;
}

export interface LearningDashboardQuery {
  search?: string;
  domainId?: string;
  status?: LearningPathStatus | 'all';
  sort?: 'updated' | 'progress';
  cursor?: string;
  limit?: number;
}
