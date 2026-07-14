import type {
  ProgressAnalyticsDashboard,
  ProgressDomainId,
  ProgressHeatmapDay,
  ProgressScoreHistoryPoint,
  ProgressTimeRange,
} from '../types/progress.types';
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

const DOMAIN_OPTIONS: ProgressAnalyticsDashboard['availableDomains'] = [
  { id: 'all', name: 'All domains', nameVi: 'Tất cả domain' },
  { id: 'frontend', name: 'Frontend', nameVi: 'Frontend' },
  { id: 'backend', name: 'Backend', nameVi: 'Backend' },
  { id: 'ba', name: 'Business Analyst', nameVi: 'Business Analyst' },
  { id: 'data', name: 'Data', nameVi: 'Data' },
  { id: 'devops', name: 'DevOps', nameVi: 'DevOps' },
];

const SCORE_HISTORY: ProgressScoreHistoryPoint[] = [
  {
    id: 'sh-1',
    date: '2026-06-01',
    domainId: 'frontend',
    overall: 72,
    technical: 70,
    communication: 74,
    confidence: 68,
    problemSolving: 71,
    behavioral: 73,
    systemDesign: 65,
    reportId: 'interview-result-001',
    label: 'Practice #52',
    labelVi: 'Luyện #52',
  },
  {
    id: 'sh-2',
    date: '2026-06-10',
    domainId: 'backend',
    overall: 76,
    technical: 78,
    communication: 72,
    confidence: 70,
    problemSolving: 75,
    behavioral: 74,
    reportId: 'interview-result-001',
    label: 'Mock #8',
    labelVi: 'Mock #8',
  },
  {
    id: 'sh-3',
    date: '2026-06-20',
    domainId: 'frontend',
    overall: 81,
    technical: 84,
    communication: 78,
    confidence: 76,
    problemSolving: 80,
    behavioral: 79,
    systemDesign: 72,
    reportId: 'interview-result-001',
    label: 'Practice #55',
    labelVi: 'Luyện #55',
  },
  {
    id: 'sh-4',
    date: '2026-07-01',
    domainId: 'frontend',
    overall: 84,
    technical: 86,
    communication: 80,
    confidence: 82,
    problemSolving: 83,
    behavioral: 81,
    systemDesign: 78,
    reportId: 'interview-result-001',
    label: 'Practice #58',
    labelVi: 'Luyện #58',
  },
  {
    id: 'sh-5',
    date: '2026-07-08',
    domainId: 'ba',
    overall: 79,
    technical: 74,
    communication: 85,
    confidence: 80,
    problemSolving: 77,
    behavioral: 88,
    reportId: 'interview-result-001',
    label: 'Behavioral #3',
    labelVi: 'Behavioral #3',
  },
];

function buildHeatmap(): ProgressHeatmapDay[] {
  const days: ProgressHeatmapDay[] = [];
  const start = new Date('2026-04-01T00:00:00.000Z');
  for (let i = 0; i < 105; i += 1) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const sessions = (i * 7 + 3) % 5 === 0 ? (i % 4) + 1 : i % 6 === 0 ? 2 : 0;
    const hours = sessions * 0.75;
    const intensity = (sessions === 0 ? 0 : sessions === 1 ? 1 : sessions === 2 ? 2 : sessions === 3 ? 3 : 4) as
      | 0
      | 1
      | 2
      | 3
      | 4;
    days.push({ date: d.toISOString().slice(0, 10), sessions, hours, intensity });
  }
  return days;
}

