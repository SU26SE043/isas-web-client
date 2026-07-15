import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';

/**
 * Legacy custom Learning practice UI removed — send users back to device-check launcher
 * which opens the shared interview room (`/interview/:sessionId/...`).
 */
export function LearningLessonPracticePage() {
  const { roadmapId = '', lessonId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    navigate(
      `/candidate/learning/roadmaps/${roadmapId}/lessons/${lessonId}/practice/device-check`,
      { replace: true },
    );
  }, [lessonId, navigate, roadmapId]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      <p className="sr-only">{t('practice.learningPath.startPractice')}</p>
    </div>
  );
}
