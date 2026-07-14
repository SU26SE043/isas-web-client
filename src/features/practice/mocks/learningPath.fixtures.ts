import type {
  LearningLesson,
  LearningMilestone,
  LearningPracticeQuestion,
  LearningPracticeReport,
  LearningRoadmapDetail,
} from '../types/learningPath.types';
import { buildLessonHtml } from './lessonContent.fixtures';

export const LEARNING_PRACTICE_QUESTIONS: LearningPracticeQuestion[] = [
  {
    id: 'lpq-1',
    prompt: 'Explain the difference between let, const, and var in JavaScript.',
    promptVi: 'Giải thích sự khác nhau giữa let, const và var trong JavaScript.',
  },
  {
    id: 'lpq-2',
    prompt: 'How does the event loop handle async callbacks?',
    promptVi: 'Event loop xử lý callback bất đồng bộ như thế nào?',
  },
  {
    id: 'lpq-3',
    prompt: 'Describe when you would use useMemo in a React component.',
    promptVi: 'Bạn dùng useMemo trong React khi nào?',
  },
];

function lesson(
  id: string,
  title: string,
  titleVi: string,
  order: number,
  theory: LearningLesson['theoryStatus'],
  practice: LearningLesson['practiceStatus'],
): LearningLesson {
  const status =
    theory === 'completed' && practice === 'completed'
      ? 'completed'
      : theory === 'completed' || practice === 'completed' || theory === 'available'
        ? 'in_progress'
        : 'not_started';
  const html = buildLessonHtml(title, titleVi);
  return {
    id,
    title,
    titleVi,
    order,
    theoryStatus: theory,
    practiceStatus: practice,
    content: html.content,
    contentVi: html.contentVi,
    status,
  };
}

function milestone(
  id: string,
  title: string,
  titleVi: string,
  order: number,
  status: LearningMilestone['status'],
  lessons: LearningLesson[],
): LearningMilestone {
  const completedParts = lessons.reduce((sum, item) => {
    return sum + (item.theoryStatus === 'completed' ? 1 : 0) + (item.practiceStatus === 'completed' ? 1 : 0);
  }, 0);
  const totalParts = lessons.length * 2;
  return {
    id,
    title,
    titleVi,
    order,
    status,
    progressPercent: totalParts === 0 ? 0 : Math.round((completedParts / totalParts) * 100),
    lessons,
  };
}

