import { DEFAULT_PAGE_SIZE } from '@/components/ui/app-pagination';
import type {
  InterviewHistoryItem,
  PracticeHistorySort,
  PracticeHistoryStatusFilter,
  PracticeHistoryStatusGroup,
  PracticeSessionHistoryItem,
} from '../types/history.types';
import { resolveJobDomainFromCategory } from '@/shared/domain/jobDomains';

function normalizeHistoryLevel(value?: string | null): InterviewHistoryItem['level'] {
  const normalized = value?.trim().toLowerCase();
  return ['intern', 'fresher', 'junior', 'middle', 'senior', 'lead'].includes(normalized ?? '')
    ? (normalized as InterviewHistoryItem['level'])
    : 'junior';
}

/**
 * Chuẩn hoá trạng thái thô của backend về dạng so khớp được (bỏ hoa/thường, gạch, khoảng trắng).
 * Tách ra vì cả nhóm trạng thái lẫn nhãn hiển thị đều phải so trên CÙNG một dạng — hai cách chuẩn
 * hoá khác nhau là hai luật, và chúng sẽ lệch nhau.
 */
export function normalizePracticeSessionStatus(status: string): string {
  return status.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

export function getPracticeHistoryStatusGroup(
  status: string,
): PracticeHistoryStatusGroup {
  const normalizedStatus = normalizePracticeSessionStatus(status);

  if (
    normalizedStatus === 'completed' ||
    normalizedStatus === 'scored' ||
    normalizedStatus === 'done'
  ) {
    return 'completed';
  }

  if (
    normalizedStatus === 'inprogress' ||
    normalizedStatus === 'practicing' ||
    normalizedStatus === 'started' ||
    normalizedStatus === 'created'
  ) {
    return 'inProgress';
  }

  if (
    normalizedStatus === 'submitted' ||
    normalizedStatus === 'processing' ||
    normalizedStatus === 'scoring' ||
    normalizedStatus === 'pending'
  ) {
    return 'pendingScore';
  }

  if (
    normalizedStatus === 'failed' ||
    normalizedStatus === 'cancelled' ||
    normalizedStatus === 'canceled' ||
    normalizedStatus === 'expired'
  ) {
    return 'failed';
  }

  return 'unknown';
}

/**
 * 🔴 Ca thật (23/08): bảng Lịch sử in thẳng chuỗi máy `SessionAbandoned` cho người dùng, đứng ngay
 * cạnh "Đã hoàn thành" đã dịch tử tế. Nhánh dự phòng cũ là `item.status || t('...status.unknown')`
 * — nó ƯU TIÊN in giá trị máy, nên trạng thái chưa ai dịch trông như một nhãn hợp lệ thay vì thừa
 * nhận là không biết.
 *
 * Backend có 8 trạng thái (`SessionStatus`): GeneratingQuestions · Ready · InProgress · Completed ·
 * Scoring · Scored · Failed · SessionAbandoned. Bộ gom nhóm ở trên chỉ phủ 5 trong số đó, nên
 * BA trạng thái (GeneratingQuestions · Ready · SessionAbandoned) rơi vào `unknown` — không phải
 * mỗi `SessionAbandoned` như ảnh chụp cho thấy.
 *
 * Khai bằng `Record` để thiếu nhánh là LỖI BIÊN DỊCH, thay vì ghép khoá động rồi hỏng lúc chạy.
 */
export const PRACTICE_HISTORY_STATUS_GROUP_LABEL_KEYS: Record<PracticeHistoryStatusGroup, string> = {
  completed: 'practice.history.statusGroup.completed',
  inProgress: 'practice.history.statusGroup.inProgress',
  pendingScore: 'practice.history.statusGroup.pendingScore',
  failed: 'practice.history.statusGroup.failed',
  unknown: 'practice.history.status.unknown',
};

/**
 * Trạng thái backend KHÔNG nằm trong nhóm nào ở trên nhưng vẫn phải có nhãn người đọc được.
 *
 * ⚠ Đây là danh sách ĐỒNG BỘ TAY với enum `SessionStatus` của InterviewService — hai repo nên
 * TypeScript không tự bắt được khi backend thêm trạng thái. Test `khoá đủ 8 trạng thái backend`
 * là thứ giữ nó khỏi trôi; thêm trạng thái mới ở backend thì thêm cả ở đó.
 */
export type UngroupedPracticeSessionStatus = 'generatingquestions' | 'ready' | 'sessionabandoned';

export const PRACTICE_SESSION_STATUS_LABEL_KEYS: Record<UngroupedPracticeSessionStatus, string> = {
  generatingquestions: 'practice.history.status.generatingQuestions',
  ready: 'practice.history.status.ready',
  sessionabandoned: 'practice.history.status.sessionAbandoned',
};

/** Khoá i18n cho trạng thái của MỘT buổi. Không bao giờ trả về chuỗi máy. */
export function practiceSessionStatusLabelKey(rawStatus: string): string {
  const group = getPracticeHistoryStatusGroup(rawStatus);
  if (group !== 'unknown') return PRACTICE_HISTORY_STATUS_GROUP_LABEL_KEYS[group];

  const normalized = normalizePracticeSessionStatus(rawStatus);
  return (
    PRACTICE_SESSION_STATUS_LABEL_KEYS[normalized as UngroupedPracticeSessionStatus] ??
    // Thật sự không biết thì NÓI là không biết — đừng in giá trị máy ra và để người dùng tự đoán.
    PRACTICE_HISTORY_STATUS_GROUP_LABEL_KEYS.unknown
  );
}

/**
 * Buổi do HỆ THỐNG đóng chứ không phải người dùng kết thúc.
 *
 * 🔴 Ca thật (23/08): buổi `SessionAbandoned` hiện "Thời lượng 2 giờ 7 phút" (18:18 → 20:25), đọc
 * như thể người dùng ngồi làm hai tiếng. Thật ra `completedAt` của buổi bỏ ngang là lúc **sweeper**
 * đóng buổi, nên hiệu số đo độ trễ của sweeper chứ không đo thời gian làm bài.
 *
 * Cố ý CHỈ nhận diện `SessionAbandoned` — đó là ca có bằng chứng. `Scoring`/`Scored` thì
 * `completedAt` là lúc người dùng nộp nên thời lượng vẫn đúng; siết rộng hơn sẽ xoá mất số liệu có
 * thật của các nhóm khác.
 */
export function isSystemClosedPracticeSession(rawStatus: string): boolean {
  return normalizePracticeSessionStatus(rawStatus) === 'sessionabandoned';
}

/**
 * Thời lượng làm bài, hoặc `null` khi hệ thống KHÔNG BIẾT.
 *
 * `null` chảy vào `formatDurationLabel` thành "Chưa có dữ liệu" — nói không biết vẫn tốt hơn trưng
 * ra một con số đo nhầm thứ khác. Hệ thống không lưu mốc người dùng thật sự dừng, nên không có cách
 * nào tính đúng; bịa một con số ở đây là tệ hơn hẳn.
 */
export function practiceSessionDurationMinutes(item: {
  status: string;
  createdAt: string;
  completedAt?: string | null;
}): number | null {
  if (isSystemClosedPracticeSession(item.status)) return null;
  return formatSessionDuration(item.createdAt, item.completedAt);
}

export function clampPracticeHistoryLimit(limit?: number): number {
  const value = limit ?? DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(value, 1), 500);
}

