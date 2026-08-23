import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchCandidateReportsHub } from './candidateReports.service';
import { fetchInterviewHistory } from './history.service';
import type { InterviewHistoryItem } from '../types/history.types';

vi.mock('./history.service', () => ({
  fetchInterviewHistory: vi.fn(),
}));

function session(overrides: Partial<InterviewHistoryItem> = {}): InterviewHistoryItem {
  return {
    id: 'session-1',
    jobTitle: 'BE',
    company: '',
    date: '2026-08-20T07:00:00Z',
    status: 'completed',
    overallScore: 70,
    duration: 12,
    domainId: 'be',
    level: 'junior',
    jobCategory: 'BE',
    createdAt: '2026-08-20T07:00:00Z',
    completedAt: '2026-08-20T07:20:00Z',
    rawStatus: 'Scored',
    overallScoreNullable: 70,
    lessonTitle: null,
    ...overrides,
  };
}

function mockHistory(items: InterviewHistoryItem[]) {
  vi.mocked(fetchInterviewHistory).mockResolvedValue({
    interviews: items,
    total: items.length,
    page: 1,
    pageSize: 50,
  });
}

/**
 * 🔴 Ca thật đo trên tài khoản demo (23/08): 3 buổi B2C — 1 tự do đã chấm, 1 bài học đã chấm,
 * 1 bài học bỏ ngang. Trang Báo cáo hiện "Luyện phỏng vấn (2)" và "Luyện tập theo lộ trình (0)".
 * Cả hai con số đều sai: mục lộ trình chưa bao giờ được nối API (nguồn cũ NÉM ở chế độ live và lỗi
 * bị `Promise.allSettled` nuốt), còn mục phỏng vấn thì gộp cả buổi sinh từ bài học.
 *
 * Repo trước đó KHÔNG có test nào cho hub này — đó là lý do bug sống được.
 */
describe('fetchCandidateReportsHub', () => {
  beforeEach(() => vi.clearAllMocks());

  it('buổi sinh từ bài học vào mục lộ trình, buổi tự do vào mục phỏng vấn', async () => {
    mockHistory([
      session({ id: 'free-1', lessonTitle: null }),
      session({ id: 'lesson-1', lessonTitle: 'Hiểu rõ HTTP Methods' }),
    ]);

    const hub = await fetchCandidateReportsHub();

    expect(hub.interview.map((item) => item.id)).toEqual(['free-1']);
    expect(hub.learning.map((item) => item.id)).toEqual(['lesson-1']);
  });

  // Đây là vế mà bảng cũ vi phạm: nó lấy MỌI buổi `completed` cho mục "Luyện phỏng vấn".
  it('hai mục LOẠI TRỪ nhau — không buổi nào đếm ở cả hai chỗ', async () => {
    mockHistory([
      session({ id: 'a', lessonTitle: 'Bài 1' }),
      session({ id: 'b', lessonTitle: null }),
      session({ id: 'c', lessonTitle: 'Bài 2' }),
    ]);

    const hub = await fetchCandidateReportsHub();

    const interviewIds = hub.interview.map((item) => item.id);
    const learningIds = hub.learning.map((item) => item.id);
    expect(interviewIds.filter((id) => learningIds.includes(id))).toEqual([]);
    // và không buổi nào rơi khỏi cả hai mục
    expect([...interviewIds, ...learningIds].sort()).toEqual(['a', 'b', 'c']);
  });

  it('mục lộ trình đếm ĐÚNG số buổi bài học đã chấm — không phải 0', async () => {
    mockHistory([
      session({ id: 'lesson-1', lessonTitle: 'Ôn tập OOP' }),
      session({ id: 'free-1', lessonTitle: null }),
    ]);

    const hub = await fetchCandidateReportsHub();

    expect(hub.learning).toHaveLength(1);
  });

  it('buổi chưa chấm xong không vào mục nào', async () => {
    mockHistory([
      session({ id: 'abandoned', status: 'pending', lessonTitle: 'Ôn tập OOP' }),
      session({ id: 'running', status: 'in-progress', lessonTitle: null }),
    ]);

    const hub = await fetchCandidateReportsHub();

    expect(hub.interview).toEqual([]);
    expect(hub.learning).toEqual([]);
  });

  it('mục lộ trình lấy TÊN BÀI làm tiêu đề, không phải tên ngành', async () => {
    mockHistory([session({ id: 'lesson-1', lessonTitle: 'Ôn tập OOP', jobCategory: 'BE' })]);

    const hub = await fetchCandidateReportsHub();

    expect(hub.learning[0].title).toBe('Ôn tập OOP');
    expect(hub.learning[0].titleVi).toBe('Ôn tập OOP');
  });

  it('mỗi báo cáo trỏ về kết quả của chính buổi đó', async () => {
    mockHistory([session({ id: 'abc', lessonTitle: 'Ôn tập OOP' })]);

    const hub = await fetchCandidateReportsHub();

    expect(hub.learning[0].href).toBe('/candidate/practice/history/abc');
  });

  /**
   * Vế quan trọng nhất: tải hỏng KHÔNG được biến thành "không có báo cáo nào". Chính việc nuốt lỗi
   * (allSettled + fallback mảng rỗng) đã giấu "tính năng chưa nối API" suốt thời gian qua.
   */
  it('tải hỏng thì NÉM ra ngoài, không trả hub rỗng', async () => {
    vi.mocked(fetchInterviewHistory).mockRejectedValue(new Error('network down'));

    await expect(fetchCandidateReportsHub()).rejects.toThrow('network down');
  });
});
