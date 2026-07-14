import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { learningPathService } from '../services/learningPath.service';
import type { LearningLesson, LearningRoadmapDetail } from '../types/learningPath.types';

export function LearningTheoryPage() {
  const { roadmapId = '', lessonId = '' } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [roadmap, setRoadmap] = useState<LearningRoadmapDetail | null>(null);
  const [lesson, setLesson] = useState<LearningLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
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
      navigate(
        `/candidate/learning/roadmaps/${roadmapId}/lessons/${lessonId}/practice/device-check`,
      );
    } catch {
      setError(true);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (error || !lesson || !roadmap) {
    return <p className="page-container page-section text-sm text-error">{t('practice.learningPath.error')}</p>;
  }

  const title = language === 'vi' ? lesson.titleVi : lesson.title;

  return (
    <div className="page-container page-section min-h-screen">
      <Link
        to={`/candidate/learning/roadmaps/${roadmapId}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {t('practice.learningPath.backToRoadmap')}
      </Link>

      <header className="mt-4 space-y-1">
        <p className="text-caption text-muted-foreground">{t('practice.learningPath.theory')}</p>
        <h1 className="heading-primary text-3xl text-foreground">{title}</h1>
      </header>

      <div className="mt-6 overflow-hidden rounded-xl border border-subtle bg-surface-raised">
        <iframe
          title={title}
          srcDoc={`<!doctype html><html><body style="font-family:system-ui;padding:24px;background:#0c0c0e;color:#e8e8ea;line-height:1.6"><h1>${title}</h1><p>${language === 'vi' ? 'Nội dung lý thuyết được tải từ Learning Content URL do backend cung cấp.' : 'Theory content is loaded from the Learning Content URL provided by the backend.'}</p><p style="opacity:.7">${lesson.contentUrl}</p></body></html>`}
          className="h-[420px] w-full bg-surface-base"
          sandbox="allow-same-origin"
        />
        <p className="border-t border-subtle px-4 py-3 text-caption text-muted-foreground">
          {t('practice.learningPath.contentUrlHint')} · {lesson.contentUrl}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {lesson.theoryStatus !== 'completed' && !roadmap.readOnly ? (
          <button
            type="button"
            className="btn-primary"
            disabled={isSaving || lesson.theoryStatus === 'locked'}
            onClick={() => void handleComplete()}
          >
            {isSaving ? t('practice.learningPath.saving') : t('practice.learningPath.markCompleted')}
          </button>
        ) : (
          <Link
            to={`/candidate/learning/roadmaps/${roadmapId}/lessons/${lessonId}/practice/device-check`}
            className="btn-primary inline-flex"
          >
            {t('practice.learningPath.openPractice')}
          </Link>
        )}
      </div>
    </div>
  );
}
