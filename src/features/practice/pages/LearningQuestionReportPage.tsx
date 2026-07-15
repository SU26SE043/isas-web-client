import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { QuestionFeedbackReport } from '../components/learning-path/QuestionFeedbackReport';
import {
  advanceLearningQuestion,
  getLearningAnswerByQuestionId,
  getLearningPracticeSession,
} from '../services/learningPracticeSession.registry';

export function LearningQuestionReportPage() {
  const { roadmapId = '', lessonId = '', questionId = '' } = useParams();
  const [params] = useSearchParams();
  const sessionId = params.get('sessionId') ?? '';
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [isContinuing, setIsContinuing] = useState(false);

  const entry = useMemo(() => {
    if (!sessionId || !questionId) return undefined;
    return getLearningAnswerByQuestionId(sessionId, questionId);
  }, [questionId, sessionId]);

  const meta = sessionId ? getLearningPracticeSession(sessionId) : undefined;
  const questionNumber = meta
    ? meta.questions.findIndex((item) => item.id === questionId) + 1
    : 0;

  const handleContinue = () => {
    if (!sessionId || isContinuing) return;
    setIsContinuing(true);
    advanceLearningQuestion(sessionId);
    navigate(`/interview/${sessionId}/room`, { replace: true });
  };

  if (!sessionId || !entry) {
    return (
      <div className="page-container page-section space-y-4 py-8">
        <p className="text-sm text-error">{t('practice.learningPath.questionReportMissing')}</p>
        <Link
          to={`/candidate/learning/roadmaps/${roadmapId}/lessons/${lessonId}/practice/device-check`}
          className="btn-secondary inline-flex"
        >
          {t('practice.learningPath.startPractice')}
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
      />

      <div className="flex flex-wrap gap-3 border-t border-subtle pt-6">
        <button
          type="button"
          className="btn-primary inline-flex items-center gap-2"
          disabled={isContinuing}
          onClick={handleContinue}
        >
          {isContinuing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {t('practice.learningPath.continueAfterReport')}
        </button>
        <Link to={`/candidate/learning/roadmaps/${roadmapId}`} className="btn-secondary inline-flex">
          {t('practice.learningPath.backToRoadmap')}
        </Link>
      </div>
    </div>
  );
}
