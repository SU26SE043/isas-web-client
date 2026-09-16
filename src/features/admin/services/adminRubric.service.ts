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
  list: async (language: AdminRubricLanguage) =>
    parseAdminRubricMatrix((await apiClient.get(adminApiEndpoints.rubricMatrix, { params: { language } })).data),
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
  previewHistory: async (category: AdminRubricJobCategory, language: AdminRubricLanguage) =>
    parseAdminRubricPreviewHistory((await apiClient.get(adminApiEndpoints.rubricPreview(category), { params: { language } })).data),
};
