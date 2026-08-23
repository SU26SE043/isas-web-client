import { describe, expect, it } from 'vitest';
import { formatPracticeSessionStamp } from './practiceReportLabel';

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
