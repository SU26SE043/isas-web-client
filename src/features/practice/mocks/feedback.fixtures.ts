import type { QuestionFeedback } from '../types/result.types';

export const MOCK_QUESTION_FEEDBACK: QuestionFeedback[] = [
  {
    id: 'q1',
    questionIndex: 1,
    question: 'Tell me about your experience with React and component architecture.',
    questionVi: 'Hãy chia sẻ kinh nghiệm của bạn với React và kiến trúc component.',
    score: 8,
    maxScore: 10,
    summary:
      'You explained hooks and state management clearly, with practical examples from recent projects.',
    summaryVi:
      'Bạn trình bày rõ về hooks và quản lý state, kèm ví dụ thực tế từ dự án gần đây.',
    strengths: ['Concrete project examples', 'Mentioned performance trade-offs'],
    strengthsVi: ['Ví dụ dự án cụ thể', 'Nêu trade-off hiệu năng'],
    improvements: ['Add more structure: context, problem, solution, outcome'],
    improvementsVi: ['Thêm cấu trúc: bối cảnh, vấn đề, giải pháp, kết quả'],
    locked: false,
  },
  {
    id: 'q2',
    questionIndex: 2,
    question: 'How would you design a scalable frontend for a high-traffic dashboard?',
    questionVi: 'Bạn sẽ thiết kế frontend mở rộng cho dashboard traffic cao như thế nào?',
    score: 6,
    maxScore: 10,
    summary:
      'Good instinct on caching and code splitting, but system design reasoning lacked depth on data flow and failure modes.',
    summaryVi:
      'Ý thức tốt về caching và code splitting, nhưng lập luận system design còn thiếu chiều sâu về luồng dữ liệu và failure mode.',
    strengths: ['Mentioned lazy loading', 'Aware of bundle size impact'],
    strengthsVi: ['Đề cập lazy loading', 'Nhận thức tác động bundle size'],
    improvements: [
      'Discuss API layer boundaries and observability',
      'Compare SSR vs CSR trade-offs explicitly',
    ],
    improvementsVi: [
      'Thảo luận ranh giới API layer và observability',
      'So sánh trade-off SSR vs CSR một cách rõ ràng',
    ],
    locked: false,
  },
  {
    id: 'q3',
    questionIndex: 3,
    question: 'Describe a challenging bug you fixed and how you approached debugging.',
    questionVi: 'Mô tả một bug khó bạn đã sửa và cách bạn debug.',
    score: 7,
    maxScore: 10,
    summary:
      'Structured debugging narrative with reproduction steps. Could strengthen root-cause prevention discussion.',
    summaryVi:
      'Kể debug có cấu trúc với bước tái hiện. Cần mạnh hơn phần phòng ngừa nguyên nhân gốc.',
    strengths: ['Clear reproduction path', 'Used logging effectively'],
    strengthsVi: ['Lộ trình tái hiện rõ', 'Dùng logging hiệu quả'],
    improvements: ['Mention regression tests or monitoring added after fix'],
    improvementsVi: ['Nêu test hồi quy hoặc monitoring sau khi sửa'],
    locked: false,
  },
];
