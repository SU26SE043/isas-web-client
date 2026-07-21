import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import type { LearningDashboardQuery, LearningRoadmapDetail } from '../types/learningPath.types';
import { roadmapService } from '../services/roadmap.service';

export const LEARNING_ROADMAPS_QUERY_KEY = ['learning', 'roadmaps'] as const;
export const LEARNING_ROADMAP_DETAIL_QUERY_KEY = ['learning', 'roadmap'] as const;
export const LEARNING_LESSON_QUERY_KEY = ['learning', 'lesson'] as const;

export function learningRoadmapsQueryKey(query: LearningDashboardQuery) {
  return [
    ...LEARNING_ROADMAPS_QUERY_KEY,
    query.search ?? '',
    query.domainId ?? 'all',
    query.status ?? 'all',
    query.sort ?? 'updated',
  ] as const;
}

export function learningRoadmapDetailQueryKey(roadmapId: string) {
  return [...LEARNING_ROADMAP_DETAIL_QUERY_KEY, roadmapId] as const;
}

export function learningLessonQueryKey(roadmapId: string, lessonId: string) {
  return [...LEARNING_LESSON_QUERY_KEY, roadmapId, lessonId] as const;
}

export function useLearningRoadmaps(query: LearningDashboardQuery) {
  const { t } = useLanguage();
  const toastedRef = useRef<string | null>(null);

  const result = useQuery({
    queryKey: learningRoadmapsQueryKey(query),
    queryFn: () => roadmapService.listRoadmaps(query),
  });

  useEffect(() => {
    if (!result.isError) {
      toastedRef.current = null;
      return;
    }
    const key = String(result.errorUpdatedAt);
    if (toastedRef.current === key) return;
    toastedRef.current = key;
    toast.error(t('practice.learningPath.errorToast'));
  }, [result.errorUpdatedAt, result.isError, t]);

  return result;
}

export function useLearningRoadmapDetail(roadmapId: string) {
  const { t } = useLanguage();
  const toastedRef = useRef<string | null>(null);

  const result = useQuery({
    queryKey: learningRoadmapDetailQueryKey(roadmapId),
    queryFn: () => roadmapService.getRoadmap(roadmapId),
    enabled: Boolean(roadmapId),
  });

  useEffect(() => {
    if (!result.isError) {
      toastedRef.current = null;
      return;
    }
    const status = roadmapService.getErrorStatus(result.error);
    const key = `${status ?? 'x'}-${result.errorUpdatedAt}`;
    if (toastedRef.current === key) return;
    toastedRef.current = key;
    if (status === 404) toast.error(t('practice.learningPath.errorNotFound'));
    else if (status === 403) toast.error(t('practice.learningPath.errorForbidden'));
    else toast.error(t('practice.learningPath.errorToast'));
  }, [result.error, result.errorUpdatedAt, result.isError, t]);

  return result;
}

/**
 * Fetches lesson content only when enabled (user opened the lesson route).
 * React Query dedupes Strict Mode double-mount via stable queryKey.
 */
export function useLearningLesson(roadmapId: string, lessonId: string, enabled = true) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const toastedRef = useRef<string | null>(null);

  const result = useQuery({
    queryKey: learningLessonQueryKey(roadmapId, lessonId),
    queryFn: () => roadmapService.getLesson(roadmapId, lessonId),
    enabled: Boolean(roadmapId && lessonId && enabled),
    staleTime: 60_000,
    retry: (failureCount, error) => {
      const status = roadmapService.getErrorStatus(error);
      if (status === 404 || status === 403) return false;
      if (status === 502) return failureCount < 1;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    const opened = result.data;
    if (!opened) return;
    queryClient.setQueryData<LearningRoadmapDetail>(
      learningRoadmapDetailQueryKey(roadmapId),
      (current) => {
        if (!current) return current;
        return roadmapService.patchRoadmapWithOpenedLesson(current, opened);
      },
    );
  }, [queryClient, result.data, roadmapId]);

  useEffect(() => {
    if (!result.isError) {
      toastedRef.current = null;
      return;
    }
    const status = roadmapService.getErrorStatus(result.error);
    const key = `${status ?? 'x'}-${result.errorUpdatedAt}`;
    if (toastedRef.current === key) return;
    toastedRef.current = key;
    if (status === 502) toast.error(t('practice.learningPath.lessonAiErrorToast'));
    else if (status === 404) toast.error(t('practice.learningPath.errorNotFound'));
    else if (status === 403) toast.error(t('practice.learningPath.errorForbidden'));
    else toast.error(t('practice.learningPath.errorToast'));
  }, [result.error, result.errorUpdatedAt, result.isError, t]);

  return result;
}

export function invalidateLearningRoadmaps(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: LEARNING_ROADMAPS_QUERY_KEY });
}
