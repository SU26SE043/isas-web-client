import { Link, useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/shared/languages';
import type { LearningRoadmapDetail } from '../../types/learningPath.types';
import type { OpenedLearningLesson } from '../../utils/roadmapMapper';
import {
  launchLearningInterviewPractice,
  learningInterviewPreparePath,
} from '../../utils/launchLearningInterviewPractice';
import { findNextLesson, theoryPath } from '../../utils/learningPathNavigation';

interface LearningTheoryActionsProps {
  roadmap: LearningRoadmapDetail;
  opened: OpenedLearningLesson;
}

export function LearningTheoryActions({ roadmap, opened }: LearningTheoryActionsProps) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = useState(false);

  const nextLesson = findNextLesson(roadmap, opened.id);
  const isDone = opened.apiStatus === 'Done';
  const isPracticing = opened.apiStatus === 'Practicing';

  const handlePractice = async () => {
    setIsLaunching(true);
    try {
      if (opened.sessionId) {
        navigate(learningInterviewPreparePath(opened.sessionId));
        return;
      }
      const title = language === 'vi' ? opened.titleVi : opened.title;
      const sessionId = await launchLearningInterviewPractice({
        roadmapId: roadmap.id,
        lessonId: opened.id,
        title,
      });
      navigate(learningInterviewPreparePath(sessionId));
    } catch {
      setIsLaunching(false);
    }
  };

  if (isPracticing) {
    return (
      <div className="mt-8 flex flex-wrap gap-3 border-t border-subtle pt-6">
        <button
          type="button"
          className="btn-primary inline-flex items-center gap-2"
          disabled={isLaunching}
          onClick={() => void handlePractice()}
        >
          {isLaunching ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {isLaunching
            ? t('practice.learningPath.saving')
            : t('practice.learningPath.continuePracticeSession')}
        </button>
        {nextLesson ? (
          <Link to={theoryPath(roadmap.id, nextLesson.id)} className="btn-secondary inline-flex">
            {t('practice.learningPath.nextLesson')}
          </Link>
        ) : null}
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="mt-8 space-y-3 border-t border-subtle pt-6">
        <div
          className="inline-flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm font-medium text-success"
          role="status"
        >
          <Check className="size-4" aria-hidden />
          {t('practice.learningPath.lessonDone')}
        </div>
        <div className="flex flex-wrap gap-3">
          {nextLesson ? (
            <Link to={theoryPath(roadmap.id, nextLesson.id)} className="btn-primary inline-flex">
              {t('practice.learningPath.nextLesson')}
            </Link>
          ) : null}
          <Link
            to={`/candidate/learning/roadmaps/${roadmap.id}`}
            className="btn-secondary inline-flex"
          >
            {t('practice.learningPath.backToRoadmap')}
          </Link>
        </div>
      </div>
    );
  }

  // Theory — content is the focus; practice unlocks after backend moves status.
  return (
    <div className="mt-8 flex flex-wrap gap-3 border-t border-subtle pt-6">
      {opened.practiceStatus === 'available' || opened.sessionId ? (
        <button
          type="button"
          className="btn-primary inline-flex items-center gap-2"
          disabled={isLaunching}
          onClick={() => void handlePractice()}
        >
          {isLaunching ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {isLaunching
            ? t('practice.learningPath.saving')
            : t('practice.learningPath.continueToPractice')}
        </button>
      ) : null}
      <Link to={`/candidate/learning/roadmaps/${roadmap.id}`} className="btn-secondary inline-flex">
        {t('practice.learningPath.backToRoadmap')}
      </Link>
    </div>
  );
}