const BASE_DASHBOARD: ProgressAnalyticsDashboard = {
  domainFilter: 'all',
  rangeFilter: '30d',
  availableDomains: DOMAIN_OPTIONS,
  overall: {
    overallSkillScore: 82,
    interviewReadinessPercent: 76,
    totalPracticeSessions: 58,
    totalMockInterviews: 8,
    totalLearningHours: 42,
    completedRoadmaps: 1,
    activeRoadmaps: 2,
    totalDomains: 5,
    currentStreak: 4,
    longestStreak: 12,
    averageSessionScore: 78,
    highestScore: 91,
    lastPracticeDate: '2026-07-08',
  },
  readiness: {
    overallPercent: 76,
    aiConfidenceScore: 72,
    dimensions: [
      { id: 'technical', label: 'Technical', labelVi: 'Kỹ thuật', percent: 82 },
      { id: 'behavioral', label: 'Behavioral', labelVi: 'Hành vi', percent: 74 },
      { id: 'communication', label: 'Communication', labelVi: 'Giao tiếp', percent: 78 },
      { id: 'problemSolving', label: 'Problem Solving', labelVi: 'Giải quyết vấn đề', percent: 80 },
    ],
    skillsToImprove: [
      { id: 'star', label: 'Behavioral STAR structure', labelVi: 'Cấu trúc STAR hành vi' },
      { id: 'english', label: 'English speaking fluency', labelVi: 'Độ trôi chảy tiếng Anh' },
    ],
  },
  domains: [
    {
      id: 'frontend',
      name: 'Frontend',
      nameVi: 'Frontend',
      currentScore: 84,
      improvementPercent: 12,
      practiceSessions: 22,
      mockInterviews: 3,
      roadmapProgressPercent: 38,
      lastPracticeDate: '2026-07-08',
      interviewReadinessPercent: 80,
      currentLevel: 'Junior+',
      currentLevelVi: 'Junior+',
    },
    {
      id: 'backend',
      name: 'Backend',
      nameVi: 'Backend',
      currentScore: 76,
      improvementPercent: 8,
      practiceSessions: 14,
      mockInterviews: 2,
      roadmapProgressPercent: 20,
      lastPracticeDate: '2026-06-28',
      interviewReadinessPercent: 70,
      currentLevel: 'Junior',
      currentLevelVi: 'Junior',
    },
    {
      id: 'ba',
      name: 'Business Analyst',
      nameVi: 'Business Analyst',
      currentScore: 79,
      improvementPercent: 5,
      practiceSessions: 9,
      mockInterviews: 1,
      roadmapProgressPercent: 15,
      lastPracticeDate: '2026-07-08',
      interviewReadinessPercent: 74,
      currentLevel: 'Junior',
      currentLevelVi: 'Junior',
    },
  ],
  scoreHistory: SCORE_HISTORY,
  skills: [
    {
      id: 'tech',
      name: 'Technical Knowledge',
      nameVi: 'Kiến thức kỹ thuật',
      currentScore: 82,
      improvementPercent: 12,
      trend: 'increasing',
      aiAssessment: 'Strong React fundamentals; deepen performance profiling.',
      aiAssessmentVi: 'Nền tảng React vững; cần sâu hơn về đo hiệu năng.',
    },
    {
      id: 'comm',
      name: 'Communication',
      nameVi: 'Giao tiếp',
      currentScore: 78,
      improvementPercent: 7,
      trend: 'increasing',
      aiAssessment: 'Clear structure; reduce filler words under time pressure.',
      aiAssessmentVi: 'Cấu trúc rõ; giảm filler khi bị áp lực thời gian.',
    },
    {
      id: 'ps',
      name: 'Problem Solving',
      nameVi: 'Giải quyết vấn đề',
      currentScore: 80,
      improvementPercent: 15,
      trend: 'increasing',
      aiAssessment: 'Good decomposition; state trade-offs earlier.',
      aiAssessmentVi: 'Phân rã tốt; nêu trade-off sớm hơn.',
    },
    {
      id: 'beh',
      name: 'Behavioral Interview',
      nameVi: 'Phỏng vấn hành vi',
      currentScore: 71,
      improvementPercent: -3,
      trend: 'decreasing',
      aiAssessment: 'STAR answers incomplete on conflict stories.',
      aiAssessmentVi: 'Câu STAR chưa đủ trên tình huống xung đột.',
    },
    {
      id: 'sd',
      name: 'System Design',
      nameVi: 'System Design',
      currentScore: 68,
      improvementPercent: 5,
      trend: 'stable',
      aiAssessment: 'Covers basics; need capacity and failure modes.',
      aiAssessmentVi: 'Đủ nền tảng; cần capacity và failure modes.',
    },
  ],
  strengths: [
    { id: 'react', name: 'React', nameVi: 'React', score: 88, stability: 90, frequency: 18 },
    { id: 'db', name: 'Database Design', nameVi: 'Thiết kế DB', score: 82, stability: 84, frequency: 9 },
    { id: 'api', name: 'REST API', nameVi: 'REST API', score: 85, stability: 86, frequency: 12 },
    { id: 'auth', name: 'Authentication', nameVi: 'Xác thực', score: 80, stability: 78, frequency: 7 },
    { id: 'comm-s', name: 'Communication', nameVi: 'Giao tiếp', score: 78, stability: 75, frequency: 20 },
  ],
  weaknesses: [
    { id: 'sql', name: 'SQL JOIN', nameVi: 'SQL JOIN', score: 58, practiceHref: '/practice' },
    { id: 'tc', name: 'Time Complexity', nameVi: 'Độ phức tạp', score: 62, practiceHref: '/practice' },
    { id: 'star', name: 'Behavioral STAR', nameVi: 'STAR hành vi', score: 60, practiceHref: '/practice' },
    { id: 'conf', name: 'Confidence', nameVi: 'Sự tự tin', score: 64, practiceHref: '/practice' },
    { id: 'en', name: 'English Speaking', nameVi: 'Nói tiếng Anh', score: 61, practiceHref: '/practice' },
  ],
  improvementTrends: [
    { id: 't1', name: 'Technical', nameVi: 'Kỹ thuật', deltaPercent: 12, trend: 'increasing' },
    { id: 't2', name: 'Communication', nameVi: 'Giao tiếp', deltaPercent: 7, trend: 'increasing' },
    { id: 't3', name: 'Problem Solving', nameVi: 'Giải quyết vấn đề', deltaPercent: 15, trend: 'increasing' },
    { id: 't4', name: 'Behavioral', nameVi: 'Hành vi', deltaPercent: -3, trend: 'decreasing' },
    { id: 't5', name: 'System Design', nameVi: 'System Design', deltaPercent: 5, trend: 'stable' },
  ],
  timeline: [
    {
      id: 'tl-1',
      relativeLabel: 'Today',
      relativeLabelVi: 'Hôm nay',
      title: 'Practice Session #58',
      titleVi: 'Phiên luyện #58',
      domain: 'Frontend',
      domainVi: 'Frontend',
      score: 84,
      reportId: 'interview-result-001',
      date: '2026-07-08',
    },
    {
      id: 'tl-2',
      relativeLabel: 'Yesterday',
      relativeLabelVi: 'Hôm qua',
      title: 'Mock Interview',
      titleVi: 'Mock Interview',
      domain: 'Backend',
      domainVi: 'Backend',
      score: 79,
      reportId: 'interview-result-001',
      date: '2026-07-07',
    },
    {
      id: 'tl-3',
      relativeLabel: '3 days ago',
      relativeLabelVi: '3 ngày trước',
      title: 'Behavioral Practice',
      titleVi: 'Luyện hành vi',
      domain: 'BA',
      domainVi: 'BA',
      score: 91,
      reportId: 'interview-result-001',
      date: '2026-07-05',
    },
  ],
  heatmap: buildHeatmap(),
  goals: [
    {
      id: 'g1',
      domain: 'Frontend',
      domainVi: 'Frontend',
      targetPercent: 90,
      currentPercent: 82,
      remainingPercent: 8,
      estimatedSessionsRemaining: 5,
    },
    {
      id: 'g2',
      domain: 'Communication',
      domainVi: 'Giao tiếp',
      targetPercent: 85,
      currentPercent: 78,
      remainingPercent: 7,
      estimatedSessionsRemaining: 4,
    },
  ],
  roadmaps: [
    {
      id: 'roadmap-frontend-junior',
      name: 'Frontend path to Junior',
      nameVi: 'Lộ trình Frontend tới Junior',
      currentMilestone: 'React fundamentals',
      currentMilestoneVi: 'Nền tảng React',
      completionPercent: 38,
      estimatedFinishDate: '2026-09-15',
      remainingModules: 8,
      completedModules: 5,
    },
    {
      id: 'roadmap-backend-middle',
      name: 'Backend to Middle',
      nameVi: 'Backend tới Middle',
      currentMilestone: 'API design',
      currentMilestoneVi: 'Thiết kế API',
      completionPercent: 12,
      estimatedFinishDate: '2026-11-01',
      remainingModules: 14,
      completedModules: 2,
    },
  ],
  achievements: MOCK_ACHIEVEMENTS.map((item) => ({
    id: item.id,
    title: item.title,
    titleVi: item.titleVi,
    earned: item.earned,
    earnedAt: item.earnedAt,
  })),
  insights: [
    {
      id: 'i1',
      title: 'Fastest improving skill',
      titleVi: 'Kỹ năng cải thiện nhanh nhất',
      body: 'Problem Solving rose 15% over 30 days after more structured drills.',
      bodyVi: 'Giải quyết vấn đề tăng 15% trong 30 ngày nhờ luyện có cấu trúc.',
    },
    {
      id: 'i2',
      title: 'Repeated gap',
      titleVi: 'Lỗi lặp lại',
      body: 'SQL JOIN explanations stay shallow across three Backend sessions.',
      bodyVi: 'Giải thích SQL JOIN còn nông qua ba phiên Backend.',
    },
    {
      id: 'i3',
      title: 'Focus domain',
      titleVi: 'Domain nên tập trung',
      body: 'Frontend readiness is highest; keep cadence while lifting Behavioral STAR.',
      bodyVi: 'Frontend sẵn sàng cao nhất; giữ nhịp và cải thiện STAR hành vi.',
    },
  ],
  recommendations: [
    {
      id: 'r1',
      title: 'React Hooks Practice',
      titleVi: 'Luyện React Hooks',
      reason: 'Closes remaining frontend gaps before Junior target.',
      reasonVi: 'Khép nốt khoảng trống frontend trước mục tiêu Junior.',
      practiceHref: '/practice',
    },
    {
      id: 'r2',
      title: 'SQL Optimization',
      titleVi: 'Tối ưu SQL',
      reason: 'Addresses repeated JOIN weakness.',
      reasonVi: 'Khắc phục điểm yếu JOIN lặp lại.',
      practiceHref: '/practice',
    },
    {
      id: 'r3',
      title: 'Behavioral STAR',
      titleVi: 'STAR hành vi',
      reason: 'Behavioral trend is decreasing.',
      reasonVi: 'Xu hướng hành vi đang giảm.',
      practiceHref: '/practice',
    },
    {
      id: 'r4',
      title: 'Mock Interview',
      titleVi: 'Mock Interview',
      reason: 'Raise overall interview readiness above 80%.',
      reasonVi: 'Đưa mức sẵn sàng phỏng vấn lên trên 80%.',
      practiceHref: '/practice',
    },
  ],
  comparative: [
    {
      id: 'c1',
      label: 'This week vs last week',
      labelVi: 'Tuần này vs tuần trước',
      improvementPercent: 6,
      practiceFrequency: 4,
      averageScore: 82,
      learningHours: 5.5,
    },
    {
      id: 'c2',
      label: 'This month vs last month',
      labelVi: 'Tháng này vs tháng trước',
      improvementPercent: 11,
      practiceFrequency: 14,
      averageScore: 79,
      learningHours: 18,
    },
    {
      id: 'c3',
      label: 'Current quarter vs previous',
      labelVi: 'Quý hiện tại vs quý trước',
      improvementPercent: 18,
      practiceFrequency: 36,
      averageScore: 76,
      learningHours: 42,
    },
  ],
  sessionAnalytics: {
    averageSessionDurationMinutes: 28,
    averageScore: 78,
    averageAiQuestions: 6,
    averageResponseTimeSeconds: 42,
    averageRetryCount: 0.4,
    averageConfidence: 72,
    averageSpeakingSpeedWpm: 118,
    averageThinkingTimeSeconds: 8,
  },
};

