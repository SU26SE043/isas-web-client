// src/features/practice/mocks.ts

export interface MockQuestion {
  id: string;
  content: string;
  expectedAnswer?: string;
  timeLimitSeconds?: number;
}

export interface MockPracticeSession {
  sessionId: string;
  title: string;
  description: string;
  status: 'initializing' | 'ready' | 'in_progress' | 'completed';
  questions: MockQuestion[];
}

// 1. Dữ liệu Fake (Mock Data)
export const MOCK_SESSION_DATA: Record<string, MockPracticeSession> = {
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
        content: 'Phân biệt giữa Virtual DOM và Real DOM. Tại sao Virtual DOM lại được cho là tối ưu hiệu suất?',
        timeLimitSeconds: 180,
      },
      {
        id: 'q3',
        content: 'Bạn xử lý quản lý state (state management) trong React như thế nào đối với một ứng dụng quy mô lớn?',
        timeLimitSeconds: 180,
      }
    ]
  },
  'session-async-456': {
    sessionId: 'session-async-456',
    title: 'Phỏng vấn Backend Developer (Đang tạo câu hỏi)',
    description: 'Buổi phỏng vấn NodeJS (Giả lập việc sinh câu hỏi tốn thời gian)',
    status: 'initializing', // Trạng thái đang khởi tạo, cần poll
    questions: []
  }
};

// 2. Các hàm Fake gọi API (Mock APIs)

/**
 * Mock API: GET /api/practice/sessions/{sessionId}
 * Khởi tạo buổi, lấy metadata + danh sách câu hỏi
 */
export const fetchMockSessionMetadata = async (sessionId: string): Promise<MockPracticeSession> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const session = MOCK_SESSION_DATA[sessionId];
      if (session) {
        resolve(session);
      } else {
        // Trả về dữ liệu mặc định nếu truyền id bất kỳ
        resolve({
          sessionId,
          title: 'Phỏng vấn Giả lập Mặc định',
          description: 'Mô tả buổi phỏng vấn mock test mặc định',
          status: 'ready',
          questions: [
            { id: 'q-def-1', content: 'Hãy chia sẻ về một dự án khó nhất bạn từng làm và cách bạn vượt qua?', timeLimitSeconds: 120 },
            { id: 'q-def-2', content: 'Mục tiêu nghề nghiệp của bạn trong 3 năm tới là gì?', timeLimitSeconds: 120 }
          ]
        });
      }
    }, 1000); // Fake delay 1 giây để giống API thực
  });
};

/**
 * Mock API: GET /api/practice/sessions/{sessionId}/questions
 * Poll để lấy danh sách câu hỏi trong trường hợp quá trình sinh câu hỏi là bất đồng bộ (async)
 */
let pollCount = 0; // Biến tạm giả lập việc poll (gọi lại nhiều lần)
export const fetchMockSessionQuestions = async (sessionId: string): Promise<MockQuestion[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const session = MOCK_SESSION_DATA[sessionId];
      
      // Nếu session đã ready thì trả luôn danh sách questions
      if (session && session.status === 'ready') {
        return resolve(session.questions);
      }

      // Giả lập hành vi poll (gọi lần 1, 2 trả về rỗng, lần 3 mới có dữ liệu)
      pollCount++;
      if (pollCount < 3) {
        console.log(`[Mock API] Polling questions lần ${pollCount}... Chưa có dữ liệu.`);
        // Trả về mảng rỗng để bên ngoài tiếp tục gọi lại (poll)
        resolve([]);
      } else {
        console.log(`[Mock API] Polling questions lần ${pollCount}... Đã tạo xong câu hỏi!`);
        pollCount = 0; // Reset
        resolve([
          { id: 'q-async-1', content: 'Giải thích cơ chế Event Loop trong NodeJS?', timeLimitSeconds: 180 },
          { id: 'q-async-2', content: 'Làm thế nào để scale một ứng dụng NodeJS chịu tải lớn?', timeLimitSeconds: 240 },
        ]);
      }
    }, 800); // Fake delay 0.8 giây
  });
};
