import type { LessonStatus } from '@/shared/enums';

/** API lesson status from Interview Service. */
export type ApiLessonStatus = LessonStatus | 'Theory' | 'Practicing' | 'Done' | string;

export type ApiRoadmapLesson = {
  id: string;
  orderNo?: number;
  order?: number;
  title?: string;
  titleVi?: string;
  theoryContent?: string | null;
  sessionId?: string | null;
  status?: ApiLessonStatus;
  practiceReportId?: string | null;
};

export type ApiRoadmapMilestone = {
  id: string;
  orderNo?: number;
  order?: number;
  title?: string;
  titleVi?: string;
  status?: string;
  progressPercent?: number;
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
  readOnly?: boolean;
  milestones?: ApiRoadmapMilestone[];
};

export type ApiRoadmapDetail = ApiRoadmapListItem & {
  milestones?: ApiRoadmapMilestone[];
  reports?: unknown[];
};

export type ApiRoadmapLessonDetail = {
  id: string;
  orderNo?: number;
  title?: string;
  titleVi?: string;
  theoryContent?: string | null;
  sessionId?: string | null;
  status: ApiLessonStatus;
};
