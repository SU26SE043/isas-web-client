import { describe, expect, it } from 'vitest';
import { practiceTranslations } from './translations';
import { ROADMAP_WIZARD_STEP_LABEL_KEYS } from '../components/roadmap-wizard/RoadmapWizardShell';
import { PRACTICE_SESSION_SOURCE_LABEL_KEYS } from '../utils/practiceReportLabel';
import {
  PRACTICE_HISTORY_STATUS_GROUP_LABEL_KEYS,
  PRACTICE_SESSION_STATUS_LABEL_KEYS,
} from '../utils/practiceSessionHistoryActions';
import { CREATE_ROADMAP_ERROR_CODES } from '../utils/roadmapCreateErrors';

/**
 * Repo KHÔNG có sẵn test này (brief giả định là có — xem báo cáo).
 *
 * Vì sao cần: `TranslationMap = Record<string, string>` nên TypeScript KHÔNG ép hai
 * ngôn ngữ cùng bộ khoá, và `getTranslation` trả `translations[key] ?? key` — thiếu
 * khoá thì màn hình in ra nguyên chuỗi `practice.learningPath.xyz` cho người dùng
 * thật, không lỗi, không cảnh báo. Đúng lớp hỏng-im-lặng.
 */
describe('practiceTranslations', () => {
  const viKeys = Object.keys(practiceTranslations.vi).sort();
  const enKeys = Object.keys(practiceTranslations.en).sort();

  it('vi và en có CÙNG bộ khoá', () => {
    const missingInEn = viKeys.filter((key) => !(key in practiceTranslations.en));
    const missingInVi = enKeys.filter((key) => !(key in practiceTranslations.vi));
    expect({ missingInEn, missingInVi }).toEqual({ missingInEn: [], missingInVi: [] });
  });

  it('không khoá nào có giá trị rỗng', () => {
    const empty = [...viKeys, ...enKeys].filter(
      (key) =>
        !practiceTranslations.vi[key]?.trim() || !practiceTranslations.en[key]?.trim(),
    );
    expect(empty).toEqual([]);
  });

  it('mọi khoá của báo cáo lộ trình thêm trong vòng này đều có ở cả hai ngôn ngữ', () => {
    const added = [
      'practice.radar.start',
      'practice.radar.noStart',
      'practice.radar.sampleSize',
      'practice.radar.startHint',
      'practice.learningPath.reportEmptyTitle',
      'practice.learningPath.reportEmptyDesc',
      'practice.learningPath.reportInterimTitle',
      'practice.learningPath.reportInterimDesc',
      'practice.learningPath.viewRoadmapReportInterim',
      'practice.learningPath.improvementsEmpty',
      'practice.learningPath.progressChartTitle',
      'practice.learningPath.progressChartDesc',
      'practice.learningPath.progressChartOverall',
      'practice.learningPath.progressChartToggleHint',
      'practice.learningPath.progressChartTooFew',
    ];
    for (const key of added) {
      expect(practiceTranslations.vi[key], `vi thiếu ${key}`).toBeTruthy();
      expect(practiceTranslations.en[key], `en thiếu ${key}`).toBeTruthy();
    }
  });

  it('mọi khoá của báo cáo điểm từng chặng đều có ở cả hai ngôn ngữ', () => {
    const added = [
      'practice.milestoneReport.show',
      'practice.milestoneReport.hide',
      'practice.milestoneReport.showGeneric',
      'practice.milestoneReport.sourceLabel',
      'practice.milestoneReport.source.snapshot',
      'practice.milestoneReport.source.computed',
      'practice.milestoneReport.source.recomputed',
      'practice.milestoneReport.source.unknown',
      'practice.milestoneReport.comparedWithLabel',
      'practice.milestoneReport.comparedWith.previousMilestone',
      'practice.milestoneReport.comparedWith.baseline',
      'practice.milestoneReport.comparedWith.none',
      'practice.milestoneReport.comparedWith.unknown',
      'practice.milestoneReport.mismatchWarning',
      'practice.milestoneReport.headlineValue',
      'practice.milestoneReport.current',
      'practice.milestoneReport.reference',
      'practice.milestoneReport.delta',
      'practice.milestoneReport.sessionsCurrent',
      'practice.milestoneReport.sessionsReference',
      'practice.milestoneReport.noSessions',
      'practice.milestoneReport.attempt',
    ];
    for (const key of added) {
      expect(practiceTranslations.vi[key], `vi thiếu ${key}`).toBeTruthy();
      expect(practiceTranslations.en[key], `en thiếu ${key}`).toBeTruthy();
    }
  });

  it('mọi trạng thái `source` đều có nhãn RIÊNG — không nhãn nào bị bỏ trống hay trùng nhau', () => {
    // `source` là lý do con số có thể lệch tiêu đề. Hai trạng thái dùng chung một câu
    // chữ thì người đọc không phân biệt được "đã chốt" với "tính lại".
    for (const lang of ['vi', 'en'] as const) {
      const labels = ['snapshot', 'computed', 'recomputed', 'unknown'].map(
        (name) => practiceTranslations[lang][`practice.milestoneReport.source.${name}`],
      );
      expect(new Set(labels).size, `${lang} có nhãn source trùng nhau`).toBe(4);
    }
  });

  it('nhãn báo cáo chặng KHÔNG dùng placeholder — con số render thành node riêng', () => {
    // Có chủ đích: `t()` bị mock thành hàm đồng nhất trong test, nên `.replace('{x}', …)`
    // không thay được gì và CON SỐ trở thành thứ không test nào kiểm được. Tách ra node
    // riêng thì con số kiểm được thật.
    for (const key of ['attempt', 'headlineValue', 'comparedWith.previousMilestone'] as const) {
      for (const lang of ['vi', 'en'] as const) {
        expect(practiceTranslations[lang][`practice.milestoneReport.${key}`]).not.toMatch(/\{[a-z]+\}/i);
      }
    }
  });

  it('placeholder {count} của cỡ mẫu tồn tại ở cả hai ngôn ngữ', () => {
    // Thiếu placeholder thì `.replace('{count}', …)` im lặng không thay gì cả.
    expect(practiceTranslations.vi['practice.radar.sampleSize']).toContain('{count}');
    expect(practiceTranslations.en['practice.radar.sampleSize']).toContain('{count}');
  });

  it('nhãn "Đã tiến bộ" nói đúng nghĩa dữ liệu, không đọc thành "cần cải thiện"', () => {
    // Backend sinh `improvements` = danh sách tiêu chí ĐÃ tiến bộ so với mốc đầu (lời KHEN).
    // Nhãn cũ "Cải thiện"/"Improvements" đứng cạnh "Điểm yếu" bị đọc thành ngược nghĩa.
    expect(practiceTranslations.vi['practice.learningPath.improvements']).toBe('Đã tiến bộ');
    expect(practiceTranslations.en['practice.learningPath.improvements']).toBe('Improved');
  });

  it('nhãn quay lại không còn gọi trang lộ trình là "Học tập"', () => {
    // Hai mục menu "Học tập" + "Lộ trình" đã gộp làm một (commit 1947e43).
    expect(practiceTranslations.vi['practice.learningPath.backToDashboard']).not.toContain('Học tập');
    expect(practiceTranslations.en['practice.learningPath.backToDashboard']).not.toContain('Learning');
  });

  // 🔴 Ca thật đã lọt ra người dùng (22/08): stepper của wizard lộ trình hiện thẳng chuỗi
  // `practice.roadmapWizard.steps.targetLevel` ở bước 6. Gốc: page ghép khoá ĐỘNG
  // `steps.${step}` từ id bước, mà id là `targetLevel` còn chuỗi dịch khai `steps.level`.
  //
  // Hai lớp lẽ ra phải bắt nhưng KHÔNG: TypeScript mù vì khoá ghép lúc chạy, và
  // `check:i18n` chỉ so CÂN BẰNG VI/EN — cả hai ngôn ngữ cùng thiếu thì nó vẫn xanh.
  //
  // Nay page dùng `ROADMAP_WIZARD_STEP_LABEL_KEYS` (Record đầy đủ theo `RoadmapWizardStep`)
  // nên quên MỘT BƯỚC là lỗi biên dịch. Test này khoá vế còn lại: khoá có tồn tại thật
  // trong CẢ HAI ngôn ngữ, không chỉ được khai trong Record.
  it('mọi nhãn bước của wizard lộ trình đều có chuỗi dịch ở CẢ vi lẫn en', () => {
    const keys = Object.values(ROADMAP_WIZARD_STEP_LABEL_KEYS);
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      expect(practiceTranslations.vi[key], `thiếu vi: ${key}`).toBeTruthy();
      expect(practiceTranslations.en[key], `thiếu en: ${key}`).toBeTruthy();
    }
  });

  it('mọi mã lỗi tạo roadmap đều có chuỗi dịch ở CẢ vi lẫn en', () => {
    expect(CREATE_ROADMAP_ERROR_CODES).toHaveLength(11);
    for (const code of CREATE_ROADMAP_ERROR_CODES) {
      const key = `practice.roadmapWizard.errors.${code}`;
      expect(practiceTranslations.vi[key], `vi thiếu ${key}`).toBeTruthy();
      expect(practiceTranslations.en[key], `en thiếu ${key}`).toBeTruthy();
    }
  });

  it('danh sách mã lỗi giữ đủ các lỗi HTTP và lỗi nghiệp vụ đã chốt', () => {
    expect(CREATE_ROADMAP_ERROR_CODES).toEqual([
      'invalid_input',
      'sessions_required',
      'too_many_sessions',
      'no_weakness',
      'no_content_mistakes',
      'language_mismatch',
      'unsupported_level',
      'forbidden',
      'cv_not_found',
      'ai_failed',
      'generic',
    ]);
  });

  // Cùng lý do: `check:i18n` chỉ so CÂN BẰNG vi/en, nên khoá thiếu ở CẢ HAI ngôn ngữ vẫn xanh.
  // Nhãn nguồn buổi luyện là thứ duy nhất phân biệt buổi bài học với buổi tự do trên bảng lịch
  // sử — mất chuỗi dịch thì hai loại buổi lại hiện y hệt nhau, đúng bug vừa sửa.
  it('nhãn nguồn buổi luyện (bài học / tự do) có chuỗi dịch ở CẢ vi lẫn en', () => {
    const keys = Object.values(PRACTICE_SESSION_SOURCE_LABEL_KEYS);
    expect(keys.length).toBe(2);
    for (const key of keys) {
      expect(practiceTranslations.vi[key], `thiếu vi: ${key}`).toBeTruthy();
      expect(practiceTranslations.en[key], `thiếu en: ${key}`).toBeTruthy();
    }
  });

  // Nhãn trạng thái buổi luyện: khuyết chuỗi dịch thì badge in ra nguyên chuỗi khoá
  // `practice.history.status.ready` cho người dùng — cùng hạng với bug enum thô vừa sửa.
  it('mọi nhãn trạng thái buổi luyện có chuỗi dịch ở CẢ vi lẫn en', () => {
    const keys = [
      ...Object.values(PRACTICE_HISTORY_STATUS_GROUP_LABEL_KEYS),
      ...Object.values(PRACTICE_SESSION_STATUS_LABEL_KEYS),
    ];
    expect(keys.length).toBe(8);
    for (const key of keys) {
      expect(practiceTranslations.vi[key], `thiếu vi: ${key}`).toBeTruthy();
      expect(practiceTranslations.en[key], `thiếu en: ${key}`).toBeTruthy();
    }
  });

  // Tiêu đề cột phải TÁCH khỏi nhãn ô lọc: dùng chung khoá thì header bảng ghi "Lọc trạng thái".
  it('tiêu đề cột Trạng thái tồn tại và KHÁC nhãn ô lọc', () => {
    for (const lang of ['vi', 'en'] as const) {
      expect(practiceTranslations[lang]['practice.history.columns.status']).toBeTruthy();
      expect(practiceTranslations[lang]['practice.history.columns.status']).not.toBe(
        practiceTranslations[lang]['practice.history.filterStatus'],
      );
    }
  });

  /**
   * Ô lọc nguồn buổi luyện. Nhãn HAI lựa chọn chính dùng chung khoá với nhãn trên từng hàng của
   * bảng (`PRACTICE_SESSION_SOURCE_LABEL_KEYS`) nên đã được `Record` ép ở tầng biên dịch; hai khoá
   * còn lại là chuỗi tự do nên phải khoá sự TỒN TẠI ở đây — `check:i18n` chỉ so cân bằng vi/en, nên
   * thiếu ở CẢ HAI ngôn ngữ thì nó không kêu, mà màn hình sẽ in ra nguyên chuỗi khoá.
   */
  it('ô lọc nguồn buổi luyện có đủ chuỗi ở cả vi lẫn en', () => {
    for (const key of [
      'practice.history.filterSource',
      'practice.history.filters.allSources',
      ...Object.values(PRACTICE_SESSION_SOURCE_LABEL_KEYS),
    ]) {
      expect(practiceTranslations.vi[key], `vi thiếu ${key}`).toBeTruthy();
      expect(practiceTranslations.en[key], `en thiếu ${key}`).toBeTruthy();
    }
  });

  // Nhãn ô lọc nguồn phải ĐỌC RA KHÁC nhau — hai lựa chọn cùng chữ thì ô lọc vô dụng.
  it('hai lựa chọn nguồn có nhãn khác nhau, và khác nhãn "tất cả"', () => {
    for (const lang of ['vi', 'en'] as const) {
      const lesson = practiceTranslations[lang][PRACTICE_SESSION_SOURCE_LABEL_KEYS.lesson];
      const free = practiceTranslations[lang][PRACTICE_SESSION_SOURCE_LABEL_KEYS.free];
      const all = practiceTranslations[lang]['practice.history.filters.allSources'];
      expect(new Set([lesson, free, all]).size).toBe(3);
    }
  });

  /**
   * Gợi ý dưới ô tìm kiếm từng viết "Bộ lọc áp dụng cho trang hiện tại" — câu đó nay SAI với ô lọc
   * nguồn, vốn chạy phía server và áp cho toàn bộ lịch sử. Khoá bằng quan hệ (phải nhắc tới nguồn)
   * chứ không khoá nguyên câu: khoá nguyên câu thì sửa câu chữ là test đỏ vô nghĩa.
   */
  it('gợi ý bộ lọc nói rõ ô lọc nguồn không chỉ áp cho trang hiện tại', () => {
    expect(practiceTranslations.vi['practice.history.filterHint']).toContain('nguồn');
    expect(practiceTranslations.en['practice.history.filterHint'].toLowerCase()).toContain(
      'source',
    );
  });

  // Nút "Thử lại" của trang Báo cáo: nếu khuyết, ô báo lỗi hiện nút không chữ.
  it('nút thử lại của trang Báo cáo có chuỗi dịch ở CẢ vi lẫn en', () => {
    expect(practiceTranslations.vi['practice.reports.retry']).toBeTruthy();
    expect(practiceTranslations.en['practice.reports.retry']).toBeTruthy();
  });

  // F8 — nhãn bước #5 là "Báo cáo", trùng chữ với mục "Báo cáo" ở sidebar
  // (`profile.navReports`) và trang Báo cáo tổng kết lộ trình (`practice.reports.title`) — ba thứ
  // khác hẳn nhau. Tiêu đề BÊN TRONG bước lại ghi đúng ("Chọn báo cáo phỏng vấn"), nên chính
  // thanh tiến trình là chỗ nói sai.
  //
  // Khoá bằng QUAN HỆ (khác nhau, và là tiền tố của tiêu đề bước) chứ không khoá chuỗi cụ thể:
  // khoá chuỗi thì đổi câu chữ là test đỏ vô nghĩa, mà cái cần giữ là "đọc ra không lẫn".
  it('nhãn bước "báo cáo" của wizard không đụng nghĩa với mục Báo cáo khác trong app', () => {
    for (const lang of ['vi', 'en'] as const) {
      const stepLabel = practiceTranslations[lang]['practice.roadmapWizard.steps.reports'];
      expect(stepLabel).toBeTruthy();
      expect(stepLabel).not.toBe(practiceTranslations[lang]['practice.reports.title']);
      // …và phải khớp tiêu đề bên trong bước, để thanh tiến trình và nội dung nói cùng một thứ.
      const stepTitle = practiceTranslations[lang]['practice.roadmapWizard.reports.title'];
      expect(stepTitle.toLowerCase()).toContain(stepLabel.toLowerCase());
    }
  });

  // REC1 gỡ HẲN bước "trình độ hiện tại" khỏi wizard (mức nay suy từ các buổi luyện nguồn),
  // nên khoá `roadmapWizard.currentLevel.description` không còn tồn tại. Test F7-1 cũ canh câu
  // chữ của bước đó — tiền đề chết thật, không phải assert bị nới. Xoá thay vì làm nó luôn xanh.
});
