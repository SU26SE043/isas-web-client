import { apiClient } from '@/shared/api/apiClient';
import type { RubricLevel } from '@/features/rubrics/types/rubric.types';

export type CampaignCriteriaPreviewCriterion = {
  id: string;
  name: string;
  weight: number;
  levelCount: number;
  levels: RubricLevel[];
};

export type CampaignCriteriaPreview = {
  jobCategory: string;
  language: 'vi' | 'en';
  criteria: CampaignCriteriaPreviewCriterion[];
};

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function number(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function parseCampaignCriteriaPreview(data: unknown): CampaignCriteriaPreview {
  const root = record(data);
  const payload = record(root?.data) ?? root ?? {};
  const rawCriteria = Array.isArray(payload.criteria) ? payload.criteria : [];
  return {
    jobCategory: text(payload.jobCategory ?? payload.JobCategory),
    language: text(payload.language ?? payload.Language, 'vi') === 'en' ? 'en' : 'vi',
    criteria: rawCriteria.flatMap((item, index) => {
      const row = record(item);
      if (!row) return [];
      const rawLevels = Array.isArray(row.levels) ? row.levels : [];
      const levels = rawLevels.flatMap((level) => {
        const parsed = record(level);
        const descriptor = text(parsed?.descriptor ?? parsed?.Descriptor);
        return descriptor ? [{ score: number(parsed?.score ?? parsed?.Score), descriptor }] : [];
      });
      return [{
        id: text(row.id ?? row.Id, `system-${index + 1}`),
        name: text(row.name ?? row.Name),
        weight: number(row.weight ?? row.Weight),
        levelCount: number(row.levelCount ?? row.LevelCount, levels.length),
        levels,
      }];
    }),
  };
}

export const campaignCriteriaService = {
  async preview(jobCategory: string, language: 'vi' | 'en') {
    const response = await apiClient.get<unknown>(
      '/api/v1/campaign/criteria/system-default/preview',
      { params: { jobCategory, language } },
    );
    return parseCampaignCriteriaPreview(response.data);
  },

  async applyToCampaign(campaignId: string, jobCategory: string, language: 'vi' | 'en') {
    const response = await apiClient.post<unknown>(
      `/api/v1/campaign/${encodeURIComponent(campaignId)}/criteria/from-system-default`,
      { jobCategory, language },
    );
    return parseCampaignCriteriaPreview(response.data);
  },
};
