import { mockDelay, usesMockData } from '@/shared/mock';
import type { CreateRoadmapInput } from '../types/learning.types';
import type {
  LearningDashboardQuery,
  LearningLesson,
  LearningMilestone,
  LearningPathStatus,
  LearningPracticeQuestionFeedback,
  LearningPracticeReport,
  LearningRoadmapCard,
  LearningRoadmapDetail,
} from '../types/learningPath.types';
import {
  LEARNING_PRACTICE_QUESTIONS,
  MOCK_LEARNING_PATH_ROADMAPS,
  createPracticeReportStub,
} from '../mocks/learningPath.fixtures';
import { buildLessonHtml } from '../mocks/lessonContent.fixtures';
import { ROADMAP_DOMAINS } from '../mocks/practiceSetup.fixtures';
import { getLearningPracticeSession } from './learningPracticeSession.registry';
import { roadmapService } from './roadmap.service';
import { startLearningLessonPractice } from '../utils/launchLearningInterviewPractice';

let store: LearningRoadmapDetail[] = structuredClone(MOCK_LEARNING_PATH_ROADMAPS);

function recompute(roadmap: LearningRoadmapDetail): LearningRoadmapDetail {
  const milestones = roadmap.milestones
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((milestone) => {
      const lessons = milestone.lessons.slice().sort((a, b) => a.order - b.order);
      let prevLessonDone = true;
      const normalizedLessons: LearningLesson[] = lessons.map((lesson) => {
        if (roadmap.readOnly) {
          return {
            ...lesson,
            theoryStatus: lesson.theoryStatus === 'completed' ? 'completed' : lesson.theoryStatus,
            practiceStatus: lesson.practiceStatus === 'completed' ? 'completed' : lesson.practiceStatus,
          };
        }
        if (!prevLessonDone) {
          return {
            ...lesson,
            theoryStatus: 'locked',
            practiceStatus: 'locked',
            status: 'not_started',
          };
        }
        const theoryStatus = lesson.theoryStatus === 'completed' ? 'completed' : 'available';
        const practiceStatus =
          lesson.practiceStatus === 'completed'
            ? 'completed'
            : theoryStatus === 'completed'
              ? 'available'
              : 'locked';
        const status: LearningPathStatus =
          theoryStatus === 'completed' && practiceStatus === 'completed'
            ? 'completed'
            : theoryStatus === 'completed' || practiceStatus === 'completed'
              ? 'in_progress'
              : 'not_started';
        prevLessonDone = status === 'completed';
        return { ...lesson, theoryStatus, practiceStatus, status };
      });

      const completedParts = normalizedLessons.reduce(
        (sum, item) =>
          sum +
          (item.theoryStatus === 'completed' ? 1 : 0) +
          (item.practiceStatus === 'completed' ? 1 : 0),
        0,
      );
      const totalParts = Math.max(normalizedLessons.length * 2, 1);
      const allLessonsDone = normalizedLessons.every((item) => item.status === 'completed');
      return {
        ...milestone,
        lessons: normalizedLessons,
        progressPercent: Math.round((completedParts / totalParts) * 100),
        status: allLessonsDone ? 'completed' : milestone.status,
      };
    });

  let foundCurrent = false;
  const gated: LearningMilestone[] = milestones.map((milestone) => {
    if (milestone.status === 'completed') {
      return { ...milestone, status: 'completed' };
    }
    if (!foundCurrent) {
      foundCurrent = true;
      return { ...milestone, status: 'current' };
    }
    return {
      ...milestone,
      status: 'locked',
      lessons: milestone.lessons.map((lesson) => ({
        ...lesson,
        theoryStatus: lesson.theoryStatus === 'completed' ? lesson.theoryStatus : 'locked',
        practiceStatus: lesson.practiceStatus === 'completed' ? lesson.practiceStatus : 'locked',
      })),
    };
  });

  const allDone = gated.every((item) => item.status === 'completed');
  const anyProgress = gated.some((item) => item.progressPercent > 0 || item.status === 'current');
  const partsDone = gated.reduce(
    (sum, item) =>
      sum +
      item.lessons.reduce(
        (inner, lesson) =>
          inner +
          (lesson.theoryStatus === 'completed' ? 1 : 0) +
          (lesson.practiceStatus === 'completed' ? 1 : 0),
        0,
      ),
    0,
  );
  const partsTotal = Math.max(
    gated.reduce((sum, item) => sum + item.lessons.length * 2, 0),
    1,
  );

  const currentMilestone = gated.find((item) => item.status === 'current') ?? gated[gated.length - 1];
  const currentLesson =
    currentMilestone?.lessons.find((item) => item.status !== 'completed') ??
    currentMilestone?.lessons[currentMilestone.lessons.length - 1];

  return {
    ...roadmap,
    milestones: gated,
    progressPercent: Math.round((partsDone / partsTotal) * 100),
    status: allDone ? 'completed' : anyProgress ? 'in_progress' : 'not_started',
    readOnly: allDone,
    currentMilestoneId: currentMilestone?.id ?? '',
    currentMilestoneTitle: currentMilestone?.title ?? '',
    currentMilestoneTitleVi: currentMilestone?.titleVi ?? '',
    currentLessonId: currentLesson?.id ?? '',
    currentLessonTitle: currentLesson?.title ?? '',
    currentLessonTitleVi: currentLesson?.titleVi ?? '',
    updatedAt: new Date().toISOString(),
  };
}

