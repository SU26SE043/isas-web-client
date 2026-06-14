import type { InterviewResult } from '../types/result.types';

const MOCK_DELAY_MS = 600;

const mockInterviewResult: InterviewResult = {
  id: 'interview-result-001',
  candidateId: 'candidate-123',
  overallScore: 78,
  completedAt: '2026-06-13T09:45:00.000Z',
  summary:
    'The candidate demonstrated solid React fundamentals, clear communication, and good cultural fit. There is room to improve system design depth and English fluency under pressure.',
  summaryVi:
    'Ứng viên thể hiện nền tảng React tốt, giao tiếp rõ ràng và mức độ phù hợp văn hóa cao. Cần cải thiện chiều sâu về system design và khả năng tiếng Anh khi chịu áp lực.',
  radarData: [
    {
      subject: 'Technical',
      subjectVi: 'Kỹ thuật',
      A: 78,
      B: 90,
      fullMark: 100,
    },
    {
      subject: 'Communication',
      subjectVi: 'Giao tiếp',
      A: 74,
      B: 88,
      fullMark: 100,
    },
    {
      subject: 'Problem Solving',
      subjectVi: 'Giải quyết vấn đề',
      A: 72,
      B: 88,
      fullMark: 100,
    },
    {
      subject: 'English',
      subjectVi: 'Tiếng Anh',
      A: 66,
      B: 85,
      fullMark: 100,
    },
    {
      subject: 'Culture Fit',
      subjectVi: 'Phù hợp văn hóa',
      A: 84,
      B: 90,
      fullMark: 100,
    },
  ],
  gapAnalysis: [
    {
      id: 'technical-depth',
      skillName: 'Technical Depth',
      skillNameVi: 'Chiều sâu kỹ thuật',
      currentLevel: 78,
      targetLevel: 90,
      feedback:
        'You have a strong practical foundation, but interview answers would benefit from more structured explanations, trade-off analysis, and architectural reasoning.',
      feedbackVi:
        'Bạn có nền tảng thực hành tốt, nhưng câu trả lời phỏng vấn sẽ tốt hơn nếu có cấu trúc rõ ràng hơn, phân tích trade-off và lập luận kiến trúc sâu hơn.',
      actionableSteps: [
        'Practice answering “why” and “how” questions with concise structure.',
        'Review common frontend architecture patterns and be ready to justify decisions.',
        'Summarize trade-offs when comparing libraries, state management, or rendering strategies.',
      ],
      actionableStepsVi: [
        'Luyện trả lời các câu hỏi “tại sao” và “như thế nào” theo cấu trúc ngắn gọn.',
        'Ôn lại các pattern kiến trúc frontend phổ biến và chuẩn bị lý do lựa chọn.',
        'Tóm tắt trade-off khi so sánh thư viện, quản lý state hoặc chiến lược render.',
      ],
    },
    {
      id: 'english-fluency',
      skillName: 'English Fluency',
      skillNameVi: 'Độ lưu loát tiếng Anh',
      currentLevel: 66,
      targetLevel: 85,
      feedback:
        'Your ideas are clear, but there are pauses and vocabulary gaps when responding quickly. More spoken practice will help increase confidence.',
      feedbackVi:
        'Ý tưởng của bạn khá rõ, nhưng vẫn có khoảng ngập ngừng và thiếu từ vựng khi phản hồi nhanh. Luyện nói thường xuyên sẽ giúp bạn tự tin hơn.',
      actionableSteps: [
        'Practice speaking answers aloud using a 60-second timer.',
        'Build a personal glossary of common interview vocabulary.',
        'Record yourself answering mock questions and review clarity and pace.',
      ],
      actionableStepsVi: [
        'Luyện trả lời bằng cách nói to trong khung 60 giây.',
        'Xây dựng bộ từ vựng cá nhân về phỏng vấn thường gặp.',
        'Ghi âm khi trả lời câu hỏi thử và tự đánh giá độ rõ ràng, tốc độ nói.',
      ],
    },
    {
      id: 'problem-solving',
      skillName: 'Problem Solving',
      skillNameVi: 'Giải quyết vấn đề',
      currentLevel: 72,
      targetLevel: 88,
      feedback:
        'Your approach is practical, but the interview panel would benefit from a more explicit step-by-step breakdown of your reasoning.',
      feedbackVi:
        'Cách tiếp cận của bạn mang tính thực tế, nhưng hội đồng phỏng vấn sẽ đánh giá cao hơn nếu bạn trình bày rõ từng bước tư duy.',
      actionableSteps: [
        'Use a consistent framework: understand, plan, solve, validate.',
        'Explain edge cases and how you would test the solution.',
        'When stuck, verbalize assumptions and narrow down options clearly.',
      ],
      actionableStepsVi: [
        'Áp dụng một khung cố định: hiểu đề, lập kế hoạch, giải pháp, kiểm chứng.',
        'Giải thích các edge case và cách bạn kiểm thử giải pháp.',
        'Khi bị kẹt, hãy nói rõ giả định và thu hẹp lựa chọn một cách có logic.',
      ],
    },
  ],
  strengths: ['React fundamentals', 'Clear communication', 'Cultural awareness'],
  strengthsVi: ['Nền tảng React', 'Giao tiếp rõ ràng', 'Nhận thức văn hóa tốt'],
  weaknesses: ['System design depth', 'English fluency under pressure'],
  weaknessesVi: ['Chiều sâu system design', 'Tiếng Anh khi chịu áp lực'],
};

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const resultService = {
  async getInterviewResult(_resultId: string): Promise<InterviewResult> {
    await wait(MOCK_DELAY_MS);
    return mockInterviewResult;
  },
};
