import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { learningPathService } from '../services/learningPath.service';
import type { LearningRoadmapDetail } from '../types/learningPath.types';

interface LearningWorkspaceValue {
  roadmap: LearningRoadmapDetail | null;
  isLoading: boolean;
  error: boolean;
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
  const [roadmap, setRoadmap] = useState<LearningRoadmapDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    const data = await learningPathService.getRoadmap(roadmapId);
    setRoadmap(data);
    setError(false);
  }, [roadmapId]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void learningPathService
      .getRoadmap(roadmapId)
      .then((data) => {
        if (!active) return;
        setRoadmap(data);
        setError(false);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [roadmapId]);

  const value = useMemo(
    () => ({ roadmap, isLoading, error, reload }),
    [error, isLoading, reload, roadmap],
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