function findLesson(roadmap: LearningRoadmapDetail, lessonId: string) {
  for (const milestone of roadmap.milestones) {
    const lesson = milestone.lessons.find((item) => item.id === lessonId);
    if (lesson) return { milestone, lesson };
  }
  return null;
}

function instantFeedback(): LearningPracticeQuestionFeedback {
  return {
    score: 76,
    strengths: ['Clear explanation'],
    strengthsVi: ['Giải thích rõ'],
    weaknesses: ['Needs more concrete examples'],
    weaknessesVi: ['Cần thêm ví dụ cụ thể'],
    missingKnowledge: ['Edge cases'],
    missingKnowledgeVi: ['Edge cases'],
    betterAnswer: 'Lead with a short definition, then contrast with one example each.',
    betterAnswerVi: 'Bắt đầu bằng định nghĩa ngắn, rồi so sánh bằng một ví dụ cho mỗi khái niệm.',
    tips: ['Speak in short structured blocks'],
    tipsVi: ['Nói theo khối ngắn, có cấu trúc'],
  };
}

export const learningPathService = {
  /** Always live — GET /api/v1/interview/practice/roadmaps */
  async listRoadmaps(
    query: LearningDashboardQuery = {},
    options: { enrichCurrentPointers?: boolean } = {},
  ): Promise<LearningRoadmapCard[]> {
    if (usesMockData('practice')) {
      await mockDelay(200);
      let items: LearningRoadmapCard[] = store.map(
        ({ milestones: _milestones, reports: _reports, ...card }) => card,
      );
      const search = query.search?.trim().toLowerCase();
      if (search) {
        items = items.filter(
          (item) =>
            item.name.toLowerCase().includes(search) ||
            item.nameVi.toLowerCase().includes(search) ||
            item.domainLabel.toLowerCase().includes(search),
        );
      }
      if (query.domainId && query.domainId !== 'all') {
        items = items.filter((item) => item.domainId === query.domainId);
      }
      if (query.status && query.status !== 'all') {
        items = items.filter((item) => item.status === query.status);
      }
      return items.sort((left, right) =>
        query.sort === 'progress'
          ? right.progressPercent - left.progressPercent
          : +new Date(right.updatedAt) - +new Date(left.updatedAt),
      );
    }
    return roadmapService.listRoadmaps(query, options);
  },

  /** Always live — GET /api/v1/interview/practice/roadmaps/{id} */
  async getRoadmap(roadmapId: string): Promise<LearningRoadmapDetail> {
    if (usesMockData('practice')) {
      await mockDelay(150);
      const roadmap = store.find((item) => item.id === roadmapId);
      if (!roadmap) throw new Error('ROADMAP_NOT_FOUND');
      return structuredClone(roadmap);
    }
    return roadmapService.getRoadmap(roadmapId);
  },

  async registerCreatedRoadmap(input: CreateRoadmapInput & { roadmapId?: string }): Promise<LearningRoadmapDetail> {
    if (usesMockData('practice')) await mockDelay(200);
    const domain = ROADMAP_DOMAINS.find((item) => item.id === input.domainId);
    const id = input.roadmapId ?? `roadmap-${input.domainId}-${Date.now()}`;
    const created: LearningRoadmapDetail = {
      id,
      name: `${domain?.name ?? input.domainId} path to ${input.targetLevel}`,
      nameVi: `Lộ trình ${domain?.nameVi ?? input.domainId} tới ${input.targetLevel}`,
      domainId: input.domainId,
      domainLabel: domain?.name ?? input.domainId,
      domainLabelVi: domain?.nameVi ?? input.domainId,
      targetLevel: input.targetLevel,
      status: 'not_started',
      progressPercent: 0,
      currentMilestoneId: 'ms-start',
      currentMilestoneTitle: 'Getting started',
      currentMilestoneTitleVi: 'Bắt đầu',
      currentLessonId: 'ms-start-l1',
      currentLessonTitle: 'Orientation',
      currentLessonTitleVi: 'Định hướng',
      estimatedRemainingHours: 20,
      updatedAt: new Date().toISOString(),
      readOnly: false,
      reports: [],
      milestones: [
        milestoneSeed('ms-start', 'Getting started', 'Bắt đầu', 1, [
          ['Orientation', 'Định hướng'],
          ['Core concepts', 'Khái niệm cốt lõi'],
        ]),
        milestoneSeed('ms-build', 'Build skills', 'Xây kỹ năng', 2, [
          ['Applied drill', 'Luyện áp dụng'],
          ['Review', 'Ôn tập'],
        ]),
      ],
    };
    store = [recompute(created), ...store.filter((item) => item.id !== id)];
    return structuredClone(store[0]);
  },

  async markTheoryCompleted(roadmapId: string, lessonId: string): Promise<LearningRoadmapDetail> {
    if (!usesMockData('practice')) {
      throw new Error('Learning path API is not wired yet.');
    }
    await mockDelay(400);
    const index = store.findIndex((item) => item.id === roadmapId);
    if (index < 0) throw new Error('ROADMAP_NOT_FOUND');
    if (store[index].readOnly) throw new Error('ROADMAP_READ_ONLY');

    const found = findLesson(store[index], lessonId);
    if (!found) throw new Error('LESSON_NOT_FOUND');
    if (found.milestone.status !== 'current') throw new Error('MILESTONE_LOCKED');
    if (found.lesson.theoryStatus === 'locked') throw new Error('THEORY_LOCKED');

    store[index] = {
      ...store[index],
      milestones: store[index].milestones.map((milestone) => ({
        ...milestone,
        lessons: milestone.lessons.map((lesson) =>
          lesson.id === lessonId
            ? { ...lesson, theoryStatus: 'completed', practiceStatus: 'available', status: 'in_progress' }
            : lesson,
        ),
      })),
    };
    store[index] = recompute(store[index]);
    return structuredClone(store[index]);
  },

  async getPracticeQuestions() {
    await mockDelay(200);
    return structuredClone(LEARNING_PRACTICE_QUESTIONS);
  },

  async beginSharedInterviewPractice(input: {
    roadmapId: string;
    lessonId: string;
    title: string;
  }) {
    const result = await startLearningLessonPractice(input);
    if (!result.ok) {
      throw new Error(result.code);
    }
    const meta = getLearningPracticeSession(result.session.sessionId);
    if (!meta) {
      throw new Error('SESSION_NOT_REGISTERED');
    }
    return meta;
  },

  async evaluateAnswer(questionId: string): Promise<LearningPracticeQuestionFeedback> {
    await mockDelay(600);
    void questionId;
    return instantFeedback();
  },

  async completePracticeSession(
    roadmapId: string,
    lessonId: string,
    questionFeedback: LearningPracticeReport['questionFeedback'],
  ): Promise<{ roadmap: LearningRoadmapDetail; report: LearningPracticeReport }> {
    if (!usesMockData('practice')) {
      throw new Error('Learning path API is not wired yet.');
    }
    await mockDelay(700);
    const index = store.findIndex((item) => item.id === roadmapId);
    if (index < 0) throw new Error('ROADMAP_NOT_FOUND');
    if (store[index].readOnly) throw new Error('ROADMAP_READ_ONLY');

    const found = findLesson(store[index], lessonId);
    if (!found) throw new Error('LESSON_NOT_FOUND');
    if (found.lesson.theoryStatus !== 'completed') throw new Error('THEORY_REQUIRED');
    if (found.lesson.practiceStatus === 'locked') throw new Error('PRACTICE_LOCKED');

    const report = createPracticeReportStub({
      id: `report-${lessonId}-${Date.now()}`,
      lessonId,
      roadmapId,
      questionFeedback,
    });

    store[index] = {
      ...store[index],
      reports: [report, ...store[index].reports],
      milestones: store[index].milestones.map((milestone) => ({
        ...milestone,
        lessons: milestone.lessons.map((lesson) =>
          lesson.id === lessonId
            ? {
                ...lesson,
                practiceStatus: 'completed',
                status: 'completed',
                practiceReportId: report.id,
              }
            : lesson,
        ),
      })),
    };
    store[index] = recompute(store[index]);
    return { roadmap: structuredClone(store[index]), report };
  },

  async getReport(roadmapId: string, reportId: string): Promise<LearningPracticeReport> {
    await mockDelay(200);
    const roadmap = store.find((item) => item.id === roadmapId);
    const report = roadmap?.reports.find((item) => item.id === reportId);
    if (!report) throw new Error('REPORT_NOT_FOUND');
    return structuredClone(report);
  },
};

function milestoneSeed(
  id: string,
  title: string,
  titleVi: string,
  order: number,
  lessons: Array<[string, string]>,
): LearningMilestone {
  return {
    id,
    title,
    titleVi,
    order,
    status: order === 1 ? 'current' : 'locked',
    progressPercent: 0,
    lessons: lessons.map(([en, vi], index) => {
      const html = buildLessonHtml(en, vi);
      return {
        id: `${id}-l${index + 1}`,
        title: en,
        titleVi: vi,
        order: index + 1,
        theoryStatus: order === 1 && index === 0 ? 'available' : 'locked',
        practiceStatus: 'locked',
        // Lộ trình vừa tạo: chưa luyện lần nào nên chưa có gì để làm lại.
        attemptCount: 0,
        canRetry: false,
        content: html.content,
        contentVi: html.contentVi,
        status: 'not_started' as const,
      };
    }),
  };
}
