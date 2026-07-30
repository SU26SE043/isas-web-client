import { formatJobCategoryDisplay, resolveJobDomainFromCategory } from '@/shared/domain/jobDomains';
import { practiceLevelI18nKey, resolvePracticeLevel } from '@/shared/domain/practiceLevels';
import type {
  LearningLesson,
  LearningMilestone,
  LearningPathStatus,
  LearningRoadmapCard,
  LearningRoadmapDetail,
  LessonPartStatus,
  MilestoneGateStatus,
} from '../types/learningPath.types';
import type {
  ApiLessonStatus,
  ApiRoadmapDetail,
  ApiRoadmapLesson,
  ApiRoadmapLessonDetail,
  ApiRoadmapListItem,
  ApiRoadmapMilestone,
  LearningResource,
} from '../types/roadmap.api.types';

export type OpenedLearningLesson = {
  id: string;
  orderNo: number;
  title: string;
  titleVi: string;
  theoryContent: string;
  theoryContentVi: string;
  sessionId: string | null;
  apiStatus: 'Theory' | 'Practicing' | 'Done' | string;
  theoryStatus: LessonPartStatus;
  practiceStatus: LessonPartStatus;
  pathStatus: LearningPathStatus;
  resources: LearningResource[];
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function pickNumber(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
}

function normalizeApiLessonStatus(status: ApiLessonStatus | undefined): 'Theory' | 'Practicing' | 'Done' {
  const raw = String(status ?? 'Theory').trim().toLowerCase();
  if (raw === 'practicing' || raw === 'practice' || raw === 'inprogress') return 'Practicing';
  if (raw === 'done' || raw === 'completed' || raw === 'complete') return 'Done';
  return 'Theory';
}

function mapLessonParts(apiStatus: ApiLessonStatus | undefined): {
  theoryStatus: LessonPartStatus;
  practiceStatus: LessonPartStatus;
  pathStatus: LearningPathStatus;
} {
  const status = normalizeApiLessonStatus(apiStatus);
  if (status === 'Done') {
    return { theoryStatus: 'completed', practiceStatus: 'completed', pathStatus: 'completed' };
  }
  if (status === 'Practicing') {
    return { theoryStatus: 'completed', practiceStatus: 'available', pathStatus: 'in_progress' };
  }
  return { theoryStatus: 'available', practiceStatus: 'locked', pathStatus: 'not_started' };
}

function mapMilestoneGate(status: string | undefined, index: number, hasCurrent: boolean): MilestoneGateStatus {
  const raw = String(status ?? '').toLowerCase();
  if (raw === 'completed' || raw === 'done') return 'completed';
  if (raw === 'locked' || raw === 'pending') return hasCurrent || index > 0 ? 'locked' : 'current';
  if (raw === 'current' || raw === 'inprogress' || raw === 'in_progress' || raw === 'active') {
    return 'current';
  }
  return index === 0 ? 'current' : 'locked';
}

function mapRoadmapPathStatus(status: string | undefined, progressPercent: number): LearningPathStatus {
  const raw = String(status ?? '').toLowerCase();
  if (raw === 'completed' || raw === 'done') return 'completed';
  if (raw === 'abandoned') return progressPercent > 0 ? 'in_progress' : 'not_started';
  if (raw === 'active' || raw === 'inprogress' || raw === 'in_progress') return 'in_progress';
  if (progressPercent >= 100) return 'completed';
  if (progressPercent > 0) return 'in_progress';
  return 'not_started';
}

function mapDomain(jobCategoryOrDomain: string | undefined): {
  domainId: string;
  domainLabel: string;
  domainLabelVi: string;
} {
  const domain = resolveJobDomainFromCategory(jobCategoryOrDomain);
  if (domain) {
    return {
      domainId: domain.id,
      domainLabel: domain.name,
      domainLabelVi: domain.nameVi,
    };
  }
  const fallback = formatJobCategoryDisplay(jobCategoryOrDomain, 'en') || jobCategoryOrDomain || '—';
  return {
    domainId: jobCategoryOrDomain?.toLowerCase() || 'unknown',
    domainLabel: fallback,
    domainLabelVi: formatJobCategoryDisplay(jobCategoryOrDomain, 'vi') || fallback,
  };
}

function mapTargetLevel(level: string | undefined): string {
  const resolved = resolvePracticeLevel(level);
  if (resolved) return practiceLevelI18nKey(resolved);
  const raw = String(level ?? '').trim().toLowerCase();
  return raw || 'fresher';
}

function mapLessonFromApi(lesson: ApiRoadmapLesson, index: number): LearningLesson {
  const apiStatus = normalizeApiLessonStatus(lesson.status);
  const parts = mapLessonParts(lesson.status);
  const title = pickString(lesson.title, lesson.titleVi) || `Lesson ${index + 1}`;
  return {
    id: pickString(lesson.id) || `lesson-${index + 1}`,
    title,
    titleVi: pickString(lesson.titleVi, lesson.title) || title,
    order: pickNumber(lesson.orderNo, lesson.order, index + 1),
    theoryStatus: parts.theoryStatus,
    practiceStatus: parts.practiceStatus,
    // List/detail must not use theoryContent for lesson body — fetch via open-lesson API.
    content: '',
    contentVi: '',
    status: parts.pathStatus,
    apiStatus,
    sessionId: pickString(lesson.sessionId) || null,
    practiceReportId: pickString(lesson.practiceReportId) || undefined,
  };
}

function mapMilestoneFromApi(
  milestone: ApiRoadmapMilestone,
  index: number,
  hasCurrentAlready: boolean,
): LearningMilestone {
  const lessons = asArray<ApiRoadmapLesson>(milestone.lessons)
    .map((lesson, lessonIndex) => mapLessonFromApi(lesson, lessonIndex))
    .sort((a, b) => a.order - b.order);
  const title = pickString(milestone.title, milestone.titleVi) || `Milestone ${index + 1}`;
  const gate = mapMilestoneGate(milestone.status, index, hasCurrentAlready);
  const completedParts = lessons.reduce(
    (sum, lesson) =>
      sum +
      (lesson.theoryStatus === 'completed' ? 1 : 0) +
      (lesson.practiceStatus === 'completed' ? 1 : 0),
    0,
  );
  const totalParts = Math.max(lessons.length * 2, 1);
  return {
    id: pickString(milestone.id) || `milestone-${index + 1}`,
    title,
    titleVi: pickString(milestone.titleVi, milestone.title) || title,
    order: pickNumber(milestone.orderNo, milestone.order, index + 1),
    status: gate,
    progressPercent: pickNumber(milestone.progressPercent, Math.round((completedParts / totalParts) * 100)),
    lessons,
  };
}

function deriveCurrentPointers(milestones: LearningMilestone[]) {
  const currentMilestone =
    milestones.find((item) => item.status === 'current') ??
    milestones.find((item) => item.status !== 'completed') ??
    milestones[milestones.length - 1];
  const currentLesson =
    currentMilestone?.lessons.find((item) => item.status !== 'completed') ??
    currentMilestone?.lessons[currentMilestone.lessons.length - 1];
  return { currentMilestone, currentLesson };
}

export function mapApiRoadmapListItem(raw: unknown): LearningRoadmapCard {
  const item = asRecord(raw) as ApiRoadmapListItem;
  const domain = mapDomain(pickString(item.jobCategory, item.domainId));
  const progressPercent = Math.max(0, Math.min(100, pickNumber(item.progressPercent)));
  const status = mapRoadmapPathStatus(item.status, progressPercent);
  const name = pickString(item.name, item.nameVi, item.title) || 'Roadmap';
  const targetLevel = mapTargetLevel(pickString(item.level, item.targetLevel));
  return {
    id: pickString(item.id),
    name,
    nameVi: pickString(item.nameVi, item.name, item.title) || name,
    domainId: domain.domainId,
    domainLabel: domain.domainLabel,
    domainLabelVi: domain.domainLabelVi,
    targetLevel,
    status,
    progressPercent,
    currentMilestoneId: pickString(item.currentMilestoneId),
    currentMilestoneTitle: pickString(item.currentMilestoneTitle, item.currentMilestoneTitleVi),
    currentMilestoneTitleVi: pickString(item.currentMilestoneTitleVi, item.currentMilestoneTitle),
    currentLessonId: pickString(item.currentLessonId),
    currentLessonTitle: pickString(item.currentLessonTitle, item.currentLessonTitleVi),
    currentLessonTitleVi: pickString(item.currentLessonTitleVi, item.currentLessonTitle),
    estimatedRemainingHours: pickNumber(item.estimatedRemainingHours),
    updatedAt: pickString(item.updatedAt) || new Date().toISOString(),
    readOnly: Boolean(item.readOnly) || status === 'completed',
  };
}

export function mapApiRoadmapDetail(raw: unknown): LearningRoadmapDetail {
  const item = asRecord(raw) as ApiRoadmapDetail;
  const card = mapApiRoadmapListItem(item);
  const rawMilestones = asArray<ApiRoadmapMilestone>(item.milestones)
    .slice()
    .sort((a, b) => pickNumber(a.orderNo, a.order) - pickNumber(b.orderNo, b.order));

  let hasCurrent = false;
  const milestones = rawMilestones.map((milestone, index) => {
    const mapped = mapMilestoneFromApi(milestone, index, hasCurrent);
    if (mapped.status === 'current') hasCurrent = true;
    return mapped;
  });

  // Ensure at least one current milestone when none completed.
  if (milestones.length > 0 && !milestones.some((item) => item.status === 'current')) {
    const firstOpen = milestones.findIndex((item) => item.status !== 'completed');
    if (firstOpen >= 0) {
      milestones[firstOpen] = { ...milestones[firstOpen], status: 'current' };
    }
  }

  const { currentMilestone, currentLesson } = deriveCurrentPointers(milestones);
  const partsDone = milestones.reduce(
    (sum, milestone) =>
      sum +
      milestone.lessons.reduce(
        (inner, lesson) =>
          inner +
          (lesson.theoryStatus === 'completed' ? 1 : 0) +
          (lesson.practiceStatus === 'completed' ? 1 : 0),
        0,
      ),
    0,
  );
  const partsTotal = Math.max(
    milestones.reduce((sum, milestone) => sum + milestone.lessons.length * 2, 0),
    1,
  );
  const progressPercent =
    card.progressPercent > 0 ? card.progressPercent : Math.round((partsDone / partsTotal) * 100);
  const status = mapRoadmapPathStatus(item.status, progressPercent);

  return {
    ...card,
    progressPercent,
    status,
    readOnly: card.readOnly || status === 'completed',
    currentMilestoneId: card.currentMilestoneId || currentMilestone?.id || '',
    currentMilestoneTitle: card.currentMilestoneTitle || currentMilestone?.title || '',
    currentMilestoneTitleVi: card.currentMilestoneTitleVi || currentMilestone?.titleVi || '',
    currentLessonId: card.currentLessonId || currentLesson?.id || '',
    currentLessonTitle: card.currentLessonTitle || currentLesson?.title || '',
    currentLessonTitleVi: card.currentLessonTitleVi || currentLesson?.titleVi || '',
    milestones,
    reports: [],
  };
}

function mapLearningResources(raw: unknown): LearningResource[] {
  if (!Array.isArray(raw)) return [];
  const resources: LearningResource[] = [];
  for (const entry of raw) {
    const item = asRecord(entry);
    const title = pickString(item.title, item.name);
    if (!title) continue;
    const type = pickString(item.type, item.resourceType) || 'Doc';
    const publisher = pickString(item.publisher, item.source) || null;
    const urlRaw = typeof item.url === 'string' ? item.url.trim() : '';
    resources.push({
      title,
      type,
      publisher,
      url: urlRaw || null,
    });
  }
  return resources;
}

export function mapApiRoadmapLessonDetail(raw: unknown): OpenedLearningLesson {
  const item = asRecord(raw) as ApiRoadmapLessonDetail;
  const apiStatus = normalizeApiLessonStatus(item.status);
  const parts = mapLessonParts(apiStatus);
  const title = pickString(item.title, item.titleVi) || 'Lesson';
  const theoryContent = pickString(item.theoryContent, item.content);
  const theoryContentVi = pickString(item.theoryContentVi, item.contentVi);
  return {
    id: pickString(item.id),
    orderNo: pickNumber(item.orderNo, 1),
    title,
    titleVi: pickString(item.titleVi, item.title) || title,
    theoryContent,
    theoryContentVi,
    sessionId: pickString(item.sessionId) || null,
    apiStatus,
    theoryStatus: parts.theoryStatus,
    practiceStatus: parts.practiceStatus,
    pathStatus: parts.pathStatus,
    resources: mapLearningResources(item.resources),
  };
}

export function applyOpenedLessonToRoadmap(
  roadmap: LearningRoadmapDetail,
  opened: OpenedLearningLesson,
): LearningRoadmapDetail {
  return {
    ...roadmap,
    milestones: roadmap.milestones.map((milestone) => ({
      ...milestone,
      lessons: milestone.lessons.map((lesson) =>
        lesson.id === opened.id
          ? {
              ...lesson,
              title: opened.title || lesson.title,
              titleVi: opened.titleVi || lesson.titleVi,
              theoryStatus: opened.theoryStatus,
              practiceStatus: opened.practiceStatus,
              status: opened.pathStatus,
              apiStatus: normalizeApiLessonStatus(opened.apiStatus),
              sessionId: opened.sessionId,
            }
          : lesson,
      ),
    })),
  };
}
