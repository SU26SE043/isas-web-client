import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { LessonHtmlContent } from '../components/learning-path/LessonHtmlContent';
import { LearningTheoryActions } from '../components/learning-path/LearningTheoryActions';
import { useLearningWorkspaceOptional } from '../context/LearningWorkspaceContext';
import { learningPathService } from '../services/learningPath.service';
import type { LearningLesson, LearningRoadmapDetail } from '../types/learningPath.types';

export function LearningTheoryPage() {
  const { roadmapId = '', lessonId = '' } = useParams();
  const { language, t } = useLanguage();
  const workspace = useLearningWorkspaceOptional();
  const [localRoadmap, setLocalRoadmap] = useState<LearningRoadmapDetail | null>(null);
  const [isLoading, setIsLoading] = useState(!workspace);
  const [error, setError] = useState(false);

  const roadmap = workspace?.roadmap ?? localRoadmap;

  useEffect(() => {
    if (workspace) return;
    let active = true;
    setIsLoading(true);
    void learningPathService
      .getRoadmap(roadmapId)
      .then((data) => {
        if (!active) return;
        setLocalRoadmap(data);
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
  }, [roadmapId, workspace]);

  const lesson: LearningLesson | null =
    roadmap?.milestones.flatMap((item) => item.lessons).find((item) => item.id === lessonId) ?? null;

  const markComplete = async () => {
    await learningPathService.markTheoryCompleted(roadmapId, lessonId);
  };

  const onMarkedComplete = async () => {
    if (workspace) {
      await workspace.reload();
      return;
    }
    const data = await learningPathService.getRoadmap(roadmapId);
    setLocalRoadmap(data);
  };

  if ((workspace?.isLoading ?? isLoading) && !roadmap) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('practice.learningPath.loading')}</span>
      </div>
    );
  }

  if (workspace?.error || error || !lesson || !roadmap) {
    return <p className="page-container page-section text-sm text-error">{t('practice.learningPath.error')}</p>;
  }

  const title = language === 'vi' ? lesson.titleVi : lesson.title;
  const html = language === 'vi' ? lesson.contentVi : lesson.content;

  return (
    <div className="min-h-full overflow-y-auto bg-surface-base">
      <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <header className="space-y-2 border-b border-subtle pb-6">
          <p className="text-caption text-muted-foreground">{t('practice.learningPath.theory')}</p>
          <h1 className="heading-primary text-3xl text-foreground sm:text-4xl">{title}</h1>
        </header>

        <article className="frame-satin mt-8 rounded-2xl border border-subtle bg-surface-raised p-6 sm:p-8 lg:p-10">
          <LessonHtmlContent html={html} />
        </article>

        <LearningTheoryActions
          roadmap={roadmap}
          lesson={lesson}
          markComplete={markComplete}
          onMarkedComplete={onMarkedComplete}
        />
      </div>
    </div>
  );
}
