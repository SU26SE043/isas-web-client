import { apiClient } from '@/shared/api/apiClient';
import type {
  AdminRubricJobCategory,
  AdminRubricLanguage,
  AdminRubricPreviewRequest,
  AdminRubricUpsertInput,
} from '../types/adminApi.types';
import {
  parseAdminRubricHistory,
  parseAdminRubricMatrix,
  parseAdminPreviewTranscribe,
  parseAdminRubricPreviewHistory,
  parseAdminRubricPreviewRun,
  parseAdminRubricSet,
  parseAdminSuggestLevels,
} from '../utils/adminRubricApi';
import { adminApiEndpoints } from './adminApi.endpoints';

/**
 * Hợp đồng: `AdminRubricController` (InterviewService) — mọi endpoint nhận `?language=vi|en`,
 * `jobCategory` là enum chuỗi `FE|BE|BA` (gửi nhãn "Frontend" là 400 ở mọi lượt tải, đo trên dev).
 * Mọi phản hồi đi qua parser: hợp đồng lệch phải nổ ở đây, không phải im lặng thành ô trống.
 */
const params = (language: AdminRubricLanguage, seniority?: string) => ({ language, ...(seniority?.trim() ? { seniority: seniority.trim() } : {}) });

export const adminRubricService = {
  /** KHÔNG truyền `language`: BE trả cả 6 ô (3 nghề × vi/en); truyền thì chỉ 3 ô của ngôn ngữ đó (đo trên dev: 3 ô English "Chưa tải được"). */
  list: async () =>
    parseAdminRubricMatrix((await apiClient.get(adminApiEndpoints.rubricMatrix)).data),
  get: async (category: AdminRubricJobCategory, language: AdminRubricLanguage) =>
    parseAdminRubricSet((await apiClient.get(adminApiEndpoints.rubric(category), { params: { language } })).data),
  history: async (category: AdminRubricJobCategory, language: AdminRubricLanguage) =>
    parseAdminRubricHistory((await apiClient.get(adminApiEndpoints.rubricHistory(category), { params: { language } })).data),
  update: async (category: AdminRubricJobCategory, language: AdminRubricLanguage, input: AdminRubricUpsertInput) =>
    parseAdminRubricSet((await apiClient.put(adminApiEndpoints.rubric(category), input, { params: { language } })).data),
  /** BE trả bản mới (append version về nội dung gốc), không phải 204. */
  reset: async (category: AdminRubricJobCategory, language: AdminRubricLanguage) =>
    parseAdminRubricSet((await apiClient.delete(adminApiEndpoints.rubric(category), { params: { language } })).data),
  suggest: async (category: AdminRubricJobCategory, language: AdminRubricLanguage, seniority?: string) =>
    parseAdminSuggestLevels((await apiClient.post(adminApiEndpoints.rubricSuggestLevels(category), undefined, { params: params(language, seniority) })).data),
  preview: async (category: AdminRubricJobCategory, language: AdminRubricLanguage, input: AdminRubricPreviewRequest) =>
    parseAdminRubricPreviewRun((await apiClient.post(adminApiEndpoints.rubricPreview(category), input, { params: { language } })).data),
  /** Chép lời bản ghi của chính người dùng — không tốn lượt, không lưu; timeout dài vì Whisper dự phòng chậm. */
  transcribeForPreview: async (category: AdminRubricJobCategory, language: AdminRubricLanguage, file: Blob, fileName: string) => {
    const form = new FormData();
    form.append('file', file, fileName);
    return parseAdminPreviewTranscribe((await apiClient.post(adminApiEndpoints.rubricPreviewTranscribe(category), form, { params: { language }, timeout: 130_000, headers: { 'Content-Type': 'multipart/form-data' } })).data);
  },
  previewHistory: async (category: AdminRubricJobCategory, language: AdminRubricLanguage) =>
    parseAdminRubricPreviewHistory((await apiClient.get(adminApiEndpoints.rubricPreview(category), { params: { language } })).data),
};
