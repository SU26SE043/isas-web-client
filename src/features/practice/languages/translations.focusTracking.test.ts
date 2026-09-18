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

describe('practiceTranslations — câu opt-in phải nói THẬT về webcam (đếm mặt 2026-09-17)', () => {
  // Bản trước nhánh đếm mặt ghi "không dùng camera hay micro cho việc này" — từ khi có face-check,
  // câu đó thành lời nói dối về dữ liệu sinh trắc học ngay trước lúc người dùng bấm bật. Khoá cả
  // hai chiều: PHẢI nhắc webcam + ảnh xoá ngay, KHÔNG được khẳng định "không dùng camera".
  const CASES = {
    vi: { must: ['webcam', 'xoá ngay'], mustNot: ['không dùng camera', 'không dùng webcam'] },
    en: { must: ['webcam', 'deleted right after'], mustNot: ['no camera', 'no webcam'] },
  } as const;
  for (const lang of ['vi', 'en'] as const) {
    it(`${lang}: practice.setup.focusTracking.description nhắc webcam + xoá ảnh, không phủ nhận camera`, () => {
      const text = practiceTranslations[lang]['practice.setup.focusTracking.description'].toLowerCase();
      for (const word of CASES[lang].must) expect(text).toContain(word);
      for (const word of CASES[lang].mustNot) expect(text).not.toContain(word);
    });
  }
});
