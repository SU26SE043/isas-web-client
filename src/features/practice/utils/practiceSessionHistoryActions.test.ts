import { describe, expect, it } from 'vitest';
import {
  PRACTICE_HISTORY_STATUS_GROUP_LABEL_KEYS,
  PRACTICE_SESSION_STATUS_LABEL_KEYS,
  clampPracticeHistoryLimit,
  filterAndSortPracticeHistory,
  formatOverallScoreLabel,
  getPracticeHistoryStatusGroup,
  isSystemClosedPracticeSession,
  mapPracticeHistoryToInterviewItem,
  practiceSessionDurationMinutes,
  practiceSessionStatusLabelKey,
} from './practiceSessionHistoryActions';
import {
  parsePracticeSessionHistoryPage,
  readPracticeHistoryNextCursor,
} from './practiceSessionHistoryApi';

describe('practiceSessionHistoryApi', () => {
  it('reads X-Next-Cursor from lowercase headers', () => {
    expect(readPracticeHistoryNextCursor({ 'x-next-cursor': 'abc' })).toBe('abc');
  });

  it('parses history page items and cursor', () => {
    const page = parsePracticeSessionHistoryPage(
      [
        {
          id: 's1',
          status: 'Completed',
          jobCategory: 'Frontend Development',
          createdAt: '2026-07-25T10:00:00Z',
          completedAt: '2026-07-25T10:25:00Z',
          overallScore: 82.5,
          Seniority: 'Senior',
        },
      ],
      { 'x-next-cursor': 'next-1' },
    );

    expect(page.nextCursor).toBe('next-1');
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.overallScore).toBe(82.5);
    expect(page.items[0]?.seniority).toBe('Senior');
  });
});

describe('practiceSessionHistoryActions', () => {
  it('maps the live category and seniority into roadmap filter fields', () => {
    const mapped = mapPracticeHistoryToInterviewItem({
      id: 's1', status: 'Scored', jobCategory: 'BE', seniority: 'Senior',
      createdAt: '2026-07-25T10:00:00Z', completedAt: '2026-07-25T10:25:00Z', overallScore: 82,
    });
    expect(mapped.domainId).toBe('backend');
    expect(mapped.level).toBe('senior');
  });

  it('maps known statuses and falls back for unknown', () => {
    expect(getPracticeHistoryStatusGroup('Scored')).toBe('completed');
    expect(getPracticeHistoryStatusGroup('InProgress')).toBe('inProgress');
    expect(getPracticeHistoryStatusGroup('Scoring')).toBe('pendingScore');
    expect(getPracticeHistoryStatusGroup('Cancelled')).toBe('failed');
    expect(getPracticeHistoryStatusGroup('WeirdNewState')).toBe('unknown');
  });

  it('clamps limit between 1 and 500', () => {
    expect(clampPracticeHistoryLimit(undefined)).toBe(5);
    expect(clampPracticeHistoryLimit(0)).toBe(1);
    expect(clampPracticeHistoryLimit(999)).toBe(500);
  });

  it('does not render null score as zero', () => {
    expect(formatOverallScoreLabel(null, (key) => key)).toBe(
      'practice.history.scoreUnavailable',
    );
    expect(formatOverallScoreLabel(82.5)).toBe('82.5 / 100');
  });

  it('filters and sorts on the current page only', () => {
    const items = [
      {
        id: '1',
        status: 'Completed',
        jobCategory: 'Frontend Development',
        createdAt: '2026-07-25T10:00:00Z',
        completedAt: '2026-07-25T10:25:00Z',
        overallScore: 70,
      },
      {
        id: '2',
        status: 'Practicing',
        jobCategory: 'Backend Development',
        createdAt: '2026-07-26T10:00:00Z',
        completedAt: null,
        overallScore: null,
      },
    ];

    const filtered = filterAndSortPracticeHistory(items, {
      search: 'front',
      status: 'completed',
      sort: 'scoreDesc',
    });

    expect(filtered.map((item) => item.id)).toEqual(['1']);
  });
});

/**
 * F3 — `lessonTitle` phải đi HẾT dây: JSON của server → `parsePracticeSessionHistoryItem` →
 * `mapPracticeHistoryToInterviewItem` → bảng chọn báo cáo. Đứt bất kỳ mắt nào thì cột "Tiêu đề"
 * lại về đúng một chữ "BE" cho mọi dòng, mà không có lỗi nào nổ.
 */
describe('nhãn tên bài học đi hết dây', () => {
  it('parser đọc lessonTitle ở cả camelCase lẫn PascalCase', () => {
    const camel = parsePracticeSessionHistoryPage(
      [{ id: 's1', status: 'Scored', jobCategory: 'BE', createdAt: '2026-08-20T07:00:00Z', lessonTitle: 'Truy vấn SQL nâng cao' }],
      {},
    );
    expect(camel.items[0]?.lessonTitle).toBe('Truy vấn SQL nâng cao');

    const pascal = parsePracticeSessionHistoryPage(
      [{ id: 's1', status: 'Scored', jobCategory: 'BE', createdAt: '2026-08-20T07:00:00Z', LessonTitle: 'Thiết kế API' }],
      {},
    );
    expect(pascal.items[0]?.lessonTitle).toBe('Thiết kế API');
  });

  // `null` = buổi luyện TỰ DO, là ca thật (3/18 trên dev) chứ không phải lỗi.
  it('buổi luyện tự do ⇒ lessonTitle null, không phải chuỗi rỗng đội lốt', () => {
    const page = parsePracticeSessionHistoryPage(
      [{ id: 's1', status: 'Scored', jobCategory: 'BE', createdAt: '2026-08-20T07:00:00Z', lessonTitle: null }],
      {},
    );
    expect(page.items[0]?.lessonTitle).toBeNull();
  });

  it('mapper chuyển tiếp lessonTitle sang shape mà bảng đọc', () => {
    expect(
      mapPracticeHistoryToInterviewItem({
        id: 's1',
        status: 'Scored',
        jobCategory: 'BE',
        createdAt: '2026-08-20T07:00:00Z',
        lessonTitle: 'Truy vấn SQL nâng cao',
      }).lessonTitle,
    ).toBe('Truy vấn SQL nâng cao');

    expect(
      mapPracticeHistoryToInterviewItem({
        id: 's2',
        status: 'Scored',
        jobCategory: 'BE',
        createdAt: '2026-08-20T07:00:00Z',
      }).lessonTitle,
    ).toBeNull();
  });
});

