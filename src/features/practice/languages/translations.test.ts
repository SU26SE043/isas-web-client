import { describe, expect, it } from 'vitest';
import { practiceTranslations } from './translations';
import { ROADMAP_WIZARD_STEP_LABEL_KEYS } from '../components/roadmap-wizard/RoadmapWizardShell';

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
});
