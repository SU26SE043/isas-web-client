import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { LearningRoadmapDetail } from '../../types/learningPath.types';
import type { OpenedLearningLesson } from '../../utils/roadmapMapper';
import { learningInterviewPreparePath } from '../../utils/launchLearningInterviewPractice';
import { openLocalLearningPracticeSession } from '../../services/learningPracticeSession.registry';
import { findNextLesson, theoryPath } from '../../utils/learningPathNavigation';

interface LearningTheoryActionsProps {
  roadmap: LearningRoadmapDetail;
  opened: OpenedLearningLesson;
}

export function LearningTheoryActions({ roadmap, opened }: LearningTheoryActionsProps) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [theoryMarkedComplete, setTheoryMarkedComplete] = useState(
    opened.theoryStatus === 'completed' ||
      opened.apiStatus === 'Practicing' ||
      opened.apiStatus === 'Done',
  );
  const [isOpening, setIsOpening] = useState(false);

  const nextLesson = findNextLesson(roadmap, opened.id);
  const isDone = opened.apiStatus === 'Done';
  const title = language === 'vi' ? opened.titleVi : opened.title;
  const canChoosePractice = theoryMarkedComplete || isDone;

  /** Only unlocks the practice CTA — no API, no navigation. */
  const handleMarkCompleted = () => {
    setTheoryMarkedComplete(true);
  };

  /** Candidate chooses to enter the shared interview room. */
  const handleEnterInterviewPractice = () => {
    if (isOpening) return;
    setIsOpening(true);
    if (opened.sessionId) {
      navigate(learningInterviewPreparePath(opened.sessionId));
      return;
    }
    const meta = openLocalLearningPracticeSession({
      roadmapId: roadmap.id,
      lessonId: opened.id,
      title,
    });
    navigate(learningInterviewPreparePath(meta.sessionId));
  };

  return (
    <div className="mt-8 space-y-4 border-t border-subtle pt-6">
      {theoryMarkedComplete ? (
        <div
          className="inline-flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm font-medium text-success"
          role="status"
        >
          <Check className="size-4" aria-hidden />
          {isDone
            ? t('practice.learningPath.lessonDone')
            : t('practice.learningPath.theoryCompleted')}
        </div>
      ) : null}

      {!theoryMarkedComplete ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary inline-flex items-center gap-2"
            onClick={handleMarkCompleted}
          >
            {t('practice.learningPath.markCompleted')}
          </button>
          <Link
            to={`/candidate/learning/roadmaps/${roadmap.id}`}
            className="btn-secondary inline-flex"
          >
            {t('practice.learningPath.backToRoadmap')}
          </Link>
        </div>
      ) : null}

      {canChoosePractice ? (
        <div className="flex flex-wrap gap-3">
          {!isDone ? (
            <button
              type="button"
              className="btn-primary inline-flex items-center gap-2"
              disabled={isOpening}
              onClick={handleEnterInterviewPractice}
            >
              {isOpening ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {isOpening
                ? t('practice.learningPath.startingPractice')
                : t('practice.learningPath.practiceWithInterviewRoom')}
            </button>
          ) : null}
          {isDone && nextLesson ? (
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
      ) : null}
    </div>
  );
}
