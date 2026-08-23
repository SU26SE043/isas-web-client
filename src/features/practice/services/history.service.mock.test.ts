import { describe, expect, it, vi } from 'vitest';
import { getPracticeSessionHistory } from './history.service';

vi.mock('@/shared/mock', () => ({
  mockDelay: vi.fn(),
  usesMockData: () => true,
}));

vi.mock('../mocks/history.fixtures', () => ({
  MOCK_INTERVIEW_HISTORY: [
    {
      id: 'lesson-session',
      jobTitle: 'BE',
      company: '',
      date: '2026-08-20T07:00:00Z',
      status: 'completed',
      overallScore: 70,
      duration: 12,
      domainId: 'be',
      level: 'junior',
      jobCategory: 'BE',
      lessonTitle: 'Ôn tập OOP',
    },
    {
      id: 'free-session',
      jobTitle: 'BE',
      company: '',
      date: '2026-08-20T09:00:00Z',
      status: 'completed',
      overallScore: 60,
      duration: 10,
      domainId: 'be',
      level: 'junior',
      jobCategory: 'BE',
    },
  ],
}));

/**
 * Nhánh mock (chạy dưới Playwright) ĐÁNH RƠI `lessonTitle` khi map sang
 * `PracticeSessionHistoryItem`, nên nhãn nguồn buổi không bao giờ hiện được ở đó. Hôm nay chưa
 * fixture nào khai field này nên chưa ai thấy — đúng kiểu rơi im lặng chờ sẵn.
 */
describe('getPracticeSessionHistory — nhánh mock giữ được tên bài học', () => {
  it('không đánh rơi `lessonTitle` khi map từ fixture', async () => {
    const page = await getPracticeSessionHistory({ limit: 10 });

    expect(page.items.find((item) => item.id === 'lesson-session')?.lessonTitle).toBe('Ôn tập OOP');
  });

  it('buổi không có tên bài vẫn là `null`, không phải chuỗi bịa', async () => {
    const page = await getPracticeSessionHistory({ limit: 10 });

    expect(page.items.find((item) => item.id === 'free-session')?.lessonTitle).toBeNull();
  });
});
