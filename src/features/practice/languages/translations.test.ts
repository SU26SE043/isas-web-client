import { describe, expect, it } from 'vitest';
import { practiceTranslations } from './translations';

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
});