/**
 * Tập trạng thái của enum `SessionStatus` (InterviewService). ĐỒNG BỘ TAY — hai repo nên TypeScript
 * không bắt được khi backend thêm giá trị; test dưới là thứ duy nhất giữ danh sách khỏi trôi.
 */
const BACKEND_SESSION_STATUSES = [
  'GeneratingQuestions',
  'Ready',
  'InProgress',
  'Completed',
  'Scoring',
  'Scored',
  'Failed',
  'SessionAbandoned',
] as const;

/**
 * 🔴 Ca thật (23/08): bảng Lịch sử in thẳng chuỗi máy `SessionAbandoned` cho người dùng, ngay cạnh
 * "Đã hoàn thành" đã dịch tử tế. Nhánh cũ `item.status || t('...unknown')` ưu tiên GIÁ TRỊ MÁY nên
 * trạng thái chưa dịch trông như nhãn hợp lệ.
 */
describe('practiceSessionStatusLabelKey', () => {
  it('KHÔNG BAO GIỜ trả về chính chuỗi trạng thái thô', () => {
    for (const status of [...BACKEND_SESSION_STATUSES, 'ToBeDetermined', 'xyz']) {
      expect(practiceSessionStatusLabelKey(status)).not.toBe(status);
      expect(practiceSessionStatusLabelKey(status)).toMatch(/^practice\.history\./);
    }
  });

  it('cả 8 trạng thái backend đều có nhãn RIÊNG, không cái nào rơi về "không xác định"', () => {
    const unknownKey = PRACTICE_HISTORY_STATUS_GROUP_LABEL_KEYS.unknown;
    for (const status of BACKEND_SESSION_STATUSES) {
      expect(practiceSessionStatusLabelKey(status), `thiếu nhãn: ${status}`).not.toBe(unknownKey);
    }
  });

  it('ba trạng thái không thuộc nhóm nào vẫn có nhãn riêng (không chỉ mỗi SessionAbandoned)', () => {
    expect(practiceSessionStatusLabelKey('SessionAbandoned')).toBe(
      PRACTICE_SESSION_STATUS_LABEL_KEYS.sessionabandoned,
    );
    expect(practiceSessionStatusLabelKey('GeneratingQuestions')).toBe(
      PRACTICE_SESSION_STATUS_LABEL_KEYS.generatingquestions,
    );
    expect(practiceSessionStatusLabelKey('Ready')).toBe(PRACTICE_SESSION_STATUS_LABEL_KEYS.ready);
  });

  it('trạng thái thật sự lạ ⇒ thừa nhận không biết, KHÔNG in giá trị máy', () => {
    expect(practiceSessionStatusLabelKey('SomethingBrandNew')).toBe(
      PRACTICE_HISTORY_STATUS_GROUP_LABEL_KEYS.unknown,
    );
  });

  it('trạng thái đã có nhóm vẫn dùng nhãn của nhóm', () => {
    expect(practiceSessionStatusLabelKey('Scored')).toBe(
      PRACTICE_HISTORY_STATUS_GROUP_LABEL_KEYS.completed,
    );
  });
});

/**
 * 🔴 Ca thật (23/08): buổi `SessionAbandoned` hiện "2 giờ 7 phút" (18:18 → 20:25) — đó là độ trễ
 * của sweeper, không phải thời gian làm bài. Hệ thống KHÔNG lưu mốc người dùng thật sự dừng, nên
 * nói không biết vẫn đúng hơn là trưng ra một con số đo nhầm thứ khác.
 */
describe('practiceSessionDurationMinutes', () => {
  it('buổi bỏ ngang ⇒ null (dựng "chưa có dữ liệu"), KHÔNG phải khoảng cách tới lúc sweeper đóng', () => {
    expect(
      practiceSessionDurationMinutes({
        status: 'SessionAbandoned',
        createdAt: '2026-08-20T18:18:00Z',
        completedAt: '2026-08-20T20:25:00Z',
      }),
    ).toBeNull();
  });

  it('buổi người dùng tự kết thúc vẫn giữ thời lượng thật', () => {
    expect(
      practiceSessionDurationMinutes({
        status: 'Scored',
        createdAt: '2026-08-20T18:00:00Z',
        completedAt: '2026-08-20T18:20:00Z',
      }),
    ).toBe(20);
  });

  it('chỉ SessionAbandoned bị coi là hệ thống đóng — không siết rộng sang nhóm khác', () => {
    expect(isSystemClosedPracticeSession('SessionAbandoned')).toBe(true);
    for (const status of ['Scored', 'Completed', 'Scoring', 'Failed', 'InProgress', 'Ready']) {
      expect(isSystemClosedPracticeSession(status), status).toBe(false);
    }
  });
});
