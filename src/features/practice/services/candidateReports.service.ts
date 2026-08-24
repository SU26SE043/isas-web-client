import { fetchInterviewHistory } from './history.service';
import { practiceReportTitle, practiceSessionSource } from '../utils/practiceReportLabel';
import type { InterviewHistoryItem } from '../types/history.types';
import type {
  CandidateReportListItem,
  CandidateReportsHub,
} from '../types/candidateReports.types';

const HISTORY_PAGE_SIZE = 50;

/**
 * Hub báo cáo của ứng viên (`/candidate/reports`).
 *
 * 🔴 Ca thật (23/08): mục "Luyện tập theo lộ trình" luôn hiện **0** dù tài khoản đã học xong bài.
 * Hai lỗi chồng nhau:
 *   1. nguồn cũ `learningPathService.listAllPracticeReports()` **ném thẳng** ở chế độ live
 *      ("Learning path API is not wired yet") — nó chưa bao giờ được nối API;
 *   2. lời gọi bọc trong `Promise.allSettled` nên lỗi đó bị **nuốt**, và "chưa xây" được trình bày
 *      cho người dùng thành "bạn không có gì".
 *
 * Nay cả hai mục lấy từ **một nguồn duy nhất** là lịch sử buổi luyện, chia theo
 * `practiceSessionSource`. Không cần API mới: `PracticeSessionSummary.lessonTitle` đã có sẵn trên
 * đường `parsePracticeSessionHistoryPage` → `mapPracticeHistoryToInterviewItem`.
 *
 * Hai mục **loại trừ nhau do cấu trúc** (một `if/else`, không phải hai bộ lọc chạy song song):
 * trước đây "Luyện phỏng vấn" lấy MỌI buổi `completed` nên nó gộp cả buổi sinh từ bài học, và một
 * buổi có thể bị đếm ở cả hai chỗ.
 *
 * Hàm này **cố ý KHÔNG bắt lỗi**: tải hỏng phải nổi lên tới UI. Trả mảng rỗng khi hỏng chính là
 * cách bug trên sống sót — người dùng không phân biệt được "chưa có buổi nào" với "không tải được".
 */
export async function fetchCandidateReportsHub(): Promise<CandidateReportsHub> {
  const history = await fetchInterviewHistory({ pageSize: HISTORY_PAGE_SIZE });

  const interview: CandidateReportListItem[] = [];
  const learning: CandidateReportListItem[] = [];

  for (const item of history.interviews) {
    if (item.status !== 'completed') continue;
    // if/else, KHÔNG phải hai `filter` riêng: một buổi rơi vào ĐÚNG một mục.
    if (practiceSessionSource(item) === 'lesson') {
      learning.push(toReportItem(item, 'learning'));
    } else {
      interview.push(toReportItem(item, 'interview'));
    }
  }

  return { interview, learning, cv: [] };
}

function toReportItem(
  item: InterviewHistoryItem,
  category: 'interview' | 'learning',
): CandidateReportListItem {
  // Nhãn lấy từ `practiceReportTitle` — cùng hàm đã quyết định buổi này thuộc mục nào, nên tiêu đề
  // và cách phân loại không thể lệch nhau.
  const label = practiceReportTitle(item);
  const subtitle = category === 'learning' ? (item.jobCategory ?? '') : item.company;

  return {
    id: item.id,
    category,
    // Lịch sử buổi luyện chỉ có MỘT chuỗi tiêu đề (không có bản vi/en riêng) — gán cùng giá trị cho
    // cả hai thay vì dịch bừa.
    title: label.text,
    titleVi: label.text,
    subtitle: subtitle || undefined,
    subtitleVi: subtitle || undefined,
    // Buổi sinh từ bài học vẫn là một buổi luyện, và lịch sử KHÔNG trả `roadmapId`/`lessonId` nên
    // không dựng được link tới trang báo cáo bài học. Trỏ về kết quả của chính buổi đó — đúng thứ
    // người dùng muốn xem, và là link duy nhất dữ liệu hiện có cho phép dựng thật.
    href: `/candidate/practice/history/${item.id}`,
    createdAt: item.createdAt || item.date,
    score: item.overallScoreNullable ?? item.overallScore,
  };
}
