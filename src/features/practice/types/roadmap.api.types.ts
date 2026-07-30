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
  resources?: LearningResource[] | null;
};

export type ApiRoadmapMilestone = {
  id: string;
  orderNo?: number;
  order?: number;
  title?: string;
  titleVi?: string;
  status?: string;
  progressPercent?: number;
  focusCriteria?: string[];
  lessons?: ApiRoadmapLesson[];
};

export type ApiRoadmapListItem = {
  id: string;
  name?: string;
  nameVi?: string;
  title?: string;
  jobCategory?: string;
  domainId?: string;
  level?: string;
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
  readOnly?: boolean;
  milestones?: ApiRoadmapMilestone[];
};

export type ApiRoadmapDetail = ApiRoadmapListItem & {
  milestones?: ApiRoadmapMilestone[];
  reports?: unknown[];
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
};

/** Spec alias — same shape as ApiRoadmapLessonDetail. */
export type LessonResponse = ApiRoadmapLessonDetail;
