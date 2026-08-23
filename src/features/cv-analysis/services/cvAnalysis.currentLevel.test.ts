import { describe, expect, it } from 'vitest';
import { parseAnalysis } from './cvAnalysis.service';

/**
 * F2 — `currentLevel` là trình độ nghề nghiệp suy từ CV. Backend trả nó ở CẢ danh sách lẫn chi
 * tiết (`CvAnalysisListResponse` / `CvAnalysisResponse`), type FE cũng đã khai — nhưng
 * `parseAnalysis` KHÔNG map, nên giá trị luôn `undefined` và bước "Trình độ hiện tại" của wizard
 * lộ trình luôn rơi về Fresher. Cả một tính năng không bao giờ chạy, không lỗi nào nổ.
 *
 * Chỉ có MỘT parser cho cả ba đường (analyze / list / detail), nên một phép map là đủ — điểm này
 * khác giả định ban đầu rằng FE có hai parser cần sửa song song.
 */
const base = {
  id: 'analysis-1',
  cvId: 'cv-1',
  jobCategory: 'BE',
  summary: '',
  strengths: [],
  weaknesses: [],
  suggestions: [],
  createdAt: '2026-08-18T00:00:00Z',
};

describe('parseAnalysis — trình độ hiện tại suy từ CV', () => {
  it('đọc currentLevel server trả về thay vì bỏ qua', () => {
    expect(parseAnalysis({ ...base, currentLevel: 'Middle' }).currentLevel).toBe('Middle');
  });

  // Tập đóng của backend là Fresher/Junior/Middle/Senior — parser giữ NGUYÊN VĂN, không tự nắn
  // hoa/thường: nắn ở tầng vận chuyển là che mất việc server đổi hợp đồng.
  it('giữ nguyên văn giá trị, không tự chuẩn hoá hoa thường', () => {
    expect(parseAnalysis({ ...base, currentLevel: 'Senior' }).currentLevel).toBe('Senior');
    expect(parseAnalysis({ ...base, currentLevel: 'junior' }).currentLevel).toBe('junior');
  });

  // `null` là giá trị HỢP LỆ: CV không đủ căn cứ thì server cố ý trả null (đo trên prod ~2/5 bản
  // phân tích). Nó phải khác được với "server có gửi một giá trị".
  it('null của server đi qua thành null, không thành chuỗi "null"', () => {
    expect(parseAnalysis({ ...base, currentLevel: null }).currentLevel).toBeNull();
  });

  it('vắng field (bản phân tích cũ) cũng ra null', () => {
    expect(parseAnalysis({ ...base }).currentLevel).toBeNull();
  });

  // Chuỗi rỗng/toàn khoảng trắng là "không có giá trị" đội lốt có giá trị — để lọt thì phía tiêu
  // thụ phải phân biệt ba trạng thái thay vì hai, và `''` là truthy-âm tính dễ vấp.
  it('chuỗi rỗng hoặc toàn khoảng trắng quy về null', () => {
    expect(parseAnalysis({ ...base, currentLevel: '' }).currentLevel).toBeNull();
    expect(parseAnalysis({ ...base, currentLevel: '   ' }).currentLevel).toBeNull();
  });
});
