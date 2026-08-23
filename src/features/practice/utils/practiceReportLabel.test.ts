import { describe, expect, it } from 'vitest';
import { formatPracticeSessionStamp, practiceReportTitle } from './practiceReportLabel';

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
