/**
 * Nhãn phân biệt cho MỘT buổi luyện trong danh sách chọn báo cáo.
 *
 * 🔴 Ca thật (23/08): cột "Tiêu đề" lấy thẳng `jobCategory` (`practiceSessionHistoryActions.ts`),
 * nên mọi buổi cùng một ngành hiện y hệt nhau — bảng ba dòng đều ghi "BE" và người dùng không
 * biết mình đang tick buổi nào.
 *
 * API `PracticeSessionSummary` KHÔNG trả tên buổi, nên KHÔNG bịa tên: ghép mốc thời gian bắt đầu
 * — thứ đã có sẵn trong `InterviewHistoryItem.date` — làm dòng phụ.
 *
 * `withDate=false` dùng cho bảng vốn ĐÃ có cột Ngày riêng (chỉ cần thêm giờ:phút để tách hai buổi
 * cùng ngày); `withDate=true` dùng cho danh sách không có cột ngày (bước Xác nhận).
 */
export function formatPracticeSessionStamp(
  iso: string | null | undefined,
  language: 'vi' | 'en',
  options: { withDate?: boolean } = {},
): string {
  if (!iso) return '';
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return '';
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const time = value.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  if (!options.withDate) return time;
  const date = value.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  return `${time} · ${date}`;
}
