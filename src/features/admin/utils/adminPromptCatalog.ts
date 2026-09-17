/**
 * Bản đồ khoá prompt (F21, `PromptTemplateKeys.cs`) → nhãn người đọc + loại khe + rủi ro.
 *
 * Tạm đặt ở FE cho tới khi BE trả metadata (đợt B). Hai điều cố ý:
 * - `DEAD_PROMPT_KEYS`: 5 khoá .NET khai nhưng KHÔNG builder Python nào đọc (`prompts.py` 0 hit;
 *   `test_prompt_registry_f21.py` ghi "5 key chết cũ"). Hiện chúng ra là để admin sửa một thứ không có
 *   tác dụng rồi thấy badge "Đã tuỳ chỉnh" — UI nói dối. Ẩn cho tới khi được nối hoặc gỡ ở BE.
 * - Khe CHẤM (`scoring.*`, `seniority.*.scoring_focus`) đổi là đổi ĐIỂM; khe SINH sai chỉ ra câu hỏi
 *   dở, không mất credit. Hai mức hậu quả khác hẳn nên phải gắn nhãn khác nhau.
 */
export const DEAD_PROMPT_KEYS: ReadonlySet<string> = new Set([
  'criteria.guidance',
  'roadmap.guidance',
  'lesson_theory.guidance',
  'summarize_session.guidance',
  'decide_next.guidance',
]);

export type PromptKind = 'replace' | 'append';
export type PromptRisk = 'scoring' | 'generation';
export type PromptGroup = 'questions' | 'scoring' | 'cv' | 'seniority' | 'category' | 'other';

export interface PromptKeyInfo {
  group: PromptGroup;
  /** Khoá i18n của nhãn; `params` thế vào `{level}`/`{category}`. */
  labelKey: string;
  params: Record<string, string>;
  kind: PromptKind;
  risk: PromptRisk;
}

const FIXED: Record<string, Omit<PromptKeyInfo, 'params'>> = {
  'scoring.persona': { group: 'scoring', labelKey: 'admin.prompts.key.scoring.persona', kind: 'replace', risk: 'scoring' },
  'scoring.extra_guidance': { group: 'scoring', labelKey: 'admin.prompts.key.scoring.extra_guidance', kind: 'append', risk: 'scoring' },
  'questions.intro': { group: 'questions', labelKey: 'admin.prompts.key.questions.intro', kind: 'replace', risk: 'generation' },
  'questions.guidance': { group: 'questions', labelKey: 'admin.prompts.key.questions.guidance', kind: 'append', risk: 'generation' },
  'criterion_levels.guidance': { group: 'questions', labelKey: 'admin.prompts.key.criterion_levels.guidance', kind: 'append', risk: 'generation' },
  'cv_analysis.guidance': { group: 'cv', labelKey: 'admin.prompts.key.cv_analysis.guidance', kind: 'append', risk: 'generation' },
  'cv_requirements.workflow': { group: 'cv', labelKey: 'admin.prompts.key.cv_requirements.workflow', kind: 'replace', risk: 'generation' },
  'cv_requirements.level_rubric': { group: 'cv', labelKey: 'admin.prompts.key.cv_requirements.level_rubric', kind: 'replace', risk: 'generation' },
  'jd_requirements.guidance': { group: 'cv', labelKey: 'admin.prompts.key.jd_requirements.guidance', kind: 'append', risk: 'generation' },
};

const SENIORITY = /^seniority\.([A-Za-z]+)\.(profile|scoring_focus)$/;
const CATEGORY = /^category\.([A-Za-z]+)\.(display_name|description|guidance)$/;
const KNOWLEDGE = /^category\.([A-Za-z]+)\.seniority\.([A-Za-z]+)\.knowledge$/;

export function describePromptKey(key: string): PromptKeyInfo {
  const fixed = FIXED[key];
  if (fixed) return { ...fixed, params: {} };
  const seniority = SENIORITY.exec(key);
  if (seniority) {
    const [, level, part] = seniority;
    return part === 'profile'
      ? { group: 'seniority', labelKey: 'admin.prompts.key.seniority.profile', params: { level }, kind: 'replace', risk: 'generation' }
      : { group: 'seniority', labelKey: 'admin.prompts.key.seniority.scoring_focus', params: { level }, kind: 'append', risk: 'scoring' };
  }
  const knowledge = KNOWLEDGE.exec(key);
  if (knowledge) {
    const [, category, level] = knowledge;
    return { group: 'category', labelKey: 'admin.prompts.key.category.knowledge', params: { category, level }, kind: 'replace', risk: 'generation' };
  }
  const category = CATEGORY.exec(key);
  if (category) {
    const [, cat, part] = category;
    return { group: 'category', labelKey: `admin.prompts.key.category.${part}`, params: { category: cat }, kind: part === 'guidance' ? 'append' : 'replace', risk: 'generation' };
  }
  return { group: 'other', labelKey: 'admin.prompts.key.unknown', params: {}, kind: 'append', risk: 'generation' };
}

export const PROMPT_GROUP_ORDER: PromptGroup[] = ['questions', 'scoring', 'cv', 'seniority', 'category', 'other'];

/** Điền `{level}`/`{category}` vào nhãn đã dịch. */
export function formatPromptLabel(t: (key: string) => string, info: PromptKeyInfo): string {
  return Object.entries(info.params).reduce((label, [name, value]) => label.replace(`{${name}}`, value), t(info.labelKey));
}