function rangeStart(range: ProgressTimeRange): string | null {
  if (range === 'all') return null;
  const end = new Date('2026-07-14T00:00:00.000Z');
  const days =
    range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : range === '6m' ? 182 : 365;
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - days);
  return start.toISOString().slice(0, 10);
}

export function buildProgressAnalyticsDashboard(
  domain: ProgressDomainId = 'all',
  range: ProgressTimeRange = '30d',
): ProgressAnalyticsDashboard {
  const start = rangeStart(range);
  let scoreHistory = SCORE_HISTORY.filter((point) => !start || point.date >= start);
  if (domain !== 'all') {
    scoreHistory = scoreHistory.filter((point) => point.domainId === domain);
  }

  return {
    ...structuredClone(BASE_DASHBOARD),
    domainFilter: domain,
    rangeFilter: range,
    domains:
      domain === 'all'
        ? structuredClone(BASE_DASHBOARD.domains)
        : structuredClone(BASE_DASHBOARD.domains).filter((item) => item.id === domain),
    scoreHistory: structuredClone(scoreHistory),
    timeline:
      domain === 'all'
        ? structuredClone(BASE_DASHBOARD.timeline)
        : structuredClone(BASE_DASHBOARD.timeline).filter((item) =>
            item.domain.toLowerCase().includes(domain === 'ba' ? 'ba' : domain),
          ),
  };
}

export const MOCK_PROGRESS_ANALYTICS = buildProgressAnalyticsDashboard();
