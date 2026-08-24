import { describe, expect, it } from 'vitest';
import {
  PRACTICE_SESSION_SOURCE_LABEL_KEYS,
  formatPracticeSessionStamp,
  practiceReportTitle,
  practiceSessionSource,
} from './practiceReportLabel';

describe('formatPracticeSessionStamp', () => {
  it('không kèm ngày ⇒ chỉ giờ:phút (bảng đã có cột Ngày riêng)', () => {
    const out = formatPracticeSessionStamp('2026-08-20T07:32:00Z', 'vi');
    expect(out).toMatch(/\d{1,2}:\d{2}/);
    expect(out).not.toMatch(/2026/);
  });

  it('kèm ngày ⇒ có cả năm (danh sách Xác nhận không có cột Ngày)', () => {
    expect(formatPracticeSessionStamp('2026-08-20T07:32:00Z', 'vi', { withDate: true })).toMatch(/2026/);
  });

  it('hai buổi khác giờ cho ra hai nhãn KHÁC nhau — đúng thứ cột "Tiêu đề" cũ không làm được', () => {
    const a = formatPracticeSessionStamp('2026-08-20T07:32:00Z', 'vi', { withDate: true });
    const b = formatPracticeSessionStamp('2026-08-20T11:05:00Z', 'vi', { withDate: true });
    expect(a).not.toEqual(b);
  });

  it('thiếu hoặc hỏng mốc thời gian ⇒ chuỗi rỗng, KHÔNG "Invalid Date"', () => {
    expect(formatPracticeSessionStamp(undefined, 'vi')).toBe('');
    expect(formatPracticeSessionStamp('', 'en')).toBe('');
    expect(formatPracticeSessionStamp('không-phải-ngày', 'en')).toBe('');
  });
});

/**
 * F3 — bảng chọn báo cáo trước đây hiện đúng một chữ "BE" cho MỌI buổi Backend (tám dòng liên
 * tiếp giống hệt nhau trên dev). Backend nay trả `lessonTitle`; nhưng `null` là ca thật và không
 * hiếm (3/18 buổi = luyện tự do), và với nhóm đó KHÔNG được dựng một cái tên rồi trình bày như
 * tên thật.
 */
describe('practiceReportTitle', () => {
  it('dùng tên bài học khi có — đó là dữ liệu thật, không phải tên máy sinh', () => {
    expect(practiceReportTitle({ lessonTitle: 'Truy vấn SQL nâng cao', jobTitle: 'BE' })).toEqual({
      text: 'Truy vấn SQL nâng cao',
      isFreePractice: false,
    });
  });

  // Cờ này là thứ chỗ hiển thị dựa vào để phân biệt "tên thật" với "nhãn ghép". Mất nó thì buổi
  // tự do trông y hệt một bài học có tên — nói dối về nguồn gốc của dòng đó.
  it('không có tên bài ⇒ gắn cờ luyện tự do, KHÔNG bịa tên', () => {
    expect(practiceReportTitle({ lessonTitle: null, jobTitle: 'BE' })).toEqual({
      text: 'BE',
      isFreePractice: true,
    });
    expect(practiceReportTitle({ jobTitle: 'BE' })).toEqual({ text: 'BE', isFreePractice: true });
  });

  // Chuỗi rỗng/khoảng trắng là "không có tên" đội lốt có tên — để lọt thì bảng hiện một ô trắng
  // mà vẫn tự nhận là tên bài học.
  it('tên bài toàn khoảng trắng tính là không có', () => {
    expect(practiceReportTitle({ lessonTitle: '   ', jobTitle: 'BE' })).toEqual({
      text: 'BE',
      isFreePractice: true,
    });
  });

  it('không có gì để ghép thì trả chuỗi rỗng, không trả "undefined"', () => {
    expect(practiceReportTitle({})).toEqual({ text: '', isFreePractice: true });
  });
});

/**
 * 🔴 Ca thật (23/08): trang Báo cáo hiện "Luyện tập theo lộ trình (0)" cho tài khoản đã học xong
 * một bài, còn "Luyện phỏng vấn (2)" thì gộp CẢ buổi sinh từ bài học. Phân loại buổi vì thế phải
 * có đúng MỘT định nghĩa, dùng chung cho mọi chỗ đọc nó.
 */
describe('practiceSessionSource', () => {
  it('có tên bài học ⇒ buổi thuộc lộ trình', () => {
    expect(practiceSessionSource({ lessonTitle: 'HTTP Methods', jobCategory: 'BE' })).toBe('lesson');
  });

  it('không có tên bài học ⇒ buổi luyện tự do', () => {
    expect(practiceSessionSource({ jobCategory: 'BE' })).toBe('free');
    expect(practiceSessionSource({ lessonTitle: null, jobCategory: 'BE' })).toBe('free');
  });

  it('tên bài học toàn khoảng trắng ⇒ vẫn là tự do, KHÔNG phải bài học tên rỗng', () => {
    expect(practiceSessionSource({ lessonTitle: '   ', jobCategory: 'BE' })).toBe('free');
  });

  it('KHÔNG có buổi nào rơi ra ngoài hai nhóm, và không buổi nào thuộc cả hai', () => {
    const samples = [
      { lessonTitle: 'Bài 1' },
      { lessonTitle: null, jobCategory: 'FE' },
      { lessonTitle: '', jobTitle: 'BA' },
      {},
    ];
    for (const sample of samples) {
      const source = practiceSessionSource(sample);
      expect(['lesson', 'free']).toContain(source);
      // Đồng bộ với `practiceReportTitle`: hai nơi không được nói khác nhau về cùng một buổi.
      expect(source === 'free').toBe(practiceReportTitle(sample).isFreePractice);
    }
  });
});

describe('PRACTICE_SESSION_SOURCE_LABEL_KEYS', () => {
  it('khai đủ khoá cho cả hai nguồn (thiếu nhánh = lỗi biên dịch, không phải chuỗi khoá lọt ra UI)', () => {
    expect(PRACTICE_SESSION_SOURCE_LABEL_KEYS).toEqual({
      lesson: 'practice.history.source.lesson',
      free: 'practice.history.source.free',
    });
  });
});