export const MOCK_LEARNING_PATH_ROADMAPS: LearningRoadmapDetail[] = [
  {
    id: 'roadmap-frontend-junior',
    name: 'Frontend path to Junior',
    nameVi: 'Lộ trình Frontend tới Junior',
    domainId: 'frontend',
    domainLabel: 'Frontend',
    domainLabelVi: 'Frontend',
    targetLevel: 'junior',
    status: 'in_progress',
    progressPercent: 8,
    currentMilestoneId: 'ms-js',
    currentMilestoneTitle: 'JavaScript Fundamentals',
    currentMilestoneTitleVi: 'Nền tảng JavaScript',
    currentLessonId: 'ms-js-l1',
    currentLessonTitle: 'Variables & Types',
    currentLessonTitleVi: 'Biến & Kiểu dữ liệu',
    estimatedRemainingHours: 18,
    updatedAt: '2026-07-12T10:00:00.000Z',
    readOnly: false,
    reports: [],
    milestones: [
      milestone('ms-js', 'JavaScript Fundamentals', 'Nền tảng JavaScript', 1, 'current', [
        lesson('ms-js-l1', 'Variables & Types', 'Biến & Kiểu dữ liệu', 1, 'available', 'locked'),
        lesson('ms-js-l2', 'Functions & Scope', 'Hàm & Scope', 2, 'locked', 'locked'),
        lesson('ms-js-l3', 'Arrays & Objects', 'Mảng & Object', 3, 'locked', 'locked'),
      ]),
      milestone('ms-dom', 'DOM & Events', 'DOM & Sự kiện', 2, 'locked', [
        lesson('ms-dom-l1', 'Selecting Elements', 'Truy vấn phần tử', 1, 'locked', 'locked'),
        lesson('ms-dom-l2', 'Event Handling', 'Xử lý sự kiện', 2, 'locked', 'locked'),
      ]),
      milestone('ms-async', 'Async Programming', 'Lập trình bất đồng bộ', 3, 'locked', [
        lesson('ms-async-l1', 'Promises', 'Promises', 1, 'locked', 'locked'),
        lesson('ms-async-l2', 'Async/Await', 'Async/Await', 2, 'locked', 'locked'),
      ]),
      milestone('ms-react', 'React Basics', 'Nền tảng React', 4, 'locked', [
        lesson('ms-react-l1', 'Components & Props', 'Components & Props', 1, 'locked', 'locked'),
        lesson('ms-react-l2', 'State & Effects', 'State & Effects', 2, 'locked', 'locked'),
      ]),
    ],
  },
  {
    id: 'roadmap-backend-middle',
    name: 'Backend path to Middle',
    nameVi: 'Lộ trình Backend tới Middle',
    domainId: 'backend',
    domainLabel: 'Backend',
    domainLabelVi: 'Backend',
    targetLevel: 'middle',
    status: 'not_started',
    progressPercent: 0,
    currentMilestoneId: 'ms-http',
    currentMilestoneTitle: 'HTTP & APIs',
    currentMilestoneTitleVi: 'HTTP & API',
    currentLessonId: 'ms-http-l1',
    currentLessonTitle: 'REST Fundamentals',
    currentLessonTitleVi: 'Nền tảng REST',
    estimatedRemainingHours: 24,
    updatedAt: '2026-07-10T08:00:00.000Z',
    readOnly: false,
    reports: [],
    milestones: [
      milestone('ms-http', 'HTTP & APIs', 'HTTP & API', 1, 'current', [
        lesson('ms-http-l1', 'REST Fundamentals', 'Nền tảng REST', 1, 'available', 'locked'),
        lesson('ms-http-l2', 'Auth Basics', 'Cơ bản Auth', 2, 'locked', 'locked'),
      ]),
      milestone('ms-db', 'Databases', 'Cơ sở dữ liệu', 2, 'locked', [
        lesson('ms-db-l1', 'SQL Modeling', 'Mô hình SQL', 1, 'locked', 'locked'),
        lesson('ms-db-l2', 'Indexing', 'Lập chỉ mục', 2, 'locked', 'locked'),
      ]),
    ],
  },
];

export function createPracticeReportStub(partial: {
  id: string;
  lessonId: string;
  roadmapId: string;
  questionFeedback: LearningPracticeReport['questionFeedback'];
}): LearningPracticeReport {
  return {
    id: partial.id,
    lessonId: partial.lessonId,
    roadmapId: partial.roadmapId,
    overallScore: 78,
    technicalScore: 80,
    communicationScore: 74,
    strengths: ['Clear structure', 'Good examples'],
    strengthsVi: ['Cấu trúc rõ', 'Ví dụ tốt'],
    weaknesses: ['Could go deeper on edge cases'],
    weaknessesVi: ['Có thể đi sâu hơn về edge cases'],
    knowledgeGaps: ['Event loop microtasks'],
    knowledgeGapsVi: ['Microtask trong event loop'],
    recommendedTopics: ['Promises advanced', 'React performance'],
    recommendedTopicsVi: ['Promises nâng cao', 'Hiệu năng React'],
    aiSummary: 'Solid answers with room to deepen async and React optimization topics.',
    aiSummaryVi: 'Trả lời vững, cần sâu hơn về async và tối ưu React.',
    nextActions: ['Review event loop notes', 'Practice one more React state drill'],
    nextActionsVi: ['Ôn lại event loop', 'Luyện thêm một bài React state'],
    questionFeedback: partial.questionFeedback,
    createdAt: new Date().toISOString(),
  };
}
