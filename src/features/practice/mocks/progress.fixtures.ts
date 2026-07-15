import type { ProgressMinimalDashboard } from '../types/progress.types';
import type {
  Achievement,
  LeaderboardEntry,
  LearningPracticeSession,
  ProgressDashboardData,
} from '../types/learning.types';

/** Legacy thin dashboard (learning.service). */
export const MOCK_PROGRESS_DASHBOARD: ProgressDashboardData = {
  modulesCompleted: 1,
  totalModules: 4,
  averageScore: 78,
  practiceMinutes: 186,
  weeklyActivity: [
    { weekLabel: 'Jun W1', weekLabelVi: 'Th6 T1', sessions: 2, averageScore: 72 },
    { weekLabel: 'Jun W2', weekLabelVi: 'Th6 T2', sessions: 3, averageScore: 76 },
    { weekLabel: 'Jun W3', weekLabelVi: 'Th6 T3', sessions: 1, averageScore: 78 },
    { weekLabel: 'Jul W1', weekLabelVi: 'Th7 T1', sessions: 4, averageScore: 81 },
  ],
  skillTrends: [
    { skill: 'Technical', skillVi: 'Kỹ thuật', current: 78, previous: 70 },
    { skill: 'Communication', skillVi: 'Giao tiếp', current: 74, previous: 71 },
    { skill: 'Problem Solving', skillVi: 'Giải quyết vấn đề', current: 72, previous: 68 },
    { skill: 'English', skillVi: 'Tiếng Anh', current: 66, previous: 62 },
  ],
};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, candidateName: 'Alex Nguyen', score: 94, sessions: 18 },
  { rank: 2, candidateName: 'Mai Tran', score: 91, sessions: 15 },
  { rank: 3, candidateName: 'Jonathan Doe', score: 88, sessions: 12, isCurrentUser: true },
  { rank: 4, candidateName: 'Chris Le', score: 86, sessions: 11 },
  { rank: 5, candidateName: 'Hana Pham', score: 84, sessions: 10 },
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-session',
    title: 'First Practice',
    titleVi: 'Phiên luyện đầu tiên',
    description: 'Complete your first practice interview.',
    descriptionVi: 'Hoàn thành phiên luyện phỏng vấn đầu tiên.',
    earned: true,
    earnedAt: '2026-01-08T10:30:00.000Z',
  },
  {
    id: 'score-80',
    title: 'Strong Performance',
    titleVi: 'Thành tích tốt',
    description: 'Score 80 or higher on a completed session.',
    descriptionVi: 'Đạt 80 điểm trở lên trong một phiên hoàn thành.',
    earned: true,
    earnedAt: '2026-02-03T11:45:00.000Z',
  },
  {
    id: 'module-complete',
    title: 'Module Master',
    titleVi: 'Hoàn thành module',
    description: 'Finish a learning module at 80% or above.',
    descriptionVi: 'Hoàn thành module học tập đạt 80% trở lên.',
    earned: true,
    earnedAt: '2026-06-12T14:40:00.000Z',
  },
  {
    id: 'streak-5',
    title: 'Five-Session Streak',
    titleVi: 'Chuỗi 5 phiên',
    description: 'Practice on five consecutive weeks.',
    descriptionVi: 'Luyện tập trong 5 tuần liên tiếp.',
    earned: false,
  },
];

export const MOCK_PRACTICE_SESSIONS: Record<string, LearningPracticeSession> = {
  'module-react-arch': {
    sessionId: 'practice-module-react-arch',
    moduleId: 'module-react-arch',
    prompts: [
      {
        id: 'p1',
        prompt: 'Explain when you would lift state up versus using context in React.',
        promptVi: 'Giải thích khi nào bạn nên đưa state lên component cha thay vì dùng context trong React.',
        durationSeconds: 75,
      },
    ],
  },
  'module-system-design': {
    sessionId: 'practice-module-system-design',
    moduleId: 'module-system-design',
    prompts: [
      {
        id: 'p1',
        prompt: 'Explain how you would scale a dashboard used by 50k daily active users.',
        promptVi: 'Giải thích cách bạn mở rộng dashboard cho 50k người dùng hoạt động mỗi ngày.',
        durationSeconds: 90,
      },
      {
        id: 'p2',
        prompt: 'Compare SSR and CSR for a content-heavy marketing site.',
        promptVi: 'So sánh SSR và CSR cho website marketing nhiều nội dung.',
        durationSeconds: 60,
      },
    ],
  },
  'module-english-fluency': {
    sessionId: 'practice-module-english-fluency',
    moduleId: 'module-english-fluency',
    prompts: [
      {
        id: 'p1',
        prompt: 'Describe a conflict you resolved on a team project.',
        promptVi: 'Mô tả một xung đột bạn đã giải quyết trong dự án nhóm.',
        durationSeconds: 60,
      },
    ],
  },
};

export function buildProgressMinimalDashboard(): ProgressMinimalDashboard {
  return {
    roadmapCompletion: {
      completed: 12,
      inProgress: 5,
      locked: 8,
    },
    skillBreakdown: [
      { id: 'java-spring', name: 'Java Spring Boot', nameVi: 'Java Spring Boot', completed: 4, inProgress: 2 },
      { id: 'sql', name: 'SQL', nameVi: 'SQL', completed: 3, inProgress: 1 },
      { id: 'aws', name: 'AWS', nameVi: 'AWS', completed: 2, inProgress: 2 },
      { id: 'docker', name: 'Docker', nameVi: 'Docker', completed: 2, inProgress: 1 },
      { id: 'rest', name: 'REST API', nameVi: 'REST API', completed: 3, inProgress: 1 },
      { id: 'soft', name: 'Soft Skills', nameVi: 'Kỹ năng mềm', completed: 1, inProgress: 2 },
    ],
    practiceScores: [
      { id: 'ps-1', sessionLabel: 'Session 1', sessionLabelVi: 'Phiên 1', score: 62 },
      { id: 'ps-2', sessionLabel: 'Session 2', sessionLabelVi: 'Phiên 2', score: 68 },
      { id: 'ps-3', sessionLabel: 'Session 3', sessionLabelVi: 'Phiên 3', score: 71 },
      { id: 'ps-4', sessionLabel: 'Session 4', sessionLabelVi: 'Phiên 4', score: 74 },
      { id: 'ps-5', sessionLabel: 'Session 5', sessionLabelVi: 'Phiên 5', score: 79 },
      { id: 'ps-6', sessionLabel: 'Session 6', sessionLabelVi: 'Phiên 6', score: 82 },
      { id: 'ps-7', sessionLabel: 'Session 7', sessionLabelVi: 'Phiên 7', score: 85 },
    ],
  };
}

export const MOCK_PROGRESS_MINIMAL = buildProgressMinimalDashboard();
