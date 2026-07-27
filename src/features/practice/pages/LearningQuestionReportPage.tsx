import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { QuestionFeedbackReport } from '../components/learning-path/QuestionFeedbackReport';
import {
  advanceLearningQuestion,
  getLearningAnswerByQuestionId,
  getLearningPracticeSession,
  isLastLearningQuestion,
} from '../services/learningPracticeSession.registry';
import { roadmapPracticeService } from '../services/roadmapPractice.service';
import {
  invalidateLearningRoadmapDetail,
  invalidateLearningRoadmaps,
} from '../hooks/useLearningRoadmaps';

function sessionReportPath(roadmapId: string, lessonId: string, sessionId: string) {
  return `/candidate/learning/roadmaps/${roadmapId}/lessons/${lessonId}/report?sessionId=${encodeURIComponent(sessionId)}`;
}

export function LearningQuestionReportPage() {
  const { roadmapId = '', lessonId = '', questionId = '' } = useParams();
  const [params] = useSearchParams();
  const sessionId = params.get('sessionId') ?? '';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language, t } = useLanguage();
  const [isContinuing, setIsContinuing] = useState(false);
  const [completeError, setCompleteError] = useState(false);
  const inFlightRef = useRef(false);

  const entry = useMemo(() => {
    if (!sessionId || !questionId) return undefined;
    return getLearningAnswerByQuestionId(sessionId, questionId);
  }, [questionId, sessionId]);

  const meta = sessionId ? getLearningPracticeSession(sessionId) : undefined;
  const questionNumber = meta
    ? meta.questions.findIndex((item) => item.id === questionId) + 1
    : 0;
  const isLast = sessionId && questionId ? isLastLearningQuestion(sessionId, questionId) : false;

  const handleContinue = () => {
    if (!sessionId || inFlightRef.current || isContinuing) return;
    inFlightRef.current = true;
    setIsContinuing(true);
    advanceLearningQuestion(sessionId);
    navigate(`/interview/${sessionId}/room`, { replace: true });
  };

  const handleCompletePractice = async () => {
    if (!sessionId || !roadmapId || !lessonId || inFlightRef.current || isContinuing) return;
    inFlightRef.current = true;
    setIsContinuing(true);
    setCompleteError(false);
    try {
      await roadmapPracticeService.completePracticeSession(sessionId);
      await Promise.all([
        invalidateLearningRoadmapDetail(queryClient, roadmapId),
        invalidateLearningRoadmaps(queryClient),
      ]);
      navigate(sessionReportPath(roadmapId, lessonId, sessionId), { replace: true });
    } catch {
      setCompleteError(true);
      inFlightRef.current = false;
      setIsContinuing(false);
    }
  };

  if (!sessionId || !entry) {
    return (
      <div className="page-container page-section space-y-4 py-8">
        <p className="text-sm text-error">{t('practice.learningPath.questionReportMissing')}</p>
        <Link
          to={`/candidate/learning/roadmaps/${roadmapId}/lessons/${lessonId}/theory`}
          className="btn-secondary inline-flex"
        >
          {t('practice.learningPath.backToTheory')}
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container page-section min-h-full space-y-6 py-8">
      <header className="space-y-2">
        <h1 className="heading-primary text-3xl text-foreground">
          {t('practice.learningPath.questionReportTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('practice.learningPath.questionReportSubtitle')}</p>
      </header>

      <QuestionFeedbackReport
        feedback={entry.feedback}
        language={language}
        prompt={entry.prompt}
        promptVi={entry.promptVi}
        questionNumber={questionNumber > 0 ? questionNumber : undefined}
        transcript={entry.transcript}
        scoringStatus={entry.scoringStatus}
      />

      <div className="flex flex-wrap gap-3 border-t border-subtle pt-6">
        {isLast ? (
          <button
            type="button"
            className="btn-primary inline-flex items-center gap-2"
            disabled={isContinuing}
            onClick={() => void handleCompletePractice()}
          >
            {isContinuing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {isContinuing
              ? t('practice.learningPath.completing')
              : t('practice.learningPath.viewSessionReport')}
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary inline-flex items-center gap-2"
            disabled={isContinuing}
            onClick={handleContinue}
          >
            {isContinuing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {t('practice.learningPath.nextQuestion')}
          </button>
        )}
        <Link to={`/candidate/learning/roadmaps/${roadmapId}`} className="btn-secondary inline-flex">
          {t('practice.learningPath.backToRoadmap')}
        </Link>
      </div>

      {completeError ? (
        <p className="text-sm text-error" role="alert">
          {t('practice.learningPath.completeSessionError')}
        </p>
      ) : null}
    </div>
  );
}
