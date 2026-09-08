import { describe, expect, it } from 'vitest';
import { CAMPAIGN_QUESTION_HARD_MAX } from '../../utils/campaignQuestionLimits';

/**
 * UX3-F3 — trần số câu của ngân hàng đề KHÔNG được phụ thuộc `settings.maxQuestions`.
 *
 * Trước UX3, `CampaignQuestionsStep` tính trần bằng `effectiveMaxQuestions(settings.maxQuestions)`,
 * mà mặc định của trường đó là 5 (`campaignWizard.types.ts`). Hệ quả đo được trên app thật:
 * nhà tuyển dụng muốn nạp 20 câu làm ngân hàng đề thì bị chặn ở 5, ô nhập AI có `max="5"` nên
 * gõ 8 bị nhả về 5 KHÔNG một thông báo nào, và ô quyết định trần lại nằm ở BƯỚC 5 trong khi nó
 * chặn người dùng ở BƯỚC 4.
 *
 * Đây là lưới QUÉT MÃ NGUỒN vì bất biến cần khoá là về CẤU TRÚC — "trần đến từ hằng số hệ thống,
 * không đến từ một trường cấu hình ở bước khác". Render component đòi ~15 prop và một cây provider;
 * thứ hỏng lại là MỘT dòng gán, nên đọc thẳng mã nguồn vừa rẻ vừa nhắm đúng chỗ.
 *
 * Mutation đã chạy trước khi viết lưới này: đổi lại `const max = 5` → 1031/1031 VẪN XANH.
 * Tức toàn bộ bản vá UX3-F3 đang không có gì canh.
 */
const sources = import.meta.glob('/src/features/employer-campaigns/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * Bỏ comment TRƯỚC khi quét. Bẫy đã dính ngay khi viết lưới này: chính câu giải thích
 * "trước bản này dùng effectiveMaxQuestions(...)" trong mã production làm lưới đỏ oan.
 * Tài liệu mô tả mẫu SAI sẽ bị lưới tính là vi phạm nếu không lọc.
 */
const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const read = (suffix: string) => {
  const hit = Object.entries(sources).find(([path]) => path.endsWith(suffix));
  // Đối chứng: glob hụt thì lưới thành đồng hồ chết, phải nổ chứ không được lặng lẽ qua.
  expect(hit, `Không tìm thấy ${suffix} — glob sai, lưới này vô hiệu`).toBeDefined();
  return stripComments(hit![1]);
};

describe('UX3-F3 — trần ngân hàng đề', () => {
  it('trần hệ thống là 20 câu', () => {
    expect(CAMPAIGN_QUESTION_HARD_MAX).toBe(20);
  });

  it('bước Câu hỏi lấy trần từ hằng số hệ thống, KHÔNG từ settings.maxQuestions', () => {
    const source = read('/wizard/CampaignQuestionsStep.tsx');

    expect(
      /const max = CAMPAIGN_QUESTION_HARD_MAX;/.test(source),
      'CampaignQuestionsStep phải dùng `const max = CAMPAIGN_QUESTION_HARD_MAX`.\n' +
        'Lấy trần từ settings.maxQuestions (mặc định 5) là chặn nhà tuyển dụng nạp ngân hàng đề\n' +
        'ngay ở bước 4, bằng một ô nằm ở bước 5.',
    ).toBe(true);

    expect(
      /effectiveMaxQuestions\s*\(/.test(source),
      'CampaignQuestionsStep KHÔNG được gọi effectiveMaxQuestions — đó chính là đường cũ\n' +
        'kéo settings.maxQuestions vào làm trần cho danh sách câu hỏi.',
    ).toBe(false);
  });

  it('khối Tóm tắt hiện ĐÚNG trần đang có hiệu lực, không tự tính trần riêng', () => {
    const source = read('/wizard/questions/QuestionsSummaryCard.tsx');

    // Đã xảy ra thật: bước Câu hỏi gỡ trần lên 20 nhưng khối tóm tắt vẫn tự tính
    // effectiveMaxQuestions(settings.maxQuestions) = 5, nên bảng ghi "Giới hạn câu hỏi 5 ·
    // Có thể thêm 5" trong khi người dùng THÊM ĐƯỢC tới 20. Hai nguồn sự thật, bên hiển thị
    // đọc nhầm bên — người dùng tin bảng và dừng ở 5.
    expect(
      /effectiveMaxQuestions\s*\(/.test(source),
      'QuestionsSummaryCard KHÔNG được tự tính trần từ settings.maxQuestions.\n' +
        'Nó phải hiện đúng con số mà CampaignQuestionsStep đang dùng để chặn.',
    ).toBe(false);

    // Kiểm PHÉP GÁN, không kiểm sự có mặt của tên. Bản đầu chỉ hỏi "chuỗi
    // CAMPAIGN_QUESTION_HARD_MAX có trong file không" — dòng import đã đủ thoả, nên đổi
    // `const max = 5` vẫn XANH. Mutation bắt được đúng lỗ này.
    expect(
      /const max = CAMPAIGN_QUESTION_HARD_MAX;/.test(source),
      'QuestionsSummaryCard phải GÁN trần bằng CAMPAIGN_QUESTION_HARD_MAX — cùng nguồn với chỗ chặn.\n' +
        'Chỉ import hằng số mà gán số khác là bảng tóm tắt nói dối người dùng.',
    ).toBe(true);
  });

  it('ô nhập số câu AI không kẹp cứng giá trị người dùng gõ', () => {
    const source = read('/wizard/questions/AiGenerateCard.tsx');

    expect(
      /\bmax=\{/.test(source),
      'AiGenerateCard KHÔNG được đặt thuộc tính max trên ô nhập. Trình duyệt sẽ cắt giá trị\n' +
        'IM LẶNG và nhánh báo lỗi countCampaignMax (campaignQuestionLimits.ts) không bao giờ\n' +
        'chạm tới được — người dùng gõ 8, thấy 5, không hiểu vì sao.',
    ).toBe(false);

    expect(
      /Math\.min\s*\(/.test(source),
      'AiGenerateCard KHÔNG được Math.min giá trị người dùng gõ. Giữ nguyên số họ nhập rồi\n' +
        'để validator hiện lỗi — mẫu đúng: PracticeJdStep.tsx (giới hạn + headroom).',
    ).toBe(false);
  });

  it('truyền cảnh báo ngân hàng đề từ campaign state xuống bước Câu hỏi', () => {
    const source = read('/wizard/CampaignWizardForm.tsx');

    expect(
      /questionBankWarnings=\{campaign\?\.questionBankWarnings \?\? \[\]\}/.test(source),
      'CampaignWizardForm phải truyền nguyên questionBankWarnings đã được mapper đưa vào campaign state.',
    ).toBe(true);
  });
});
