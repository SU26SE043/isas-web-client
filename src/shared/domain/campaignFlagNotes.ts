/**
 * Ghi chú phòng thi B2B gửi kèm cờ chống gian lận. Server lưu NGUYÊN VĂN vào `session_flags.note`,
 * nên đây cũng là chuỗi màn kết quả của HR nhận lại và phải dịch.
 *
 * MỘT nguồn cho cả hai đầu: phòng thi (`useCampaignAntiCheat`) gửi đi, màn HR (`flagNoteText`) dịch về.
 * Sửa câu ở đây thì dữ liệu cũ trong DB vẫn mang câu cũ — khi đổi, thêm câu cũ vào bảng dịch của
 * `flagNoteText` để cờ đã ghi không quay về tiếng Anh thô.
 */
export const CAMPAIGN_FLAG_NOTES = {
  fullscreenExit: 'Candidate exited fullscreen mode.',
  tabSwitch: 'Candidate switched away from the interview tab.',
  windowSwitch: 'Candidate left the interview window using Alt+Tab or window switching.',
  focusLost: 'Candidate lost focus from the interview window.',
  paste: 'Candidate attempted to paste content during the interview.',
  cameraUnavailable: 'Candidate camera became unavailable during the interview.',
} as const;

export type CampaignFlagNoteName = keyof typeof CAMPAIGN_FLAG_NOTES;

/** Đuôi phòng thi nối vào ghi chú khi ứng viên đang khắc phục thiết bị. */
export const CAMPAIGN_FLAG_NOTE_RECOVERY_SUFFIX = ' (đang khắc phục thiết bị)';

/**
 * Đuôi phòng thi nối vào ghi chú `monitoring_gap` khi khoảng trống chủ yếu do lượt kiểm mặt bị HOÃN vì
 * đang gửi câu trả lời — tức do chính hệ thống chọn, không phải ứng viên. Cờ vẫn được gửi (suốt khoảng
 * đó thật sự không ai quan sát; bỏ cờ là giấu một điểm mù), chỉ là HR đọc được lý do.
 */
export const CAMPAIGN_FLAG_NOTE_UPLOAD_SUFFIX = ' — trong lúc gửi câu trả lời';