export function formatSessionDateTime(value?: string | null, locale = 'vi'): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function formatSessionDuration(
  createdAt: string,
  completedAt?: string | null,
): number | null {
  if (!completedAt) return null;
  const start = new Date(createdAt).getTime();
  const end = new Date(completedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
  return Math.round((end - start) / 60000);
}

export function formatDurationLabel(
  minutes: number | null,
  t: (key: string) => string,
): string {
  if (minutes == null) return t('practice.history.durationUnknown');
  if (minutes < 60) {
    return t('practice.history.durationMinutes').replace('{{n}}', String(minutes));
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins <= 0) {
    return t('practice.history.durationHours').replace('{{n}}', String(hours));
  }
  return t('practice.history.durationHoursMinutes')
    .replace('{{h}}', String(hours))
    .replace('{{m}}', String(mins));
}

export function formatOverallScoreLabel(
  score?: number | null,
  t?: (key: string) => string,
): string {
  if (score === null || score === undefined) {
    return t ? t('practice.history.scoreUnavailable') : '—';
  }
  return `${Number(score).toFixed(1)} / 100`;
}

export function filterAndSortPracticeHistory(
  items: PracticeSessionHistoryItem[],
  options: {
    search: string;
    status: PracticeHistoryStatusFilter;
    sort: PracticeHistorySort;
    datePrefix?: string;
  },
): PracticeSessionHistoryItem[] {
  const keyword = options.search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (keyword && !item.jobCategory.toLowerCase().includes(keyword)) return false;
    if (options.status !== 'all') {
      if (getPracticeHistoryStatusGroup(item.status) !== options.status) return false;
    }
    if (options.datePrefix && !item.createdAt.startsWith(options.datePrefix)) return false;
    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (options.sort) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'scoreDesc': {
        const aScore = a.overallScore;
        const bScore = b.overallScore;
        if (aScore == null && bScore == null) return 0;
        if (aScore == null) return 1;
        if (bScore == null) return -1;
        return bScore - aScore;
      }
      case 'scoreAsc': {
        const aScore = a.overallScore;
        const bScore = b.overallScore;
        if (aScore == null && bScore == null) return 0;
        if (aScore == null) return 1;
        if (bScore == null) return -1;
        return aScore - bScore;
      }
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  return sorted;
}

export function mapPracticeHistoryToInterviewItem(
  item: PracticeSessionHistoryItem,
): InterviewHistoryItem {
  const group = getPracticeHistoryStatusGroup(item.status);
  const uiStatus =
    group === 'completed' ? 'completed' : group === 'inProgress' ? 'in-progress' : 'pending';
  const duration = formatSessionDuration(item.createdAt, item.completedAt) ?? 0;

  return {
    id: item.id,
    jobTitle: item.jobCategory || 'Practice session',
    company: '',
    date: item.createdAt,
    status: uiStatus,
    overallScore: item.overallScore ?? 0,
    duration,
    domainId: resolveJobDomainFromCategory(item.jobCategory)?.id ?? '',
    level: normalizeHistoryLevel(item.seniority),
    deletedAt: null,
    jobCategory: item.jobCategory,
    createdAt: item.createdAt,
    completedAt: item.completedAt ?? null,
    rawStatus: item.status,
    overallScoreNullable: item.overallScore ?? null,
    lessonTitle: item.lessonTitle ?? null,
  };
}

export function computePracticeHistoryPageStats(items: PracticeSessionHistoryItem[]) {
  const completed = items.filter(
    (item) => getPracticeHistoryStatusGroup(item.status) === 'completed',
  ).length;
  const inProgress = items.filter(
    (item) => getPracticeHistoryStatusGroup(item.status) === 'inProgress',
  ).length;
  const scored = items.filter((item) => item.overallScore != null);
  const avgScore =
    scored.length > 0
      ? scored.reduce((sum, item) => sum + (item.overallScore ?? 0), 0) / scored.length
      : null;
  return {
    pageCount: items.length,
    completed,
    inProgress,
    avgScore,
  };
}

