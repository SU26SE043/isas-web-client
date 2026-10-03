import { describe, expect, it } from 'vitest';
import { employerCampaignTranslations } from './translations';

const PREFIX = 'employer.campaigns.rubricPreview.';
// Lượt chấm thử CŨ (trước 2026-10-03) chỉ có 3 bài AI — hai nhãn này cố ý nói ra để người dùng hiểu vì sao lượt đó
// không có bài của họ. Ngoài hai nhãn này, copy chấm thử không được tả lại luồng 3 bài AI đã bỏ.
const LEGACY_NOTICES = new Set([`${PREFIX}result.legacyAiOnly`, `${PREFIX}history.legacy`]);
const AI_SAMPLE_FLOW = {
  vi: /bài mẫu|3 bài|bài (Yếu|Khá|Xuất sắc)|AI viết|3 mức/,
  en: /sample|\bthree\b|\b(Weak|Excellent)\b/i,
} as const;

describe('copy chấm thử — chỉ còn chấm câu trả lời người dùng', () => {
  for (const lang of ['vi', 'en'] as const) {
    const dict = employerCampaignTranslations[lang];

    it(`${lang}: không khoá rubricPreview.* nào còn tả 3 bài AI, trừ nhãn lượt cũ`, () => {
      const offending = Object.entries(dict)
        .filter(([key, value]) => key.startsWith(PREFIX) && !LEGACY_NOTICES.has(key) && AI_SAMPLE_FLOW[lang].test(value))
        .map(([key]) => key);
      expect(offending).toEqual([]);
    });

    it(`${lang}: nút đang chạy không hứa "~1 phút" — chấm một bài đo thật ~7 giây`, () => {
      expect(dict[`${PREFIX}running`]).toBeTruthy();
      expect(dict[`${PREFIX}running`]).not.toMatch(lang === 'vi' ? /phút/ : /minute/);
    });
  }
});
