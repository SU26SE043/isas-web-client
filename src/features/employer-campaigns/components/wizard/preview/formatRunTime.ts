/**
 * Nhãn của MỘT lượt chấm thử = giờ tạo. Không đánh số "Lượt N": GET lịch sử (employer lẫn admin) chỉ trả 20 lượt
 * mới nhất, nên vị trí trong cửa sổ không phải số thứ tự thật (admin kẹt ở "Lượt 20"). Có giây vì chấm một bài
 * ~7 giây ⇒ hai lượt cùng phút là chuyện thường. Một định dạng cho header kết quả, danh sách lượt trước và panel admin.
 */
export function formatRunTime(value: string, language: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium', timeStyle: 'medium' });
}
