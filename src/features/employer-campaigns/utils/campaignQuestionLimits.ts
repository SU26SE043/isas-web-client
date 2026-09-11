/** Shared helpers for campaign question count + server ID preservation. */

/**
 * Trần KÍCH THƯỚC ngân hàng đề — số câu tối đa MỘT chiến dịch được lưu.
 *
 * Khớp backend `Isas.CampaignService/Validation/QuestionLimits.cs:36`
 * (`MaxQuestionsPerCampaign = 200`), áp thật ở đường ghi
 * `Isas.CampaignService/Services/CampaignService.cs:3673` (`PUT /questions`) chứ
 * không chỉ ở parser CSV.
 *
 * ⚠ KHÔNG gộp với `CAMPAIGN_AI_GENERATE_MAX` bên dưới — hai con số khác BẢN CHẤT.
 * Trước bản này FE chỉ có MỘT hằng = 20 dùng cho cả hai vai, tức chặt hơn hợp đồng
 * 10 lần: nhà tuyển dụng không tạo nổi ngân hàng đề quá 20 câu, trong khi chính
 * tính năng "mỗi ứng viên bốc N câu trong rổ" chỉ có nghĩa khi rổ LỚN hơn số câu
 * mỗi người thi.
 */
export const CAMPAIGN_QUESTION_HARD_MAX = 200;

/**
 * Trần CHI PHÍ MỘT LƯỢT gọi AI sinh câu hỏi — không phải trần tổng.
 *
 * Khớp backend `Isas.CampaignService/Services/CampaignService.cs:930`
 * (`MaxGeneratedQuestions = 20`); vượt → 400 `"count phải trong khoảng 1..20."`
 * (`CampaignService.cs:959`). Bấm sinh nhiều lượt vẫn nạp được tới
 * `CAMPAIGN_QUESTION_HARD_MAX` câu — trần này chặn chi phí token mỗi lần gọi.
 *
 * ⚠ Còn một số 20 THỨ BA, không liên quan cả hai: `settings.maxQuestions` = số câu
 * MỘT BUỔI THI, khớp CHECK `ck_practice_sessions_max_questions_range`
 * (`Isas.InterviewService/Configurations/PracticeSessionConfiguration.cs:44`) và
 * được canh riêng bằng `MAX_QUESTIONS_LIMIT` trong `validateCampaignWizard.ts`.
 * Ba con số, ba hằng — đừng gộp bất kỳ cặp nào.
 */
export const CAMPAIGN_AI_GENERATE_MAX = 20;

export function defaultGenerateCount(): number {
  // Mặc định của Ô SỐ CÂU AI ⇒ bám trần lượt gọi AI, không bám trần ngân hàng đề.
  // Hôm nay hai đường cho cùng kết quả 10, nên nối nhầm hằng KHÔNG có triệu chứng —
  // vì thế `questionCapGuard.test.ts` canh chỗ này bằng lưới quét mã nguồn.
  return Math.min(CAMPAIGN_AI_GENERATE_MAX, 10);
}

export type QuestionCountValidationCode =
  | 'countRequired'
  | 'countPositive'
  | 'countInteger'
  | 'countMaximum';

export function validateGenerateCount(
  raw: unknown,
): { ok: true; count: number } | { ok: false; code: QuestionCountValidationCode; max?: number } {
  if (raw === '' || raw == null) {
    return { ok: false, code: 'countRequired' };
  }
  const num = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(num)) {
    return { ok: false, code: 'countInteger' };
  }
  if (!Number.isInteger(num)) {
    return { ok: false, code: 'countInteger' };
  }
  if (num <= 0) {
    return { ok: false, code: 'countPositive' };
  }
  // Đây là số câu xin trong MỘT lượt gọi AI ⇒ trần lượt gọi (20), KHÔNG phải trần
  // ngân hàng đề (200). Nối nhầm sang trần ngân hàng đề thì FE cho gõ tới 200 rồi
  // backend trả 400 "count phải trong khoảng 1..20." — lỗi nổ ở phía sau, sau khi
  // người dùng đã bấm sinh.
  const aiMax = CAMPAIGN_AI_GENERATE_MAX;
  if (num > aiMax) {
    return { ok: false, code: 'countMaximum', max: aiMax };
  }
  return { ok: true, count: num };
}

/**
 * True when the id looks like a server-issued GUID (an toàn để echo lên PUT).
 *
 * Dùng cho CẢ câu hỏi LẪN tiêu chí. Client tự đúc id theo nhiều kiểu
 * (`criterion-N`, `system-N`, `new-xxxxxxxx`, `technical-depth`…) và gửi kiểu nào
 * lên cũng làm server ném lỗi parse Guid ⇒ hỏng CẢ lượt tạo chiến dịch.
 * Nhận diện bằng HÌNH DẠNG GUID, KHÔNG bằng danh sách tiền tố cấm — danh sách
 * cấm luôn thiếu kiểu mới (đã hỏng đúng vì thế).
 */
export function isServerEntityId(id: string | undefined | null): boolean {
  if (!id?.trim()) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id.trim(),
  );
}

export function hasWizardJd(jd: {
  inputMethod: 'file' | 'text';
  jdText: string;
  serverUploaded: boolean;
  fileStatus: string;
}): boolean {
  if (jd.inputMethod === 'text') {
    return jd.jdText.trim().length > 0;
  }
  return jd.serverUploaded || jd.fileStatus === 'uploaded';
}

