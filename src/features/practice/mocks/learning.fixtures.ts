import type {
  CertificateRecord,
  LearningModule,
  LearningModuleContent,
  RoadmapResponse,
} from '../types/learning.types';

export const MOCK_ROADMAP: RoadmapResponse = {
  regenerateCount: 1,
  regenerateLimit: 3,
  steps: [
    {
      id: 'step-1',
      title: 'Strengthen React architecture fundamentals',
      titleVi: 'Củng cố nền tảng kiến trúc React',
      description: 'Review component patterns, state boundaries, and performance basics.',
      descriptionVi: 'Ôn pattern component, ranh giới state và nền tảng hiệu năng.',
      skillTag: 'Technical',
      skillTagVi: 'Kỹ thuật',
      estimatedWeeks: 2,
      moduleId: 'module-react-arch',
      completed: true,
    },
    {
      id: 'step-2',
      title: 'Practice system design storytelling',
      titleVi: 'Luyện kể chuyện system design',
      description: 'Use a repeatable framework for scalability and trade-off questions.',
      descriptionVi: 'Dùng khung cố định cho câu hỏi mở rộng và trade-off.',
      skillTag: 'Problem Solving',
      skillTagVi: 'Giải quyết vấn đề',
      estimatedWeeks: 3,
      moduleId: 'module-system-design',
      completed: false,
    },
    {
      id: 'step-3',
      title: 'Improve spoken English under pressure',
      titleVi: 'Cải thiện tiếng Anh khi chịu áp lực',
      description: 'Daily timed speaking drills with interview vocabulary.',
      descriptionVi: 'Luyện nói theo timer hàng ngày với từ vựng phỏng vấn.',
      skillTag: 'English',
      skillTagVi: 'Tiếng Anh',
      estimatedWeeks: 4,
      moduleId: 'module-english-fluency',
      completed: false,
    },
  ],
};

export const MOCK_LEARNING_MODULES: LearningModule[] = [
  {
    id: 'module-react-arch',
    title: 'React Architecture Patterns',
    titleVi: 'Pattern kiến trúc React',
    description: 'Composition, state colocation, and rendering strategies.',
    descriptionVi: 'Composition, colocation state và chiến lược render.',
    skillTag: 'Technical',
    skillTagVi: 'Kỹ thuật',
    durationMinutes: 45,
    progressPercent: 100,
    status: 'completed',
    passThreshold: 80,
  },
  {
    id: 'module-system-design',
    title: 'Frontend System Design',
    titleVi: 'System design frontend',
    description: 'Scalability, caching, and API boundaries for web apps.',
    descriptionVi: 'Mở rộng, caching và ranh giới API cho web app.',
    skillTag: 'Problem Solving',
    skillTagVi: 'Giải quyết vấn đề',
    durationMinutes: 60,
    progressPercent: 35,
    status: 'in_progress',
    passThreshold: 80,
  },
  {
    id: 'module-english-fluency',
    title: 'Interview English Fluency',
    titleVi: 'Luyện tiếng Anh phỏng vấn',
    description: 'Timed responses, clarity, and professional vocabulary.',
    descriptionVi: 'Trả lời theo timer, độ rõ ràng và từ vựng chuyên nghiệp.',
    skillTag: 'English',
    skillTagVi: 'Tiếng Anh',
    durationMinutes: 30,
    progressPercent: 0,
    status: 'not_started',
    passThreshold: 80,
  },
  {
    id: 'module-debugging',
    title: 'Structured Debugging',
    titleVi: 'Debug có cấu trúc',
    description: 'Reproduce, isolate, fix, and prevent regressions.',
    descriptionVi: 'Tái hiện, cô lập, sửa và phòng ngừa hồi quy.',
    skillTag: 'Problem Solving',
    skillTagVi: 'Giải quyết vấn đề',
    durationMinutes: 40,
    progressPercent: 0,
    status: 'not_started',
    passThreshold: 80,
  },
];

export const MOCK_MODULE_CONTENT: Record<string, LearningModuleContent> = {
  'module-react-arch': {
    id: 'module-react-arch',
    sections: [
      {
        id: 's1',
        title: 'Component boundaries',
        titleVi: 'Ranh giới component',
        body: 'Split UI by responsibility and keep state as close to usage as possible.',
        bodyVi: 'Tách UI theo trách nhiệm và giữ state gần nơi sử dụng nhất.',
      },
      {
        id: 's2',
        title: 'Rendering strategies',
        titleVi: 'Chiến lược render',
        body: 'Choose client, server, or hybrid rendering based on interactivity and SEO needs.',
        bodyVi: 'Chọn client, server hoặc hybrid render theo nhu cầu tương tác và SEO.',
      },
    ],
  },
  'module-system-design': {
    id: 'module-system-design',
    sections: [
      {
        id: 's1',
        title: 'Start with constraints',
        titleVi: 'Bắt đầu từ ràng buộc',
        body: 'Clarify users, scale, latency budget, and team size before proposing architecture.',
        bodyVi: 'Làm rõ người dùng, quy mô, ngân sách latency và quy mô team trước khi đề xuất kiến trúc.',
      },
      {
        id: 's2',
        title: 'Draw the data flow',
        titleVi: 'Vẽ luồng dữ liệu',
        body: 'Map client, API gateway, services, cache, and storage. Call out failure points.',
        bodyVi: 'Vẽ client, API gateway, service, cache và storage. Chỉ rõ điểm lỗi.',
      },
      {
        id: 's3',
        title: 'Name trade-offs aloud',
        titleVi: 'Nói rõ trade-off',
        body: 'Compare at least two options and justify the pick with measurable criteria.',
        bodyVi: 'So sánh ít nhất hai phương án và biện minh bằng tiêu chí đo được.',
      },
    ],
  },
  'module-english-fluency': {
    id: 'module-english-fluency',
    sections: [
      {
        id: 's1',
        title: '60-second answer drill',
        titleVi: 'Luyện trả lời 60 giây',
        body: 'Pick one interview question and answer aloud with a timer. Review clarity and pace.',
        bodyVi: 'Chọn một câu hỏi phỏng vấn và trả lời to với timer. Tự đánh giá độ rõ và nhịp nói.',
      },
    ],
  },
  'module-debugging': {
    id: 'module-debugging',
    sections: [
      {
        id: 's1',
        title: 'Reproduce reliably',
        titleVi: 'Tái hiện ổn định',
        body: 'Capture exact steps, environment, and inputs before changing code.',
        bodyVi: 'Ghi lại bước, môi trường và input trước khi sửa code.',
      },
    ],
  },
};

export const MOCK_CERTIFICATES: Record<string, CertificateRecord> = {
  'cert-interview-1': {
    id: 'cert-interview-1',
    title: 'Frontend Developer Practice Certificate',
    titleVi: 'Chứng nhận luyện Frontend Developer',
    issuedAt: '2026-01-08T10:30:00.000Z',
    score: 85,
    interviewId: 'interview-1',
    candidateName: 'Jonathan Doe',
  },
  'cert-interview-3': {
    id: 'cert-interview-3',
    title: 'React Developer Practice Certificate',
    titleVi: 'Chứng nhận luyện React Developer',
    issuedAt: '2026-06-13T09:45:00.000Z',
    score: 78,
    interviewId: 'interview-3',
    candidateName: 'Jonathan Doe',
  },
};
