import { describe, expect, it } from 'vitest';
import {
  CAMPAIGN_AI_GENERATE_MAX,
  CAMPAIGN_QUESTION_HARD_MAX,
} from '../../utils/campaignQuestionLimits';

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

/** Cắt thân một `export function` (đóng ngoặc ở cột 0 ⇒ không dính khối con). */
const exportedFunctionBody = (source: string, name: string) => {
  const start = source.indexOf(`export function ${name}(`);
  expect(start, `Không tìm thấy hàm ${name}`).toBeGreaterThanOrEqual(0);
  const end = source.indexOf('\n}', start);
  expect(end, `Hàm ${name} không có điểm kết thúc`).toBeGreaterThan(start);
  return source.slice(start, end);
};

const callbackBody = (source: string, name: string) => {
  const start = source.indexOf(`const ${name} = useCallback(`);
  expect(start, `Không tìm thấy callback ${name}`).toBeGreaterThanOrEqual(0);
  const end = source.indexOf('\n  },', start);
  expect(end, `Callback ${name} không có điểm kết thúc`).toBeGreaterThan(start);
  return source.slice(start, end);
};

describe('UX3-F3 — trần ngân hàng đề', () => {
  /**
   * A5 — ĐỔI TIỀN ĐỀ CÓ CHỦ ĐÍCH: bản trước chốt cứng `CAMPAIGN_QUESTION_HARD_MAX === 20`.
   *
   * Con số 20 đó SAI so với hợp đồng backend: trần KÍCH THƯỚC ngân hàng đề là
   * `MaxQuestionsPerCampaign = 200` (`QuestionLimits.cs:36`, áp ở `CampaignService.cs:3673`).
   * FE dùng chung MỘT hằng = 20 cho cả trần ngân hàng đề LẪN trần một lượt gọi AI, nên
   * chặt hơn hợp đồng 10 lần — nhà tuyển dụng không tạo nổi rổ đề quá 20 câu, làm chính
   * tính năng "mỗi ứng viên bốc N câu trong rổ" mất ý nghĩa (rổ phải LỚN hơn N).
   *
   * Nay tách đôi. Lưới dưới đây khoá CẢ HAI giá trị: gộp lại thành một hằng, hay đặt nhầm
   * giá trị của hằng này sang hằng kia, đều phải làm đỏ.
   */
  it('hai trần là HAI hằng khác nhau, khớp đúng hai hằng backend', () => {
    // Trần kích thước ngân hàng đề ← QuestionLimits.cs:36 `MaxQuestionsPerCampaign`.
    expect(CAMPAIGN_QUESTION_HARD_MAX).toBe(200);
    // Trần chi phí một lượt gọi AI ← CampaignService.cs:930 `MaxGeneratedQuestions`.
    expect(CAMPAIGN_AI_GENERATE_MAX).toBe(20);
    // Bằng nhau = ai đó đã gộp lại; đó đúng là lỗi bản này sinh ra để sửa.
    expect(CAMPAIGN_QUESTION_HARD_MAX).not.toBe(CAMPAIGN_AI_GENERATE_MAX);
  });

  /**
   * Lưới QUÉT MÃ NGUỒN chứ không phải lưới hành vi, vì hai đường dưới đây nối nhầm hằng
   * mà KHÔNG có triệu chứng: `defaultGenerateCount` là `Math.min(<trần>, 10)` — cả 20 lẫn
   * 200 đều ra 10. Chỉ có mã nguồn mới phân biệt được ý định.
   */
  it('đường sinh câu AI bám trần lượt gọi AI, KHÔNG bám trần ngân hàng đề', () => {
    const source = read('/utils/campaignQuestionLimits.ts');

    const validate = exportedFunctionBody(source, 'validateGenerateCount');
    expect(
      validate.includes('CAMPAIGN_AI_GENERATE_MAX'),
      'validateGenerateCount phải kẹp theo CAMPAIGN_AI_GENERATE_MAX (20).',
    ).toBe(true);
    expect(
      validate.includes('CAMPAIGN_QUESTION_HARD_MAX'),
      'validateGenerateCount KHÔNG được kẹp theo trần ngân hàng đề (200): FE sẽ cho gõ tới\n' +
        '200 rồi backend trả 400 "count phải trong khoảng 1..20." — lỗi nổ sau khi người dùng bấm.',
    ).toBe(false);

    const fallback = exportedFunctionBody(source, 'defaultGenerateCount');
    expect(
      fallback.includes('CAMPAIGN_AI_GENERATE_MAX'),
      'defaultGenerateCount là mặc định của Ô SỐ CÂU AI ⇒ phải bám trần lượt gọi AI.',
    ).toBe(true);
    expect(
      fallback.includes('CAMPAIGN_QUESTION_HARD_MAX'),
      'defaultGenerateCount KHÔNG được bám trần ngân hàng đề. Hôm nay nối nhầm vẫn ra 10 nên\n' +
        'không test hành vi nào thấy — nới trần AI về sau là nó âm thầm sai.',
    ).toBe(false);
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
    // CMP3-F5 tách phần render từng bước khỏi CampaignWizardForm sang
    // CampaignWizardStepContent (né trần 250 dòng). Bất biến KHÔNG đổi — vẫn là
    // "truyền nguyên questionBankWarnings từ campaign state xuống" — chỉ đổi chỗ ở.
    const source = read('/wizard/CampaignWizardStepContent.tsx');

    expect(
      /questionBankWarnings=\{campaign\?\.questionBankWarnings \?\? \[\]\}/.test(source),
      'CampaignWizardForm phải truyền nguyên questionBankWarnings đã được mapper đưa vào campaign state.',
    ).toBe(true);
  });

  it('hook Câu hỏi dùng trần ngân hàng đề, không kéo settings.maxQuestions vào chốt', () => {
    const source = read('/hooks/useCampaignWizard.ts');

    expect(
      source.includes('effectiveMaxQuestions'),
      'useCampaignWizard không được còn effectiveMaxQuestions — đây là đường kéo trần buổi vào ngân hàng đề.',
    ).toBe(false);
    expect(source).toMatch(/validateGenerateCount\(state\.questionCount\)/);
    expect(source).not.toMatch(/validateGenerateCount\([^)]*,/);
    expect(source).toMatch(/defaultGenerateCount\(\)/);
    expect(source).not.toMatch(/defaultGenerateCount\([^)]*,/);
    expect(callbackBody(source, 'saveQuestionsNow')).toContain(
      'const max = CAMPAIGN_QUESTION_HARD_MAX;',
    );
    expect(callbackBody(source, 'saveQuestionsNow')).not.toContain('settings.maxQuestions');
    expect(callbackBody(source, 'addManualQuestion')).toContain(
      'const max = CAMPAIGN_QUESTION_HARD_MAX;',
    );
    expect(callbackBody(source, 'addManualQuestion')).not.toContain('settings.maxQuestions');
    expect(
      /const max = CAMPAIGN_QUESTION_HARD_MAX;/.test(source),
      'useCampaignWizard phải dùng CAMPAIGN_QUESTION_HARD_MAX cho save và add-manual.',
    ).toBe(true);
  });

  it('validator toàn wizard cũng dùng trần ngân hàng đề, không dùng trần mỗi buổi', () => {
    const source = read('/utils/validateCampaignWizard.ts');

    expect(source).toContain('if (questions.length > CAMPAIGN_QUESTION_HARD_MAX)');
    expect(source).not.toMatch(/questions\.length\s*>\s*settings\.maxQuestions/);
  });
});
