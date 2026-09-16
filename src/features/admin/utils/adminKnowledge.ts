import axios from 'axios';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';

export const KNOWLEDGE_CATEGORIES = ['BA', 'BE', 'FE'] as const;
export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];

/** Interview serialize enum thành CHUỖI (khác Payment) — `KnowledgeSourceType` Context7|Url|Manual, `KnowledgeStatus` Active|Archived. */
export function sourceTypeKey(type: string): string {
  switch (type) {
    case 'Context7': return 'admin.knowledge.type.context7';
    case 'Url': return 'admin.knowledge.type.url';
    case 'Manual': return 'admin.knowledge.type.manual';
    default: return 'admin.money.unknown';
  }
}
export function knowledgeStatusKey(status: string): string {
  return status === 'Active' ? 'admin.knowledge.status.active' : status === 'Archived' ? 'admin.knowledge.status.archived' : 'admin.money.unknown';
}

/**
 * Lỗi nạp nguồn có ba nguồn khác hẳn nhau và admin cần biết cái nào: 400 = dữ liệu mình nhập (BE trả
 * `{ error }` nêu rõ) · 429 = Context7 giới hạn (kèm `Retry-After` giây) · 502 = Context7/AIService không
 * trả lời (không phải lỗi của admin, thử lại sau). Còn lại rơi về câu chung.
 */
export function knowledgeErrorMessage(error: unknown, t: (key: string) => string): string {
  const status = getApiStatusCode(error);
  if (status === 429) {
    const retryAfter = axios.isAxiosError(error) ? error.response?.headers?.['retry-after'] : undefined;
    return t('admin.knowledge.error.rateLimited').replace('{seconds}', retryAfter ? String(retryAfter) : '?');
  }
  if (status === 502) return t('admin.knowledge.error.upstream');
  if (status === 400) return getApiErrorMessage(error, t('admin.knowledge.error.invalid'));
  if (status === 404) return t('admin.knowledge.error.notFound');
  return getApiErrorMessage(error, t('admin.knowledge.error.default'));
}

/** Ô chủ đề Context7: mỗi dòng (hoặc dấu phẩy) một topic, bỏ trống/trùng. */
export function parseTopics(raw: string): string[] {
  return [...new Set(raw.split(/[\n,]/).map((topic) => topic.trim()).filter(Boolean))];
}
