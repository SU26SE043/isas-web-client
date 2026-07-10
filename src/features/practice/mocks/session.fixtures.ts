export interface PracticeQuestion {
  id: string;
  content: string;
  expectedAnswer?: string;
  timeLimitSeconds?: number;
}

export interface PracticeSession {
  sessionId: string;
  title: string;
  description: string;
  status: 'initializing' | 'ready' | 'in_progress' | 'completed';
  questions: PracticeQuestion[];
}

export const MOCK_PRACTICE_SESSIONS: Record<string, PracticeSession> = {
  'session-123': {
    sessionId: 'session-123',
    title: 'Phỏng vấn Frontend Developer',
    description: 'Buổi phỏng vấn kỹ năng ReactJS và TypeScript',
    status: 'ready',
    questions: [
      {
        id: 'q1',
        content: 'Bạn hãy giới thiệu bản thân và kinh nghiệm làm việc với ReactJS?',
        timeLimitSeconds: 120,
      },
      {
        id: 'q2',
        content:
          'Phân biệt giữa Virtual DOM và Real DOM. Tại sao Virtual DOM lại được cho là tối ưu hiệu suất?',
        timeLimitSeconds: 180,
      },
      {
        id: 'q3',
        content:
          'Bạn xử lý quản lý state (state management) trong React như thế nào đối với một ứng dụng quy mô lớn?',
        timeLimitSeconds: 180,
      },
    ],
  },
  'session-async-456': {
    sessionId: 'session-async-456',
    title: 'Phỏng vấn Backend Developer (Đang tạo câu hỏi)',
    description: 'Buổi phỏng vấn NodeJS (Giả lập việc sinh câu hỏi tốn thời gian)',
    status: 'initializing',
    questions: [],
  },
};

export const DEFAULT_PRACTICE_SESSION: PracticeSession = {
  sessionId: 'session-default',
  title: 'Phỏng vấn Giả lập Mặc định',
  description: 'Mô tả buổi phỏng vấn mock test mặc định',
  status: 'ready',
  questions: [
    {
      id: 'q-def-1',
      content: 'Hãy chia sẻ về một dự án khó nhất bạn từng làm và cách bạn vượt qua?',
      timeLimitSeconds: 120,
    },
    {
      id: 'q-def-2',
      content: 'Mục tiêu nghề nghiệp của bạn trong 3 năm tới là gì?',
      timeLimitSeconds: 120,
    },
  ],
};

export const MOCK_ASYNC_QUESTIONS: PracticeQuestion[] = [
  { id: 'q-async-1', content: 'Giải thích cơ chế Event Loop trong NodeJS?', timeLimitSeconds: 180 },
  {
    id: 'q-async-2',
    content: 'Làm thế nào để scale một ứng dụng NodeJS chịu tải lớn?',
    timeLimitSeconds: 240,
  },
];
