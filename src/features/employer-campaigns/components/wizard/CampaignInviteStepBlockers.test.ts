import { describe, expect, it } from 'vitest';

/**
 * Bước 7 (Mời ứng viên) — ba chỗ khiến không thao tác được gì, tìm ra khi đi thử luồng thật.
 * Cả ba đều im lặng: không lỗi, không cảnh báo, chỉ là không dùng được.
 */
const sources = import.meta.glob('/src/features/employer-campaigns/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const read = (suffix: string) => {
  const key = Object.keys(sources).find((path) => path.endsWith(suffix));
  if (!key) throw new Error(`Không tìm thấy ${suffix}`);
  return stripComments(sources[key]);
};

describe('CMP3 — bước 7 Mời ứng viên', () => {
  it('ô nhập email không được đồng bộ ngược theo identity của mảng', () => {
    // Mỗi lần gõ, saveEmails gọi onInviteEmailsChange; hook luôn dựng mảng MỚI ⇒ effect phụ
    // thuộc identity sẽ chạy và ghi đè textarea bằng danh sách ĐÃ LỌC ⇒ ký tự đang gõ dở
    // biến mất ngay khi vừa gõ, không gõ tay được email nào.
    const source = read('/wizard/CampaignInvitesStep.tsx');
    const effect = source.slice(source.indexOf('setEmailText(inviteEmails.join'));
    const guarded = source.includes('const typed = parseEmails(emailText)');
    expect(guarded, 'phải so NỘI DUNG trước khi ghi đè, không so identity mảng').toBe(true);
    expect(effect.length).toBeGreaterThan(0);
  });

  // SCR1: nhu cầu là chi tiết nội bộ do backend suy ra từ JD; không còn UI hay lời gọi
  // suggest/save job-needs ở bước mời. Giữ các tiền đề còn kiểm tra hành vi của bước này.

  it('tick chọn ứng viên ở tab Lọc từ CV phải có nút đưa vào danh sách mời', () => {
    // Bước 7 truyền ĐỒNG THỜI hideInvitationAction và onAddCandidates; nếu khối bị ẩn theo
    // hideInvitationAction thì nhánh onAddCandidates là code chết ⇒ sàng lọc xong không dùng
    // được kết quả.
    const source = read('/screening/CvScreeningPanel.tsx');
    expect(source.includes('!hideInvitationAction || onAddCandidates')).toBe(true);
  });
});
