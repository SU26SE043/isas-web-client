import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  learningRoadmapDetailQueryKey,
  useLearningRoadmapDetail,
} from '../hooks/useLearningRoadmaps';
import { roadmapService } from '../services/roadmap.service';
import type { LearningRoadmapDetail } from '../types/learningPath.types';

interface LearningWorkspaceValue {
  roadmap: LearningRoadmapDetail | null;
  isLoading: boolean;
  error: boolean;
  errorStatus?: number;
  reload: () => Promise<void>;
}

const LearningWorkspaceContext = createContext<LearningWorkspaceValue | null>(null);

export function LearningWorkspaceProvider({
  roadmapId,
  children,
}: {
  roadmapId: string;
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const detailQuery = useLearningRoadmapDetail(roadmapId);

  const reload = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: learningRoadmapDetailQueryKey(roadmapId) });
  }, [queryClient, roadmapId]);

  const value = useMemo(
    () => ({
      roadmap: detailQuery.data ?? null,
      isLoading: detailQuery.isLoading,
      error: detailQuery.isError,
      errorStatus: detailQuery.isError
        ? roadmapService.getErrorStatus(detailQuery.error)
        : undefined,
      reload,
    }),
    [
      detailQuery.data,
      detailQuery.error,
      detailQuery.isError,
      detailQuery.isLoading,
      reload,
    ],
  );

  return (
    <LearningWorkspaceContext.Provider value={value}>
      {children}
    </LearningWorkspaceContext.Provider>
  );
}

export function useLearningWorkspace() {
  const ctx = useContext(LearningWorkspaceContext);
  if (!ctx) {
    throw new Error('useLearningWorkspace must be used within LearningWorkspaceProvider');
  }
  return ctx;
}

/** Optional access when page may render outside reader layout. */
export function useLearningWorkspaceOptional() {
  return useContext(LearningWorkspaceContext);
}
