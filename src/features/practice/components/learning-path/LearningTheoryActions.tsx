import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { LearningLesson, LearningRoadmapDetail } from '../../types/learningPath.types';
import {
  launchLearningInterviewPractice,
  learningInterviewPreparePath,
} from '../../utils/launchLearningInterviewPractice';
import { findNextLesson, theoryPath } from '../../utils/learningPathNavigation';

interface LearningTheoryActionsProps {
  roadmap: LearningRoadmapDetail;
  lesson: LearningLesson;
  onMarkedComplete: () => Promise<void>;
  markComplete: () => Promise<void>;
}

export function LearningTheoryActions({
  roadmap,
  lesson,
  onMarkedComplete,
  markComplete,
}: LearningTheoryActionsProps) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const isCompleted = lesson.theoryStatus === 'completed' || roadmap.readOnly;
  const nextLesson = findNextLesson(roadmap, lesson.id);
  const canPractice =
    !roadmap.readOnly &&
    (lesson.practiceStatus === 'available' ||
      (lesson.theoryStatus === 'completed' && lesson.practiceStatus !== 'locked'));
  const practiceDone = lesson.practiceStatus === 'completed';

  const handleComplete = async () => {
    if (isCompleted || lesson.theoryStatus === 'locked') return;
    setIsSaving(true);
    try {
      await markComplete();
      await onMarkedComplete();
      setJustCompleted(true);
      window.setTimeout(() => setJustCompleted(false), 1600);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePractice = async () => {
    setIsLaunching(true);
    try {
      const title = language === 'vi' ? lesson.titleVi : lesson.title;
      const sessionId = await launchLearningInterviewPractice({
        roadmapId: roadmap.id,
        lessonId: lesson.id,
        title,
      });
      navigate(learningInterviewPreparePath(sessionId));
    } catch {
      setIsLaunching(false);
    }
  };

  if (!isCompleted) {
    return (
      <div className="mt-8 flex justify-start border-t border-subtle pt-6">
        <button
          type="button"
          className="btn-primary"
          disabled={isSaving || lesson.theoryStatus === 'locked'}
          onClick={() => void handleComplete()}
        >
          {isSaving ? t('practice.learningPath.saving') : t('practice.learningPath.markCompleted')}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3 border-t border-subtle pt-6">
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border border-subtle bg-surface-overlay px-4 py-2.5 text-sm font-medium text-foreground transition',
          justCompleted && 'scale-[1.02] border-success/40 bg-success/10 text-success',
        )}
        role="status"
      >
        <Check className="size-4 text-success" aria-hidden />
        {t('practice.learningPath.theoryCompleted')}
      </div>

      <div className="flex flex-wrap gap-3">
        {canPractice && !practiceDone ? (
          <button
            type="button"
            className="btn-primary inline-flex items-center gap-2"
            disabled={isLaunching}
            onClick={() => void handlePractice()}
          >
            {isLaunching ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : null}
            {isLaunching
              ? t('practice.learningPath.saving')
              : t('practice.learningPath.continueToPractice')}
          </button>
        ) : null}

        {practiceDone && nextLesson ? (
          <Link
            to={theoryPath(roadmap.id, nextLesson.id)}
            className="btn-primary inline-flex"
          >
            {t('practice.learningPath.nextLesson')}
          </Link>
        ) : null}

        {!canPractice && !practiceDone && nextLesson ? (
          <Link
            to={theoryPath(roadmap.id, nextLesson.id)}
            className="btn-primary inline-flex"
          >
            {t('practice.learningPath.nextLesson')}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
