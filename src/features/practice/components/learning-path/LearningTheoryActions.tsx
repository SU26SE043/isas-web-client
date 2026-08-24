import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, Loader2, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { useTokenWallet } from '@/features/payment/hooks/useTokenWallet';
import type { LearningRoadmapDetail } from '../../types/learningPath.types';
import type { OpenedLearningLesson } from '../../utils/roadmapMapper';
import {
  learningInterviewPreparePath,
  startLearningLessonPractice,
} from '../../utils/launchLearningInterviewPractice';
import { findNextLesson, theoryPath } from '../../utils/learningPathNavigation';
import { LearningCreditWarningDialog } from './LearningCreditWarningDialog';
import { LessonRetryConfirmDialog } from './LessonRetryConfirmDialog';
import { useLessonRetry } from '../../hooks/useLessonRetry';

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
  const [creditRejected, setCreditRejected] = useState(false);
  const { available: creditsRemaining } = useTokenWallet();

  // Luyện LẠI bài đã xong. Nút nằm ở ĐÂY (trang chi tiết bài) chứ không ở danh sách
  // chặng: ngoài danh sách mỗi bài đã có sẵn hai nút, thêm nút thứ ba làm hàng nút
  // tràn và rối, trong khi thao tác này tiêu credit nên đáng để người học mở bài ra
  // đọc lại trước khi quyết định.
  const retry = useLessonRetry({
    roadmapId: roadmap.id,
    onStarted: (sessionId, lessonId) =>
      navigate(learningInterviewPreparePath(sessionId, { roadmapId: roadmap.id, lessonId })),
  });

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
      setCreditRejected(false);
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
          setCreditRejected(true);
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
          {isDone && opened.canRetry ? (
            <button
              type="button"
              className="btn-secondary inline-flex items-center gap-2"
              disabled={retry.pendingLessonId !== null}
              onClick={() => retry.ask(opened.id, title)}
            >
              <RotateCcw className="size-4" aria-hidden />
              {retry.pendingLessonId !== null
                ? t('practice.learningPath.retryStarting')
                : t('practice.learningPath.retryLesson')}
              {/* Báo giá TRƯỚC khi bấm, không đợi server trả 402. */}
              <span className="text-caption text-muted-foreground">
                {t('practice.learningPath.retryCostHint')}
              </span>
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

      {opened.attemptCount > 1 ? (
        <p className="text-caption text-muted-foreground">
          {t('practice.learningPath.attemptCount').replace('{count}', String(opened.attemptCount))}
        </p>
      ) : null}

      <LessonRetryConfirmDialog {...retry.dialogProps} balance={creditsRemaining ?? 0} />

      <LearningCreditWarningDialog
        open={creditOpen}
        onOpenChange={setCreditOpen}
        balance={creditsRemaining ?? 0}
        backendRejected={creditRejected}
        onContinue={() => {
          setCreditOpen(false);
          setCreditRejected(false);
          void handleEnterInterviewPractice(true);
        }}
      />
    </div>
  );
}
