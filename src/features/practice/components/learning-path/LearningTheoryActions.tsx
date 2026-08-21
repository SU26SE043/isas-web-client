import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { useTokenWallet } from '@/features/payment/hooks/useTokenWallet';
import type { LearningRoadmapDetail } from '../../types/learningPath.types';
import type { OpenedLearningLesson } from '../../utils/roadmapMapper';
import {
  learningInterviewPreparePath,
  startLearningLessonPractice,
} from '../../utils/launchLearningInterviewPractice';
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
  const [creditOpen, setCreditOpen] = useState(false);
  const [startError, setStartError] = useState(false);
  const { available: creditsRemaining } = useTokenWallet();

  const nextLesson = findNextLesson(roadmap, opened.id);
  const isDone = opened.apiStatus === 'Done';
  const title = language === 'vi' ? opened.titleVi : opened.title;
  const canChoosePractice = theoryMarkedComplete || isDone;

  const handleMarkCompleted = () => {
    setTheoryMarkedComplete(true);
  };

  const handleEnterInterviewPractice = async (bypassCreditWarning = false) => {
    if (isOpening) return;
    if (!opened.sessionId && !bypassCreditWarning && (creditsRemaining ?? 0) < 1) {
      setCreditOpen(true);
      return;
    }
    setIsOpening(true);
    setStartError(false);

    if (opened.sessionId) {
      navigate(learningInterviewPreparePath(opened.sessionId, { roadmapId: roadmap.id, lessonId: opened.id }));
      setIsOpening(false);
      return;
    }

    try {
      const result = await startLearningLessonPractice({
        roadmapId: roadmap.id,
        lessonId: opened.id,
        title,
      });
      if (!result.ok) {
        if (result.code === 'insufficient_credits') {
          setCreditOpen(true);
          return;
        }
        if (result.code === 'ai_failed') {
          toast.error(t('practice.learningPath.lessonAiErrorToast'));
        } else if (result.code === 'forbidden') {
          toast.error(t('practice.learningPath.errorForbidden'));
        } else if (result.code === 'not_found') {
          toast.error(t('practice.learningPath.errorNotFound'));
        } else {
          toast.error(t('practice.learningPath.startError'));
        }
        setStartError(true);
        return;
      }
      if (result.resumed) {
        toast.success(t('practice.learningPath.sessionResumed'));
      }
      navigate(learningInterviewPreparePath(result.session.sessionId, { roadmapId: roadmap.id, lessonId: opened.id }));
    } catch {
      setStartError(true);
      toast.error(t('practice.learningPath.startError'));
    } finally {
      setIsOpening(false);
    }
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
              onClick={() => void handleEnterInterviewPractice()}
            >
              {isOpening ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {isOpening
                ? t('practice.learningPath.startingPractice')
                : t('practice.learningPath.practiceWithInterviewRoom')}
            </button>
          ) : null}
          {startError ? (
            <p className="w-full text-sm text-error" role="alert">
              {t('practice.learningPath.startError')}
            </p>
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

      <Dialog open={creditOpen} onOpenChange={setCreditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('practice.learningPath.insufficientCreditsTitle')}</DialogTitle>
            <DialogDescription>
              {t('practice.learningPath.creditWarningDescription')
                .replace('{cost}', '1')
                .replace('{balance}', (creditsRemaining ?? 0).toLocaleString())}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setCreditOpen(false)}>
              {t('practice.learningPath.keepLearning')}
            </Button>
            <Link to="/candidate/credits" className="btn-primary inline-flex">
              {t('practice.learningPath.buyCredits')}
            </Link>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setCreditOpen(false);
                void handleEnterInterviewPractice(true);
              }}
            >
              {t('practice.learningPath.continueAnyway')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
