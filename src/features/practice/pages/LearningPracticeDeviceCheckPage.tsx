import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { learningPathService } from '../services/learningPath.service';
import {
  launchLearningInterviewPractice,
  learningInterviewPreparePath,
} from '../utils/launchLearningInterviewPractice';

/**
 * Legacy Learning device-check route — redirects into the shared interview prepare flow
 * (same Device Check / Waiting / Room UI as B2C & B2B).
 */
export function LearningPracticeDeviceCheckPage() {
  const { roadmapId = '', lessonId = '' } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const roadmap = await learningPathService.getRoadmap(roadmapId);
        const lesson = roadmap.milestones
          .flatMap((item) => item.lessons)
          .find((item) => item.id === lessonId);
        if (!lesson) throw new Error('LESSON_NOT_FOUND');
        const title = language === 'vi' ? lesson.titleVi : lesson.title;
        const sessionId = await launchLearningInterviewPractice({
          roadmapId,
          lessonId,
          title,
        });
        if (!active) return;
        navigate(learningInterviewPreparePath(sessionId), { replace: true });
      } catch {
        if (active) setError(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [language, lessonId, navigate, roadmapId]);

  if (error) {
    return (
      <div className="page-container page-section">
        <p className="text-sm text-error">{t('practice.learningPath.error')}</p>
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={() => navigate(`/candidate/learning/roadmaps/${roadmapId}`)}
        >
          {t('practice.learningPath.backToRoadmap')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">{t('practice.learningPath.startPractice')}</p>
    </div>
  );
}
