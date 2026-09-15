import { describe, expect, it } from 'vitest';
import { practiceTranslations } from './translations';

/**
 * D1 — ghi nhận mất tập trung ở B2C là COACHING cho chính người luyện, không phải chống gian lận.
 * Một chữ "vi phạm"/"cảnh báo" lọt vào là đổi ý nghĩa cả tính năng với người đọc; TypeScript
 * không bắt được chuyện chữ nghĩa nên khoá bằng test quét.
 */
const BANNED: Record<'vi' | 'en', string[]> = {
  vi: ['vi phạm', 'gian lận', 'cảnh báo', 'phát hiện', 'giám sát', 'chống'],
  en: ['violation', 'cheat', 'warning', 'detect', 'monitor', 'proctor'],
};

describe('practiceTranslations — chuỗi focusTracking không mang ngôn ngữ chống gian lận', () => {
  for (const lang of ['vi', 'en'] as const) {
    it(`${lang}: mọi khoá *.focusTracking.* sạch từ cấm`, () => {
      const entries = Object.entries(practiceTranslations[lang]).filter(([key]) => key.includes('focusTracking'));
      expect(entries.length).toBeGreaterThan(0);
      const hits = entries
        .filter(([, value]) => BANNED[lang].some((word) => value.toLowerCase().includes(word)))
        .map(([key, value]) => `${key}: ${value}`);
      expect(hits).toEqual([]);
    });
  }
});
