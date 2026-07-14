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

export interface LearningLesson {
  id: string;
  title: string;
  titleVi: string;
  order: number;
  theoryStatus: LessonPartStatus;
  practiceStatus: LessonPartStatus;
  /** Lesson body HTML (English). */
  content: string;
  /** Lesson body HTML (Vietnamese). */
  contentVi: string;
  status: LearningPathStatus;
  practiceReportId?: string;
}

export interface LearningMilestone {
  id: string;
  title: string;
  titleVi: string;
  order: number;
  status: MilestoneGateStatus;
  progressPercent: number;
  lessons: LearningLesson[];
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
  currentMilestoneTitle: string;
  currentMilestoneTitleVi: string;
  currentLessonTitle: string;
  currentLessonTitleVi: string;
  estimatedRemainingHours: number;
  updatedAt: string;
  readOnly: boolean;
}

export interface LearningRoadmapDetail extends LearningRoadmapCard {
  milestones: LearningMilestone[];
  reports: LearningPracticeReport[];
}

export interface LearningDashboardQuery {
  search?: string;
  domainId?: string;
  status?: LearningPathStatus | 'all';
  sort?: 'updated' | 'progress';
}
