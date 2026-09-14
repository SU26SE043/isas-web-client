import type { CampaignQuestion, EmployerCampaignStatus, RubricCriterion } from './campaignManagement.types';

/**
 * SC2 · T9 — ngữ cảnh chấm thử THEO CÂU mà bước 4 (wizard) hoặc trang chi tiết (T10) truyền xuống từng
 * card câu hỏi. Card KHÔNG tự đi lấy gì từ wizard/router: mọi thứ nó cần nằm ở đây, nên T10 tái dùng card
 * bằng cách dựng một object này từ dữ liệu trang chi tiết (không `beforeRun`, `readOnly: true`).
 */
export interface QuestionPreviewContext {
  campaignId: string | null;
  campaignStatus: EmployerCampaignStatus | null;
  /** Thước đo HIỆN TẠI (bước 3) — nguồn cho picker nhãn + blocker thiếu mốc + lọc tiêu chí hiển thị. */
  rubric: RubricCriterion[];
  /** Toàn bộ câu hỏi (blocker `noQuestions`). */
  questions: CampaignQuestion[];
  passScorePct: number | null;
  /** `EmployerCampaign.rubricVersion` — quota lượt cũ còn tin được không. `null` = không biết. */
  currentRubricVersion: number | null;
  /**
   * Wizard: lưu thước đo + câu hỏi lên server TRƯỚC khi POST (nhãn "Lưu & chấm thử"). Trang chi tiết:
   * vắng (dữ liệu đã ở server) ⇒ nhãn "Chấm thử".
   */
  beforeRun?: () => Promise<string | null>;
  /**
   * Sau `beforeRun`, id câu đúc cục bộ (`client-…`) đã được server cấp id thật. Hook chấm thử giữ id lúc
   * bấm nút (closure) nên phải hỏi lại: trả id server nếu biết, không thì trả nguyên id đưa vào.
   */
  resolveQuestionId?: (localId: string) => string;
  /** Đưa HR về bước 3 (thiếu mốc / chưa có tiêu chí WhenTargeted). */
  onGoToCriteria?: () => void;
  /**
   * id câu ĐANG có lượt chấm thử bay — state do màn cha sở hữu (Step/trang chi tiết) vì POST chạy 20–60s
   * trong MỘT card; các card khác không thấy `isPending` của mutation đó, chỉ thấy qua đây.
   */
  runningQuestionId: string | null;
  onRunningChange: (questionId: string | null) => void;
  /** T10: trang chi tiết Active — không sửa nhãn/câu mẫu, vẫn chấm thử được. */
  readOnly?: boolean;
}

/** Cảnh báo bao phủ (SC2): tiêu chí `WhenTargeted` không câu nào nhắm tới — tính cục bộ hoặc server trả. */
export interface QuestionCoverageWarning {
  criterionId: string;
  name: string;
}
