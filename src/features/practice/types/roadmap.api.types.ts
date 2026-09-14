import type { LessonStatus } from '@/shared/enums';

/** API lesson status from Interview Service. */
export type ApiLessonStatus = LessonStatus | 'Theory' | 'Practicing' | 'Done' | string;

export type LearningResourceType = 'Doc' | 'Course' | 'Book' | 'Video' | 'Article' | string;

export type LearningResource = {
  title: string;
  type: LearningResourceType;
  publisher?: string | null;
  url?: string | null;
};

export type LearningCitation = {
  chunkId: string;
  sourceUrl: string;
  sourceTitle: string;
};

export type ApiRoadmapLesson = {
  id: string;
  orderNo?: number;
  order?: number;
  title?: string;
  titleVi?: string;
  theoryContent?: string | null;
  theoryContentVi?: string | null;
  content?: string | null;
  contentVi?: string | null;
  sessionId?: string | null;
  status?: ApiLessonStatus;
  practiceReportId?: string | null;
  /** Số lần đã luyện bài này. Server sở hữu; FE không tự đếm. */
  attemptCount?: number;
  /**
   * SERVER quyết định bài có được luyện lại hay không.
   * Điều kiện thật gồm cả trạng thái, ví credit và quyền sở hữu — FE tự suy từ
   * `status` sẽ lệch với backend ngay lần đổi luật đầu tiên, và triệu chứng là
   * nút hiện ra rồi bấm vào báo lỗi.
   */
  canRetry?: boolean;
  resources?: LearningResource[] | null;
  citations?: LearningCitation[] | null;
};

export type ApiRoadmapMilestone = {
  id: string;
  orderNo?: number;
  order?: number;
  title?: string;
  titleVi?: string;
  status?: string;
  progressPercent?: number;
  mistakeCount?: number;
  improvement?: Array<{ criterionName: string; deltaPct: number }> | null;
  lessons?: ApiRoadmapLesson[];
};

export type ApiLessonMistake = {
  id: string;
  criterionName?: string;
  scorePct?: number;
  question?: string;
  answer?: string;
  whatWentWrong?: string | null;
  howToFixIt?: string | null;
  sampleAnswer?: string | null;
};

export type ApiRoadmapResolvedSession = string | {
  id?: string;
  sessionId?: string;
  date?: string;
  createdAt?: string;
  completedAt?: string;
};

export type ApiRoadmapResolvedFrom = {
  sessionIds?: ApiRoadmapResolvedSession[] | null;
  baselineAvailable?: boolean;
  scope?: string | null;
};

export type ApiRoadmapListItem = {
  id: string;
  name?: string;
  nameVi?: string;
  title?: string;
  jobCategory?: string;
  language?: string;
  domainId?: string;
  level?: string;
  mode?: 'LevelUp' | 'Reinforce' | string;
  targetLevel?: string;
  status?: string;
  progressPercent?: number;
  currentMilestoneId?: string;
  currentMilestoneTitle?: string;
  currentMilestoneTitleVi?: string;
  currentLessonId?: string;
  currentLessonTitle?: string;
  currentLessonTitleVi?: string;
  estimatedRemainingHours?: number;
  updatedAt?: string;
  createdAt?: string;
  completedAt?: string | null;
  milestoneCount?: number;
  milestoneDoneCount?: number;
  readOnly?: boolean;
  hasFinalReport?: boolean;
  milestones?: ApiRoadmapMilestone[];
};

export type ApiRoadmapDetail = ApiRoadmapListItem & {
  milestones?: ApiRoadmapMilestone[];
  reports?: unknown[];
  resolvedFrom?: ApiRoadmapResolvedFrom | null;
};

/** Shared lesson detail contract (roadmap nested + GET lesson). */
export type ApiRoadmapLessonDetail = {
  id: string;
  orderNo?: number;
  title?: string;
  titleVi?: string;
  theoryContent?: string | null;
  theoryContentVi?: string | null;
  content?: string | null;
  contentVi?: string | null;
  sessionId?: string | null;
  status: ApiLessonStatus;
  resources?: LearningResource[] | null;
  citations?: LearningCitation[] | null;
  mistakes?: ApiLessonMistake[] | null;
};

/** Spec alias — same shape as ApiRoadmapLessonDetail. */
export type LessonResponse = ApiRoadmapLessonDetail;
