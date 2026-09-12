import type { RoadmapResponse } from '../types/learning.types';

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
