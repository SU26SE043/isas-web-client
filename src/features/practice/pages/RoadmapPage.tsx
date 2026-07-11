import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { RoadmapTimeline } from '../components/learning/RoadmapTimeline';
import { learningService } from '../services/learning.service';
import type { RoadmapResponse } from '../types/learning.types';

export const RoadmapPage: React.FC = () => {
  const { t } = useLanguage();
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoadmap = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await learningService.getRoadmap();
      setRoadmap(data);
    } catch {
      setError(t('practice.roadmap.error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRoadmap();
  }, []);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError(null);
    try {
      const data = await learningService.regenerateRoadmap();
      setRoadmap(data);
    } catch (err) {
      if (err instanceof Error && err.message === 'ROADMAP_REGEN_LIMIT') {
        setError(t('practice.roadmap.regenLimit'));
      } else {
        setError(t('practice.roadmap.error'));
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-4xl space-y-6">
        <header className="space-y-2">
          <h1 className="heading-primary text-3xl text-foreground">{t('practice.roadmap.title')}</h1>
          <p className="body-text text-sm text-muted-foreground">{t('practice.roadmap.pageSubtitle')}</p>
        </header>

        {error ? <p className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">{error}</p> : null}

        {roadmap ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {t('practice.roadmap.regenCount')
                  .replace('{used}', String(roadmap.regenerateCount))
                  .replace('{limit}', String(roadmap.regenerateLimit))}
              </p>
              <button
                type="button"
                onClick={() => void handleRegenerate()}
                disabled={isRegenerating || roadmap.regenerateCount >= roadmap.regenerateLimit}
                className="btn-secondary"
              >
                {isRegenerating ? t('practice.roadmap.regenerating') : t('practice.roadmap.regenerate')}
              </button>
            </div>
            <RoadmapTimeline steps={roadmap.steps} />
            <Link to="/candidate/learning" className="btn-primary inline-flex">
              {t('practice.roadmap.goToLearning')}
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
};
