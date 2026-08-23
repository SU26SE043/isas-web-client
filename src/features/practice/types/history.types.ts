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
   * ✅ Backend ĐÃ hỗ trợ (đo trực tiếp trên deploy dev 23/08, không suy đoán): không param ⇒ 3 buổi ·
   * `?source=lesson` ⇒ 2 · `?source=free` ⇒ 1 · `?source=xyz` ⇒ **400**. Backend lọc trong SQL
   * TRƯỚC khi cắt trang, và dùng chung nguồn dữ liệu với `lessonTitle`, nên nhãn trên hàng và bộ lọc
   * không thể nói ngược nhau. Vì vậy TUYỆT ĐỐI không lọc lại phía client: lọc sau phân trang làm
   * buổi hợp lệ nằm ngoài trang đầu biến mất.
   *
   * ⚠ **Phân biệt HOA/thường**: `?source=LESSON` trả **400**, không phải 200. Kiểu
   * `PracticeSessionSource` vốn là union chữ thường nên đường đi qua TypeScript an toàn — nhưng
   * đừng `toUpperCase()` hay nhận chuỗi thô từ URL rồi đẩy thẳng xuống.
   *
   * ⚠ Ngữ nghĩa `free` của backend là *"không sinh từ bài học"*, RỘNG HƠN nhãn "Luyện tự do":
   * nó gồm cả buổi phỏng vấn B2B khi trang không truyền `excludeCampaign` (trang Lịch sử hiện
   * không truyền). Hôm nay vô hại — đo trên dev 24/24 buổi đều B2C — và `PracticeSessionHistoryItem`
   * KHÔNG có trường nào cho biết buổi thuộc campaign, nên FE cũng chưa phân biệt được. Xem
   * `practiceSessionSource` để biết vì sao không vá bằng cách đổi riêng nhãn ô lọc.
   */
  source?: PracticeSessionSource;
};

/**
 * Trạng thái ô lọc nguồn buổi luyện. `all` = KHÔNG gửi `source` (backend trả tất cả) — cố ý không
 * dùng chuỗi rỗng, vì `?source=` tuy được backend chấp nhận (đo: 200, đủ 3 buổi) nhưng gửi một
 * tham số rỗng để nói "không lọc" là dựa vào hành vi khoan dung của server thay vì nói thẳng.
 */
export type PracticeHistorySourceFilter = 'all' | PracticeSessionSource;

export type PracticeHistoryStatusGroup =
  | 'completed'
  | 'inProgress'
  | 'pendingScore'
  | 'failed'
  | 'unknown';

export type PracticeHistoryStatusFilter = 'all' | PracticeHistoryStatusGroup;
export type PracticeHistorySort = 'newest' | 'oldest' | 'scoreDesc' | 'scoreAsc';
