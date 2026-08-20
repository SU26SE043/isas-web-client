import { apiClient } from '@/shared/api/apiClient';
import type { RubricPreviewInput, RubricSet } from '../types/adminApi.types';
import { adminApiEndpoints } from './adminApi.endpoints';

const unwrap = <T>(data: unknown): T => {
  if (data && typeof data === 'object' && 'data' in data) return (data as { data: T }).data;
  return data as T;
};

const params = (language: 'vi' | 'en', seniority?: string) => ({ language, ...(seniority ? { seniority } : {}) });

export const adminRubricService = {
  list: async (language: 'vi' | 'en') => unwrap<RubricSet[]>((await apiClient.get(adminApiEndpoints.rubricMatrix, { params: { language } })).data),
  get: async (category: string, language: 'vi' | 'en') => unwrap<RubricSet>((await apiClient.get(adminApiEndpoints.rubric(category), { params: { language } })).data),
  history: async (category: string, language: 'vi' | 'en') => unwrap<RubricSet[]>((await apiClient.get(adminApiEndpoints.rubricHistory(category), { params: { language } })).data),
  update: async (category: string, language: 'vi' | 'en', input: RubricSet) => unwrap<RubricSet>((await apiClient.put(adminApiEndpoints.rubric(category), input, { params: { language } })).data),
  reset: async (category: string, language: 'vi' | 'en') => { await apiClient.delete(adminApiEndpoints.rubric(category), { params: { language } }); },
  suggest: async (category: string, language: 'vi' | 'en', seniority?: string) => unwrap<RubricSet>((await apiClient.post(adminApiEndpoints.rubricSuggestLevels(category), undefined, { params: params(language, seniority) })).data),
  preview: async (category: string, language: 'vi' | 'en', input: RubricPreviewInput) => unwrap<unknown>((await apiClient.post(adminApiEndpoints.rubricPreview(category), input, { params: { language } })).data),
};
