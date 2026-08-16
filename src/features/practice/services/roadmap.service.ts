import { apiClient } from '@/shared/api/apiClient';
import { getApiStatusCode } from '@/shared/api/apiError';
import type { LearningDashboardQuery, LearningRoadmapCard, LearningRoadmapDetail } from '../types/learningPath.types';
import {
  applyOpenedLessonToRoadmap,
  mapApiRoadmapDetail,
  mapApiRoadmapLessonDetail,
  mapApiRoadmapListItem,
  type OpenedLearningLesson,
} from '../utils/roadmapMapper';
import { learningEndpoints } from './learning.endpoints';

function unwrapDataPayload(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  const record = data as Record<string, unknown>;
  if ('data' in record && record.data != null && typeof record.data === 'object') {
    const inner = record.data as Record<string, unknown>;
    if ('id' in inner || 'milestones' in inner || 'theoryContent' in inner || 'status' in inner) {
      return inner;
    }
  }
  return data;
}

function unwrapListPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.roadmaps)) return record.roadmaps;
    if (Array.isArray(record.data)) return record.data;
    const nested = unwrapDataPayload(data);
    if (Array.isArray(nested)) return nested;
  }
  return [];
}

function filterAndSortCards(
  items: LearningRoadmapCard[],
  query: LearningDashboardQuery,
): LearningRoadmapCard[] {
  let next = items;
  const search = query.search?.trim().toLowerCase();
  if (search) {
    next = next.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.nameVi.toLowerCase().includes(search) ||
        item.domainLabel.toLowerCase().includes(search),
    );
  }
  if (query.domainId && query.domainId !== 'all') {
    next = next.filter((item) => item.domainId === query.domainId);
  }
  if (query.status && query.status !== 'all') {
    next = next.filter((item) => item.status === query.status);
  }
  if (query.sort === 'progress') {
    return next.slice().sort((a, b) => b.progressPercent - a.progressPercent);
  }
  return next.slice().sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

/**
 * The list endpoint's DTO doesn't carry `milestones`, so its flat
 * currentMilestoneTitle/currentLessonTitle/progressPercent fields are taken
 * as-is (see mapApiRoadmapListItem) — the backend does not always populate
 * them there even though the same roadmap's detail endpoint derives correct
 * values from its milestones array. Backfill any card missing these from
 * the detail endpoint so the dashboard doesn't show stale "—"/0% cards for
 * roadmaps that actually have progress.
 */
async function enrichCardsMissingCurrentPointers(
  cards: LearningRoadmapCard[],
): Promise<LearningRoadmapCard[]> {
  const incomplete = cards.filter(
    (card) => !card.currentMilestoneTitle || !card.currentLessonTitle,
  );
  if (incomplete.length === 0) return cards;

  const detailsById = new Map<string, LearningRoadmapDetail>();
  await Promise.all(
    incomplete.map(async (card) => {
      try {
        detailsById.set(card.id, await roadmapService.getRoadmap(card.id));
      } catch {
        // Leave this card as the list endpoint returned it; one roadmap's
        // detail failing shouldn't break the rest of the dashboard.
      }
    }),
  );
  if (detailsById.size === 0) return cards;

  return cards.map((card) => {
    const detail = detailsById.get(card.id);
    if (!detail) return card;
    return {
      ...card,
      progressPercent: card.progressPercent > 0 ? card.progressPercent : detail.progressPercent,
      currentMilestoneId: card.currentMilestoneId || detail.currentMilestoneId,
      currentMilestoneTitle: card.currentMilestoneTitle || detail.currentMilestoneTitle,
      currentMilestoneTitleVi: card.currentMilestoneTitleVi || detail.currentMilestoneTitleVi,
      currentLessonId: card.currentLessonId || detail.currentLessonId,
      currentLessonTitle: card.currentLessonTitle || detail.currentLessonTitle,
      currentLessonTitleVi: card.currentLessonTitleVi || detail.currentLessonTitleVi,
    };
  });
}

export const roadmapService = {
  async listRoadmapsPage(query: LearningDashboardQuery = {}): Promise<{
    items: LearningRoadmapCard[];
    nextCursor?: string;
  }> {
    const response = await apiClient.get<unknown>(learningEndpoints.roadmaps, {
      params: {
        ...(query.cursor ? { cursor: query.cursor } : {}),
        ...(query.limit ? { limit: query.limit } : {}),
      },
    });
    const headers = response.headers as Record<string, unknown> & { get?: (name: string) => unknown };
    const rawCursor = typeof headers.get === 'function'
      ? headers.get('x-next-cursor') ?? headers.get('X-Next-Cursor')
      : headers['x-next-cursor'] ?? headers['X-Next-Cursor'];
    const nextCursor = String(Array.isArray(rawCursor) ? rawCursor[0] ?? '' : rawCursor ?? '').trim();
    return {
      items: unwrapListPayload(response.data).map(mapApiRoadmapListItem).filter((item) => item.id),
      nextCursor: nextCursor || undefined,
    };
  },

  async listRoadmaps(query: LearningDashboardQuery = {}): Promise<LearningRoadmapCard[]> {
    const page = await this.listRoadmapsPage(query);
    const cards = await enrichCardsMissingCurrentPointers(page.items);
    return filterAndSortCards(cards, query);
  },

  async getRoadmap(roadmapId: string): Promise<LearningRoadmapDetail> {
    const response = await apiClient.get<unknown>(learningEndpoints.roadmap(roadmapId));
    return mapApiRoadmapDetail(unwrapDataPayload(response.data));
  },

  /**
   * Open a lesson. Call only on explicit user navigation to the lesson page —
   * not on list/detail hover or render.
   */
  async getLesson(roadmapId: string, lessonId: string): Promise<OpenedLearningLesson> {
    const response = await apiClient.get<unknown>(learningEndpoints.lesson(roadmapId, lessonId));
    return mapApiRoadmapLessonDetail(unwrapDataPayload(response.data));
  },

  patchRoadmapWithOpenedLesson(
    roadmap: LearningRoadmapDetail,
    opened: OpenedLearningLesson,
  ): LearningRoadmapDetail {
    return applyOpenedLessonToRoadmap(roadmap, opened);
  },

  getErrorStatus(error: unknown): number | undefined {
    return getApiStatusCode(error);
  },
};
