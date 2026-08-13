import { apiClient } from '@/shared/api/apiClient';
import { readNextCursorHeader } from '../utils/adminCampaignsApi';
import type { AdminApiPage, Context7Library, CreateKnowledgeInput, IngestContext7Input, InterviewAdminAnalytics, KnowledgeSource, PromptTemplate, UpdatePromptInput } from '../types/adminApi.types';
import { adminApiEndpoints } from './adminApi.endpoints';

const list = <T>(data: unknown): T[] => Array.isArray(data) ? data as T[] : ((data as { data?: T[]; items?: T[] } | null)?.data ?? (data as { items?: T[] } | null)?.items ?? []);
const analyticsParams = (params: { from?: string; to?: string; groupBy?: 'day' | 'month' }) => ({ ...(params.from?.trim() ? { from: params.from.trim() } : {}), ...(params.to?.trim() ? { to: params.to.trim() } : {}), ...(params.groupBy ? { groupBy: params.groupBy } : {}) });

export const adminInterviewService = {
  getAnalytics: async (params: { from?: string; to?: string; groupBy?: 'day' | 'month' } = {}) => (await apiClient.get<InterviewAdminAnalytics>(adminApiEndpoints.interviewAnalytics, { params: analyticsParams(params) })).data,
  listPrompts: async () => list<PromptTemplate>((await apiClient.get(adminApiEndpoints.prompts)).data),
  getPromptHistory: async (key: string) => list<PromptTemplate>((await apiClient.get(adminApiEndpoints.promptHistory(key))).data),
  updatePrompt: async (key: string, input: UpdatePromptInput) => (await apiClient.put<PromptTemplate>(adminApiEndpoints.prompt(key), input)).data,
  resetPrompt: async (key: string) => { await apiClient.delete(adminApiEndpoints.prompt(key)); },
  listKnowledge: async (params: { jobCategory?: string; cursor?: string; limit?: number } = {}): Promise<AdminApiPage<KnowledgeSource>> => { const response = await apiClient.get(adminApiEndpoints.knowledge, { params }); return { items: list<KnowledgeSource>(response.data), nextCursor: readNextCursorHeader(response.headers) }; },
  createKnowledge: async (input: CreateKnowledgeInput) => (await apiClient.post<KnowledgeSource>(adminApiEndpoints.knowledge, input)).data,
  deleteKnowledge: async (id: string) => { await apiClient.delete(adminApiEndpoints.knowledgeItem(id)); },
  reindexKnowledge: async (id: string) => (await apiClient.post<KnowledgeSource>(adminApiEndpoints.knowledgeReindex(id))).data,
  searchContext7: async (libraryName: string, query?: string) => (await apiClient.get<Context7Library[]>(adminApiEndpoints.context7Search, { params: { libraryName, ...(query?.trim() ? { query: query.trim() } : {}) } })).data,
  ingestContext7: async (input: IngestContext7Input) => (await apiClient.post<KnowledgeSource[]>(adminApiEndpoints.context7Ingest, input)).data,
};
