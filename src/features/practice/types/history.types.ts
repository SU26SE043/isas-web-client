import type { PracticeSessionSource } from '../utils/practiceReportLabel';

export type InterviewHistoryLevel =
  | 'intern'
  | 'fresher'
  | 'junior'
  | 'middle'
  | 'senior'
  | 'lead';

export interface InterviewHistoryItem {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
  overallScore: number;
  duration: number;
  /** Practice setup domain id — used to filter roadmap report selection */
  domainId: string;
  level: InterviewHistoryLevel;
  deletedAt?: string | null;
  /** Live practice history fields (optional for mock/legacy rows). */
  jobCategory?: string | null;
  createdAt?: string | null;
  completedAt?: string | null;
  rawStatus?: string | null;
  overallScoreNullable?: number | null;
  /**
   * Tên BÀI HỌC của lộ trình mà buổi luyện này thuộc về; `null`/vắng = buổi luyện TỰ DO.
   * Nguồn là dữ liệu THẬT (`roadmap_lesson_attempts` → `roadmap_lessons.title`), không phải tên
   * máy sinh. `null` KHÔNG hiếm — đo trên dev 3/18 buổi đã chấm là luyện tự do.
   */
  lessonTitle?: string | null;
}

export interface InterviewHistoryQuery {
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
  cursor?: string;
  status?: string;
  excludeCampaign?: boolean;
}

export interface InterviewHistoryResponse {
  interviews: InterviewHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  nextCursor?: string | null;
}

/** Live: GET /api/v1/interview/practice/sessions/history */
export type PracticeSessionHistoryItem = {
  id: string;
  status: string;
  jobCategory: string;
  createdAt: string;
  completedAt?: string | null;
  overallScore?: number | null;
  seniority?: string | null;
  /** `PracticeSessionSummary.lessonTitle` — `null` = buổi luyện tự do, KHÔNG phải lỗi. */
  lessonTitle?: string | null;
};

export type PracticeSessionHistoryPage = {
  items: PracticeSessionHistoryItem[];
  nextCursor: string | null;
};

export type GetPracticeSessionHistoryParams = {
  cursor?: string;
  limit?: number;
  status?: string;
  excludeCampaign?: boolean;
  /**
   * Lọc theo NGUỒN buổi luyện — `lesson` = sinh từ bài học trong lộ trình, `free` = luyện tự do.
   * OPT-IN: vắng ⇒ trả tất cả, y hệt hôm nay.
   *
   * ⚠ Tính đến 23/08 **backend CHƯA hỗ trợ** tham số này (`GET /practice/history` mới nhận
   * `cursor`/`limit`/`status`/`excludeCampaign`). ASP.NET bỏ qua query param lạ, nên gửi lên sẽ
   * nhận **200 kèm danh sách ĐẦY ĐỦ** chứ không báo lỗi. Vì vậy CHƯA có ô lọc nào trên giao diện:
   * một ô lọc không lọc gì mà vẫn hiện "đang lọc" còn tệ hơn không có ô lọc. Kiểm tra backend đã
   * nhận `source` chưa RỒI mới nối UI.
   *
   * ⚠ Khi nối UI, nhớ thêm `source` vào **cả `queryKey`** của `usePracticeSessionHistory` — hook
   * đó đang dựng key từ danh sách field liệt kê tay, thiếu field mới thì hai bộ lọc khác nhau dùng
   * chung một ô cache.
   */
  source?: PracticeSessionSource;
};

export type PracticeHistoryStatusGroup =
  | 'completed'
  | 'inProgress'
  | 'pendingScore'
  | 'failed'
  | 'unknown';

export type PracticeHistoryStatusFilter = 'all' | PracticeHistoryStatusGroup;
export type PracticeHistorySort = 'newest' | 'oldest' | 'scoreDesc' | 'scoreAsc';
