import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { LessonHtmlContent } from '../components/learning-path/LessonHtmlContent';
import { learningPathService } from '../services/learningPath.service';
import type { LearningLesson, LearningRoadmapDetail } from '../types/learningPath.types';

export function LearningTheoryPage() {
  const { roadmapId = '', lessonId = '' } = useParams();
  const { language, t } = useLanguage();
  const [roadmap, setRoadmap] = useState<LearningRoadmapDetail | null>(null);
  const [lesson, setLesson] = useState<LearningLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);

  const reload = async () => {
    const data = await learningPathService.getRoadmap(roadmapId);
    const found = data.milestones.flatMap((item) => item.lessons).find((item) => item.id === lessonId);
    setRoadmap(data);
    setLesson(found ?? null);
    setError(!found);
  };

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void learningPathService
      .getRoadmap(roadmapId)
      .then((data) => {
        if (!active) return;
        const found = data.milestones.flatMap((item) => item.lessons).find((item) => item.id === lessonId);
        setRoadmap(data);
        setLesson(found ?? null);
        setError(!found);
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
  }, [lessonId, roadmapId]);

  const handleComplete = async () => {
    if (!lesson || lesson.theoryStatus === 'completed' || roadmap?.readOnly) return;
    setIsSaving(true);
    try {
      await learningPathService.markTheoryCompleted(roadmapId, lessonId);
      await reload();
    } catch {
      setError(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('practice.learningPath.loading')}</span>
      </div>
    );
  }

  if (error || !lesson || !roadmap) {
    return <p className="page-container page-section text-sm text-error">{t('practice.learningPath.error')}</p>;
  }

  const title = language === 'vi' ? lesson.titleVi : lesson.title;
  const html = language === 'vi' ? lesson.contentVi : lesson.content;
  const isCompleted = lesson.theoryStatus === 'completed' || roadmap.readOnly;

  return (
    <div className="min-h-full overflow-y-auto bg-surface-base">
      <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Link
          to={`/candidate/learning/roadmaps/${roadmapId}`}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          {t('practice.learningPath.backToRoadmap')}
        </Link>

        <header className="mt-5 space-y-2 border-b border-subtle pb-6">
          <p className="text-caption text-muted-foreground">{t('practice.learningPath.theory')}</p>
          <h1 className="heading-primary text-3xl text-foreground sm:text-4xl">{title}</h1>
        </header>

        <article className="frame-satin mt-8 rounded-2xl border border-subtle bg-surface-raised p-6 sm:p-8 lg:p-10">
          <LessonHtmlContent html={html} />
        </article>

        <div className="mt-8 flex justify-start border-t border-subtle pt-6">
          {isCompleted ? (
            <p className="inline-flex items-center gap-2 rounded-xl border border-subtle bg-surface-overlay px-4 py-2.5 text-sm font-medium text-foreground">
              <Check className="size-4 text-success" aria-hidden />
              {t('practice.learningPath.theoryCompleted')}
            </p>
          ) : (
            <button
              type="button"
              className="btn-primary"
              disabled={isSaving || lesson.theoryStatus === 'locked'}
              onClick={() => void handleComplete()}
            >
              {isSaving ? t('practice.learningPath.saving') : t('practice.learningPath.markCompleted')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
